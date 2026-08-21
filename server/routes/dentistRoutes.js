const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { getStats } = require('../controllers/dentistController');

const router = express.Router();

router.use(protect);
router.use(authorize('dentist'));

router.get('/stats', getStats);

module.exports = router;
