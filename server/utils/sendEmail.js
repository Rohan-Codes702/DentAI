const fs = require('fs');
const { Resend } = require('resend');
const logger = require('./logger');

const RESEND_TIMEOUT_MS = 18_000;

const getAttachments = (attachments) =>
  attachments?.map((attachment) => {
    if (attachment.content || !attachment.path) {
      return attachment;
    }

    return {
      ...attachment,
      content: fs.readFileSync(attachment.path),
      path: undefined,
    };
  });

/**
 * Generic send function
 */
const sendEmail = async ({ to, subject, html, attachments }) => {
  const startedAt = Date.now();
  logger.info('Email API request started');

  try {
    if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) {
      throw new Error('Email provider configuration is missing');
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const signal = AbortSignal.timeout(RESEND_TIMEOUT_MS);
    logger.info('Resend email API request started');
    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
      attachments: getAttachments(attachments),
    }, { signal });

    if (result.error) {
      const providerMessage =
        result.error.message || result.error.name || 'Unknown provider error';
      const providerError = new Error(`Email provider request failed: ${providerMessage}`);
      providerError.statusCode = result.error.statusCode;
      throw providerError;
    }

    if (!result.data?.id) {
      throw new Error('Email provider returned no accepted message ID');
    }

    logger.info(`Resend email API request succeeded: ${result.data.id}`);
    return result.data;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const statusCode = error?.statusCode ? ` (status ${error.statusCode})` : '';
    logger.error(`Resend email API request failed${statusCode}:`, message);
    throw error;
  } finally {
    logger.info(`Email API request completed in ${Date.now() - startedAt}ms`);
  }
};

const templates = {
  welcome: (name) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
      <h2 style="color:#1976d2;">Welcome to DentAI, ${name} 👋</h2>
      <p>Your account has been created successfully. You can now book appointments,
      chat with dentists, and get AI-powered dental X-ray analysis.</p>
    </div>`,

  appointmentBooked: (name, dentistName, date, timeSlot) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
      <h2 style="color:#1976d2;">Appointment Confirmed</h2>
      <p>Hi ${name}, your appointment with Dr. ${dentistName} is booked for:</p>
      <p><strong>${new Date(date).toDateString()} — ${timeSlot}</strong></p>
      <p>We'll send you a reminder before your visit.</p>
    </div>`,

  diagnosisReady: (name) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
      <h2 style="color:#1976d2;">Your DentAI Dental Report Is Ready</h2>
      <p>Hi ${name}, your dentist has reviewed and verified your dental report.
      Your verified PDF report is attached to this email.</p>
      <p>Please contact your dentist if you have any questions about the report.</p>
    </div>`,

};

module.exports = { sendEmail, templates };
