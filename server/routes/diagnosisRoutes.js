const express = require('express');
const { body } = require('express-validator');

const {
  uploadXrayAndAnalyze,
  reviewDiagnosis,
  getDiagnosis,
  getMyDiagnoses,
  deleteDiagnosis,
} = require('../controllers/diagnosisController');

const { protect, authorize } = require('../middleware/auth');
const { uploadXray } = require('../middleware/upload');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(protect);

// Dentist uploads X-ray -> AI analyzes -> saved
router.post(
  '/',
  authorize('dentist'),
  uploadXray.single('xray'),
  [
    body('patientId').notEmpty().withMessage('patientId is required'),
  ],
  validate,
  uploadXrayAndAnalyze
);

router.get('/', getMyDiagnoses);
router.get('/:id', getDiagnosis);

router.put('/:id/review', authorize('dentist'), reviewDiagnosis);

router.delete(
  '/:id',
  authorize('dentist', 'admin'),
  deleteDiagnosis
);

module.exports = router;