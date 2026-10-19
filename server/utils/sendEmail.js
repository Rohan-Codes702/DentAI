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
      <h2 style="color:#1976d2;">Your Diagnosis Report is Ready</h2>
      <p>Hi ${name}, your dentist has reviewed your X-ray analysis and confirmed
      the diagnosis. You can now download your full report from the app.</p>
    </div>`,

  otpVerification: (otp) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #1976d2; margin: 0;">DentAI</h1>
      </div>
      <h2 style="color: #333;">Verify Your Email Address</h2>
      <p style="color: #555; font-size: 16px;">Please use the following 4-digit code to complete your registration process. This code will expire in 5 minutes.</p>
      <div style="background-color: #f4f4f4; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1976d2;">${otp}</span>
      </div>
      <p style="color: #999; font-size: 12px; text-align: center;">If you didn't request this code, you can safely ignore this email.</p>
    </div>`,
};

module.exports = { sendEmail, templates };
