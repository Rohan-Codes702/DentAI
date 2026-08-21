const express = require('express');
const { body } = require('express-validator');
const {
  getProfile,
  updateProfile,
  updateAvatar,
  listDentists,
  listPatients,
} = require('../controllers/patientController');
const { protect, authorize } = require('../middleware/auth');
const { uploadAvatar } = require('../middleware/upload');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(protect); // all routes below require auth

router.get('/profile', getProfile);

router.put(
  '/profile',
  [
    body('gender').optional({ checkFalsy: true }).isIn(['male', 'female', 'other']),
    body('dateOfBirth').optional({ checkFalsy: true }).isISO8601().withMessage('Invalid date format'),
  ],
  validate,
  updateProfile
);

router.put('/avatar', uploadAvatar.single('avatar'), updateAvatar);

router.get('/dentists', authorize('patient'), listDentists);
router.get('/list', authorize('dentist'), listPatients);

module.exports = router;
