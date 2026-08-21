const fs = require('fs');
const path = require('path');
const Diagnosis = require('../models/Diagnosis');
const Appointment = require('../models/Appointment');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');
const { analyzeXray } = require('../utils/aiService');
const logger = require('../utils/logger');
const axios = require('axios');

const normalizeDetection = (detection) => ({
  classId: detection.classId ?? detection.class_id,
  className: detection.className ?? detection.class_name,
  confidence: detection.confidence,
  bbox: detection.bbox,
});

const normalizeSummary = (summary, detections = []) => ({
  totalFindings:
    summary?.totalFindings ?? summary?.total_findings ?? detections.length,
  conditionsFound:
    summary?.conditionsFound ?? summary?.conditions_found ?? [],
  urgentFindings:
    summary?.urgentFindings ?? summary?.urgent_findings ?? [],
  averageConfidence:
    summary?.averageConfidence ?? summary?.average_confidence ?? 0,
});

// @desc    Dentist uploads a patient's X-ray -> runs AI -> stores result
// @route   POST /api/diagnoses
// @access  Private (dentist)
// @desc    Dentist uploads a patient's X-ray -> runs AI -> stores result
// @route   POST /api/diagnoses
// @access  Private (dentist)
const uploadXrayAndAnalyze = async (req, res, next) => {
  let localFilePath = null;
  let cleanupTempFile = false;

  try {
    // ---------------------------------------------------------
    // 1. Validate patient
    // ---------------------------------------------------------
    const { patientId, appointmentId } = req.body || {};

    if (!patientId) {
      return res.status(400).json({
        success: false,
        message: 'patientId is required',
      });
    }

    // ---------------------------------------------------------
    // 2. Log what the server actually received
    // ---------------------------------------------------------
    logger.info(
      'Upload request:',
      {
        hasFile: !!req.file,
        filePath: req.file?.path || null,
        fileName: req.file?.originalname || null,
        mimeType: req.file?.mimetype || null,
        bodyKeys: Object.keys(req.body || {}),
        contentType: req.headers['content-type'],
      }
    );

    // ---------------------------------------------------------
    // 3. Handle multipart file upload
    // ---------------------------------------------------------
    if (req.file) {
      localFilePath = req.file.path;
      cleanupTempFile = true;
    }

    // ---------------------------------------------------------
    // 4. Fallback: handle base64 JSON upload
    // ---------------------------------------------------------
    else {
      const xrayDataUri = req.body?.xrayDataUri;

      if (
        typeof xrayDataUri !== 'string' ||
        xrayDataUri.trim().length === 0
      ) {
        return res.status(400).json({
          success: false,
          message: 'X-ray image file is required',
        });
      }

      let base64Payload = xrayDataUri;

      if (xrayDataUri.includes('base64,')) {
        base64Payload = xrayDataUri.split('base64,')[1];
      }

      if (!base64Payload) {
        return res.status(400).json({
          success: false,
          message: 'Invalid X-ray base64 data',
        });
      }

      const mimeType =
        req.body?.xrayMimeType ||
        req.body?.mimeType ||
        'image/jpeg';

      const extension =
        mimeType.split('/')[1]?.split(';')[0] || 'jpg';

      localFilePath = path.join(
        __dirname,
        '..',
        'uploads',
        `xray-${Date.now()}-${Math.round(Math.random() * 1e9)}.${extension}`
      );

      fs.writeFileSync(
        localFilePath,
        Buffer.from(base64Payload, 'base64')
      );

      cleanupTempFile = true;
    }

    // ---------------------------------------------------------
    // 5. Make sure the file actually exists
    // ---------------------------------------------------------
    if (!localFilePath || !fs.existsSync(localFilePath)) {
      return res.status(400).json({
        success: false,
        message: 'X-ray file could not be processed',
      });
    }

    // ---------------------------------------------------------
    // 6. Run AI inference
    // ---------------------------------------------------------
    logger.info('Starting AI analysis:', localFilePath);

    const aiResult = await analyzeXray(localFilePath);

    if (!aiResult?.success) {
      return res.status(502).json({
        success: false,
        message: 'AI analysis failed',
        error: aiResult?.message || undefined,
      });
    }

    // ---------------------------------------------------------
    // 7. Normalize AI detections
    // ---------------------------------------------------------
    const normalizedDetections = Array.isArray(aiResult.detections)
      ? aiResult.detections.map(normalizeDetection)
      : [];

    const normalizedSummary = normalizeSummary(
      aiResult.summary,
      normalizedDetections
    );

    // ---------------------------------------------------------
    // 8. Upload original X-ray to Cloudinary
    // ---------------------------------------------------------
    const originalUpload = await uploadToCloudinary(
      localFilePath,
      'dentai/xrays/original'
    );

    // ---------------------------------------------------------
    // 9. Upload annotated image from AI service
    // ---------------------------------------------------------
    const AI_SERVICE_URL =
      process.env.AI_SERVICE_URL || 'http://localhost:8000';

    let annotatedUpload = null;

    if (aiResult.annotated_image_path) {
      const annotatedUrl =
        `${AI_SERVICE_URL}${aiResult.annotated_image_path}`;

      try {
        const imgResponse = await axios.get(
          annotatedUrl,
          {
            responseType: 'arraybuffer',
          }
        );

        const tmpAnnotatedPath =
          `${localFilePath}-annotated.jpg`;

        fs.writeFileSync(
          tmpAnnotatedPath,
          imgResponse.data
        );

        annotatedUpload = await uploadToCloudinary(
          tmpAnnotatedPath,
          'dentai/xrays/annotated'
        );

        fs.unlink(tmpAnnotatedPath, () => {});
      } catch (e) {
        logger.warn(
          'Could not fetch/upload annotated image:',
          e.message
        );
      }
    }

    // ---------------------------------------------------------
    // 10. Save diagnosis
    // ---------------------------------------------------------
    const diagnosis = await Diagnosis.create({
      patient: patientId,
      dentist: req.user._id,
      appointment: appointmentId || undefined,

      xrayImage: originalUpload,

      annotatedImage: annotatedUpload || {
        url: aiResult.annotated_image_path
          ? `${AI_SERVICE_URL}${aiResult.annotated_image_path}`
          : null,
        publicId: null,
      },

      aiDetections: normalizedDetections,

      aiSummary: normalizedSummary,

      status: 'pending_review',
    });

    // ---------------------------------------------------------
    // 11. Mark appointment completed
    // ---------------------------------------------------------
    if (appointmentId) {
      await Appointment.findByIdAndUpdate(
        appointmentId,
        {
          status: 'completed',
        }
      );
    }

    // ---------------------------------------------------------
    // 12. Delete temporary uploaded file
    // ---------------------------------------------------------
    if (
      cleanupTempFile &&
      localFilePath &&
      fs.existsSync(localFilePath)
    ) {
      fs.unlink(localFilePath, (err) => {
        if (err) {
          logger.warn(
            'Could not delete temporary X-ray:',
            err.message
          );
        }
      });
    }

    // ---------------------------------------------------------
    // 13. Response
    // ---------------------------------------------------------
    return res.status(201).json({
      success: true,
      diagnosis,
    });

  } catch (error) {
    // ---------------------------------------------------------
    // Cleanup if something fails
    // ---------------------------------------------------------
    if (
      cleanupTempFile &&
      localFilePath &&
      fs.existsSync(localFilePath)
    ) {
      fs.unlink(localFilePath, () => {});
    }

    logger.error(
      'X-ray upload/analysis error:',
      error
    );

    next(error);
  }
};

