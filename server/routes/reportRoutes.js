const express = require('express');

const {
  generateReport,
  getReport,
  downloadReport,
} = require('../controllers/reportController');

const {
  protect,
  authorize,
} = require('../middleware/auth');

const router = express.Router();

router.use(protect);

// Generate report - dentist only
router.post(
  '/:diagnosisId/generate',
  authorize('dentist'),
  generateReport
);

// IMPORTANT: PDF route must be BEFORE /:diagnosisId
router.get(
  '/:diagnosisId/pdf',
  downloadReport
);

// Get report information
router.get(
  '/:diagnosisId',
  getReport
);

module.exports = router;