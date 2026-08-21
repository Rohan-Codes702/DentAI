const fs = require('fs');
const https = require('https');

const Diagnosis = require('../models/Diagnosis');
const { generateDiagnosisPDF } = require('../utils/generatePDF');
const { uploadRawToCloudinary } = require('../config/cloudinary');
const { sendEmail, templates } = require('../utils/sendEmail');
const logger = require('../utils/logger');

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

    const pdfBuffer = fs.readFileSync(pdfPath);

    sendEmail({
      to: diagnosis.patient.email,
      subject: 'Your Dental Diagnosis Report is Ready - DentAI',
      html: templates.diagnosisReady(diagnosis.patient.name),
      attachments: [
        {
          filename: 'diagnosis-report.pdf',
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    })
      .then(async () => {
        diagnosis.emailSent = true;
        await diagnosis.save();
      })
      .catch((e) =>
        logger.warn('Report email failed:', e.message)
      );

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
    const diagnosis = await Diagnosis.findById(
      req.params.diagnosisId
    ).select('report patient dentist status');

    if (!diagnosis) {
      return res.status(404).json({
        success: false,
        message: 'Diagnosis not found',
      });
    }

    const isOwner =
      diagnosis.patient.equals(req.user._id) ||
      diagnosis.dentist.equals(req.user._id);

    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    if (!diagnosis.report?.url) {
      return res.status(404).json({
        success: false,
        message: 'Report not yet generated',
      });
    }

    return res.status(200).json({
      success: true,
      report: diagnosis.report,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Download/view actual PDF
// @route   GET /api/reports/:diagnosisId/pdf
// @access  Private
const downloadReport = async (req, res, next) => {
  try {
    const diagnosis = await Diagnosis.findById(
      req.params.diagnosisId
    ).select('report patient dentist');

    if (!diagnosis) {
      return res.status(404).json({
        success: false,
        message: 'Diagnosis not found',
      });
    }

    const isOwner =
      diagnosis.patient.equals(req.user._id) ||
      diagnosis.dentist.equals(req.user._id);

    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    if (!diagnosis.report?.url) {
      return res.status(404).json({
        success: false,
        message: 'Report not yet generated',
      });
    }

    const pdfUrl = diagnosis.report.url;

    console.log(
      '[Report PDF] Fetching Cloudinary PDF:',
      pdfUrl
    );

    https.get(pdfUrl, (cloudinaryResponse) => {
      if (cloudinaryResponse.statusCode !== 200) {
        console.error(
          '[Report PDF] Cloudinary response:',
          cloudinaryResponse.statusCode
        );

        return res.status(502).json({
          success: false,
          message: 'Unable to retrieve PDF from storage',
        });
      }

      res.setHeader(
        'Content-Type',
        'application/pdf'
      );

      res.setHeader(
        'Content-Disposition',
        'inline; filename="dentai-diagnostic-report.pdf"'
      );

      cloudinaryResponse.pipe(res);
    }).on('error', (error) => {
      console.error(
        '[Report PDF] Cloudinary download error:',
        error
      );

      if (!res.headersSent) {
        res.status(502).json({
          success: false,
          message: 'Unable to retrieve PDF',
        });
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateReport,
  getReport,
  downloadReport,
};