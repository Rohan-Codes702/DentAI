const fs = require('fs');

const Diagnosis = require('../models/Diagnosis');
const { generateDiagnosisPDF } = require('../utils/generatePDF');
const { sendEmail, templates } = require('../utils/sendEmail');
const logger = require('../utils/logger');

const REPORT_SUBJECT = 'Your DentAI Dental Report Is Ready';
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const sendVerifiedReportEmail = async (diagnosis) => {
  if (
    diagnosis.status !== 'confirmed' ||
    diagnosis.dentistReview?.confirmed !== true
  ) {
    return false;
  }

  const patientEmail = diagnosis.patient?.email?.trim();
  if (!patientEmail || !EMAIL_PATTERN.test(patientEmail)) {
    logger.warn(`Verified report email skipped: invalid patient email for diagnosis ${diagnosis._id}`);
    return false;
  }

  let claimedDiagnosis;
  try {
    claimedDiagnosis = await Diagnosis.findOneAndUpdate(
      {
        _id: diagnosis._id,
        emailSent: { $ne: true },
        emailSending: { $ne: true },
      },
      { $set: { emailSending: true } },
      { new: true }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`Could not claim verified report email for diagnosis ${diagnosis._id}:`, message);
    return false;
  }

  if (!claimedDiagnosis) {
    return false;
  }

  let pdfPath;
  try {
    pdfPath = await generateDiagnosisPDF(diagnosis);
    if (!fs.existsSync(pdfPath)) {
      throw new Error('PDF generation completed without creating an attachment');
    }

    const pdfBuffer = fs.readFileSync(pdfPath);
    if (!pdfBuffer.length) {
      throw new Error('Generated PDF attachment is empty');
    }

    await sendEmail({
      to: patientEmail,
      subject: REPORT_SUBJECT,
      html: templates.diagnosisReady(diagnosis.patient.name),
      attachments: [
        {
          filename: `dentai-dental-report-${diagnosis._id}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    });

    await Diagnosis.updateOne(
      { _id: diagnosis._id },
      { $set: { emailSent: true, emailSending: false } }
    );
    logger.info(`Verified report email sent for diagnosis ${diagnosis._id}`);
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`Verified report email failed for diagnosis ${diagnosis._id}:`, message);
    try {
      await Diagnosis.updateOne(
        { _id: diagnosis._id },
        { $set: { emailSending: false } }
      );
    } catch (resetError) {
      const resetMessage = resetError instanceof Error
        ? resetError.message
        : String(resetError);
      logger.error(`Could not reset report email state for diagnosis ${diagnosis._id}:`, resetMessage);
    }
    return false;
  } finally {
    if (pdfPath && fs.existsSync(pdfPath)) {
      fs.unlink(pdfPath, () => {});
    }
  }
};

module.exports = { sendVerifiedReportEmail };