// @desc    Dentist reviews & confirms/edits an AI diagnosis
// @route   PUT /api/diagnoses/:id/review
// @access  Private (dentist)
const reviewDiagnosis = async (req, res, next) => {
  try {
    const { confirmed, notes, modifiedDetections, status } = req.body;

    const diagnosis = await Diagnosis.findById(req.params.id);
    if (!diagnosis) {
      return res.status(404).json({ success: false, message: 'Diagnosis not found' });
    }
    if (!diagnosis.dentist.equals(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Not authorized to review this diagnosis' });
    }

    diagnosis.dentistReview = {
      confirmed: confirmed ?? diagnosis.dentistReview?.confirmed ?? false,
      notes: notes ?? diagnosis.dentistReview?.notes,
      modifiedDetections: modifiedDetections ?? diagnosis.dentistReview?.modifiedDetections,
      reviewedAt: new Date(),
    };
    diagnosis.status = status || (confirmed ? 'confirmed' : 'pending_review');

    await diagnosis.save();

    res.status(200).json({ success: true, diagnosis });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single diagnosis (with populated patient/dentist)
// @route   GET /api/diagnoses/:id
// @access  Private
const getDiagnosis = async (req, res, next) => {
  try {
    const diagnosis = await Diagnosis.findById(req.params.id)
      .populate('patient', 'name email phone avatar medicalProfile')
      .populate('dentist', 'name email phone avatar dentistProfile');

    if (!diagnosis) {
      return res.status(404).json({ success: false, message: 'Diagnosis not found' });
    }

    const isOwner =
      diagnosis.patient._id.equals(req.user._id) || diagnosis.dentist._id.equals(req.user._id);
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.status(200).json({ success: true, diagnosis });
  } catch (error) {
    next(error);
  }
};

// @desc    List diagnoses for logged-in user (patient sees own, dentist sees ones they made)
// @route   GET /api/diagnoses
// @access  Private
const getMyDiagnoses = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter =
      req.user.role === 'dentist' ? { dentist: req.user._id } : { patient: req.user._id };
    if (status) filter.status = status;

    const diagnoses = await Diagnosis.find(filter)
      .populate('patient', 'name email avatar')
      .populate('dentist', 'name email avatar dentistProfile.specialization')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: diagnoses.length, diagnoses });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a diagnosis (cleans up Cloudinary assets too)
// @route   DELETE /api/diagnoses/:id
// @access  Private (dentist who created it, or admin)
const deleteDiagnosis = async (req, res, next) => {
  try {
    const diagnosis = await Diagnosis.findById(req.params.id);
    if (!diagnosis) {
      return res.status(404).json({ success: false, message: 'Diagnosis not found' });
    }
    if (!diagnosis.dentist.equals(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (diagnosis.xrayImage?.publicId) await deleteFromCloudinary(diagnosis.xrayImage.publicId);
    if (diagnosis.annotatedImage?.publicId)
      await deleteFromCloudinary(diagnosis.annotatedImage.publicId);
    if (diagnosis.report?.publicId)
      await deleteFromCloudinary(diagnosis.report.publicId, 'raw');

    await diagnosis.deleteOne();

    res.status(200).json({ success: true, message: 'Diagnosis deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadXrayAndAnalyze,
  reviewDiagnosis,
  getDiagnosis,
  getMyDiagnoses,
  deleteDiagnosis,
};
