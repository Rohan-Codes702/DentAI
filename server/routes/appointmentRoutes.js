const express = require('express');
const { body, query } = require('express-validator');
const {
  bookAppointment,
  getMyAppointments,
  getAppointment,
  updateStatus,
  getAvailability,
} = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(protect);

router.post(
  '/',
  authorize('patient'),
  [
    body('dentistId').notEmpty().withMessage('dentistId is required'),
    body('date').isISO8601().withMessage('Valid date is required'),
    body('timeSlot').notEmpty().withMessage('timeSlot is required'),
  ],
  validate,
  bookAppointment
);

router.get('/', getMyAppointments);
router.get(
  '/availability/:dentistId',
  [query('date').isISO8601().withMessage('Valid date is required')],
  validate,
  getAvailability
);
router.get('/:id', getAppointment);
router.put(
  '/:id/status',
  [body('status').notEmpty().withMessage('status is required')],
  validate,
  updateStatus
);

module.exports = router;
