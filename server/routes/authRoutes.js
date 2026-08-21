const express = require('express');
const { body } = require('express-validator');
const {
  register,
  login,
  getMe,
  updatePassword,
  logout,
  googleLogin,
  appleLogin,
  sendOtp,
  uploadAvatar,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { uploadAvatar: uploadAvatarMiddleware } = require('../middleware/upload');
const validate = require('../middleware/validate');

const router = express.Router();

router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').optional({ checkFalsy: true }).isIn(['patient', 'dentist', 'admin']).withMessage('Invalid role'),
  ],
  validate,
  register
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  login
);

router.get('/me', protect, getMe);

router.put(
  '/update-password',
  protect,
  [
    body('currentPassword').notEmpty(),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  ],
  validate,
  updatePassword
);

router.post('/logout', protect, logout);

router.put('/upload-avatar', protect, uploadAvatarMiddleware.single('avatar'), uploadAvatar);

router.post(
  '/google',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('token').notEmpty().withMessage('Token is required'),
  ],
  validate,
  googleLogin
);

router.post(
  '/apple',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('token').notEmpty().withMessage('Token is required'),
  ],
  validate,
  appleLogin
);

router.post(
  '/send-otp',
  [
    body('email').isEmail().withMessage('Valid email is required'),
  ],
  validate,
  sendOtp
);

module.exports = router;
