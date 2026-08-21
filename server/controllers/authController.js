const fs = require('fs');
const User = require('../models/User');
const Otp = require('../models/Otp');
const generateToken = require('../utils/generateToken');
const { sendEmail, templates } = require('../utils/sendEmail');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');
const logger = require('../utils/logger');

// @desc    Register new user (patient or dentist)
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, otp } = req.body;

    if (!otp) {
      return res.status(400).json({ success: false, message: 'OTP is required' });
    }

    const validOtp = await Otp.findOne({ email, otp });
    if (!validOtp) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    // Delete used OTP
    await Otp.deleteMany({ email });

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'patient',
      phone,
    });

    const token = generateToken(user._id, user.role);

    sendEmail({
      to: user.email,
      subject: 'Welcome to DentAI',
      html: templates.welcome(user.name),
    }).catch((e) => logger.warn('Welcome email failed:', e.message));

    res.status(201).json({
      success: true,
      token,
      user: user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated' });
    }

    user.lastLoginAt = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      token,
      user: user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged-in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    res.status(200).json({ success: true, user: req.user.toSafeObject() });
  } catch (error) {
    next(error);
  }
};

// @desc    Update password
// @route   PUT /api/auth/update-password
// @access  Private
const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    if (!(await user.matchPassword(currentPassword))) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    const token = generateToken(user._id, user.role);
    res.status(200).json({ success: true, message: 'Password updated', token });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout (client just discards token; endpoint provided for cookie-based setups)
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  res.clearCookie('token');
  res.status(200).json({ success: true, message: 'Logged out' });
};

// @desc    Google Login
// @route   POST /api/auth/google
// @access  Public
const googleLogin = async (req, res, next) => {
  try {
    // Mock implementation for social login
    const { token, email, name } = req.body;
    let user = await User.findOne({ email });
    
    if (!user) {
      user = await User.create({
        name: name || 'Google User',
        email,
        password: Math.random().toString(36).slice(-8) + 'Aa1!', // Random password for oauth
        role: 'patient', // default role
        isActive: true
      });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated' });
    }

    user.lastLoginAt = new Date();
    await user.save({ validateBeforeSave: false });

    const authToken = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      token: authToken,
      user: user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Apple Login
// @route   POST /api/auth/apple
// @access  Public
const appleLogin = async (req, res, next) => {
  try {
    // Mock implementation for social login
    const { token, email, name } = req.body;
    let user = await User.findOne({ email });
    
    if (!user) {
      user = await User.create({
        name: name || 'Apple User',
        email,
        password: Math.random().toString(36).slice(-8) + 'Aa1!', // Random password for oauth
        role: 'patient', // default role
        isActive: true
      });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated' });
    }

    user.lastLoginAt = new Date();
    await user.save({ validateBeforeSave: false });

    const authToken = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      token: authToken,
      user: user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send OTP to email for verification
// @route   POST /api/auth/send-otp
// @access  Public
const sendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();

    await Otp.deleteMany({ email });
    await Otp.create({ email, otp: otpCode });

    try {
      await sendEmail({
        to: email,
        subject: 'DentAI - Verify your email address',
        html: templates.otpVerification(otpCode),
      });
      res.status(200).json({ success: true, message: 'OTP sent successfully' });
    } catch (e) {
      logger.warn('OTP email failed:', e.message);
      console.log(`[DEV ONLY] OTP for ${email} is ${otpCode}`);
      res.status(200).json({ success: true, message: 'OTP sent (check server logs if email failed)' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Upload / update profile avatar
// @route   PUT /api/auth/upload-avatar
// @access  Private
const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided' });
    }

    const user = await User.findById(req.user._id);

    // Delete old avatar from Cloudinary if it exists
    if (user.avatar?.publicId) {
      await deleteFromCloudinary(user.avatar.publicId).catch((e) =>
        logger.warn('Old avatar delete failed:', e.message)
      );
    }

    // Upload new avatar
    const { url, publicId } = await uploadToCloudinary(req.file.path, 'dentai/avatars');

    // Clean up temp file
    fs.unlink(req.file.path, (e) => {
      if (e) logger.warn('Temp file cleanup failed:', e.message);
    });

    user.avatar = { url, publicId };
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: 'Avatar updated successfully',
      user: user.toSafeObject(),
    });
  } catch (error) {
    // Clean up temp file on error
    if (req.file?.path) {
      fs.unlink(req.file.path, () => {});
    }
    next(error);
  }
};

module.exports = { register, login, getMe, updatePassword, logout, googleLogin, appleLogin, sendOtp, uploadAvatar };
