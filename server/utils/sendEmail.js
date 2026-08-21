const nodemailer = require('nodemailer');
const logger = require('./logger');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS || process.env.EMAIL_APP_PASSWORD,
  },
});

/**
 * Generic send function
 */
const sendEmail = async ({ to, subject, html, attachments }) => {
  try {
    const info = await transporter.sendMail({
      from: `"DentAI" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      attachments, // [{ filename, path }] or [{ filename, content }]
    });
    logger.info(`Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error('Email send failed:', error.message);
    throw error;
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
