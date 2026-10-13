const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { getStats, getProfile, updateProfile } = require('../controllers/dentistController');

const router = express.Router();

router.use(protect);
router.use(authorize('dentist'));

router.get('/stats', getStats);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

module.exports = router;
