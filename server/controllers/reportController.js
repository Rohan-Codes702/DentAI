const fs = require('fs');
const https = require('https');

const Diagnosis = require('../models/Diagnosis');
const { generateDiagnosisPDF } = require('../utils/generatePDF');
const { uploadRawToCloudinary } = require('../config/cloudinary');
const logger = require('../utils/logger');
const { sendVerifiedReportEmail } = require('../services/reportEmailService');

// @desc    Generate (or regenerate) a professional PDF report
// @route   POST /api/reports/:diagnosisId/generate
// @access  Private (dentist)
const generateReport = async (req, res, next) => {
  let pdfPath;

  try {
    const diagnosis = await Diagnosis.findById(req.params.diagnosisId)
      .populate('patient', 'name email phone')
      .populate('dentist', 'name email dentistProfile');

    if (!diagnosis) {
      return res.status(404).json({
        success: false,
        message: 'Diagnosis not found',
      });
    }

    if (!diagnosis.dentist._id.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    if (diagnosis.status !== 'confirmed') {
      return res.status(400).json({
        success: false,
        message:
          'Diagnosis must be confirmed by the dentist before generating a report',
      });
    }

    pdfPath = await generateDiagnosisPDF(diagnosis);

    const uploaded = await uploadRawToCloudinary(
      pdfPath,
      'dentai/reports'
    );

    diagnosis.report = {
      url: uploaded.url,
      publicId: uploaded.publicId,
      generatedAt: new Date(),
    };

    await diagnosis.save();

    await sendVerifiedReportEmail(diagnosis);
    fs.unlink(pdfPath, () => {});

    return res.status(200).json({
      success: true,
      report: diagnosis.report,
    });
  } catch (error) {
    if (pdfPath) {
      fs.unlink(pdfPath, () => {});
    }

    next(error);
  }
};

// @desc    Get report information
// @route   GET /api/reports/:diagnosisId
// @access  Private
const getReport = async (req, res, next) => {
  try {
    const diagnosis = await Diagnosis.findById(req.params.diagnosisId)
      .populate('patient', 'name email phone dateOfBirth gender address medicalProfile')
      .populate('dentist', 'name email phone dentistProfile');

    if (!diagnosis) {
      return res.status(404).json({
        success: false,
        message: 'Diagnosis not found',
      });
    }

    const isOwner =
      diagnosis.patient._id.equals(req.user._id) ||
      diagnosis.dentist._id.equals(req.user._id);

    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    if (!diagnosis.report?.url) {
      try {
        const pdfPath = await generateDiagnosisPDF(diagnosis);
        const uploaded = await uploadRawToCloudinary(pdfPath, 'dentai/reports');
        diagnosis.report = {
          url: uploaded.url,
          publicId: uploaded.publicId,
          generatedAt: new Date(),
        };
        await diagnosis.save();
        fs.unlink(pdfPath, () => {});
      } catch (e) {
        logger.warn('Auto report upload warning:', e.message);
      }
    }

    return res.status(200).json({
      success: true,
      report: diagnosis.report || { generatedAt: new Date() },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Download/view actual PDF
// @route   GET /api/reports/:diagnosisId/pdf
// @access  Private
const downloadReport = async (req, res, next) => {
  let pdfPath;
  try {
    const diagnosis = await Diagnosis.findById(req.params.diagnosisId)
      .populate('patient', 'name email phone dateOfBirth gender address medicalProfile')
      .populate('dentist', 'name email phone dentistProfile');

    if (!diagnosis) {
      return res.status(404).json({
        success: false,
        message: 'Diagnosis not found',
      });
    }

    const isOwner =
      diagnosis.patient._id.equals(req.user._id) ||
      diagnosis.dentist._id.equals(req.user._id);

    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    // Generate fresh high-quality PDF dynamically
    pdfPath = await generateDiagnosisPDF(diagnosis);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="dentai-diagnostic-report-${diagnosis._id}.pdf"`
    );

    const stream = fs.createReadStream(pdfPath);
    stream.pipe(res);
    stream.on('end', () => {
      if (pdfPath && fs.existsSync(pdfPath)) {
        fs.unlink(pdfPath, () => {});
      }
    });
  } catch (error) {
    if (pdfPath && fs.existsSync(pdfPath)) {
      fs.unlink(pdfPath, () => {});
    }
    next(error);
  }
};

module.exports = {
  generateReport,
  getReport,
  downloadReport,
};