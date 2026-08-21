const Diagnosis = require('../models/Diagnosis');
const Appointment = require('../models/Appointment');
const User = require('../models/User');

// @desc    Get dentist statistics
// @route   GET /api/dentists/stats
// @access  Private (dentist)
const getStats = async (req, res, next) => {
  try {
    const dentistId = req.user._id;

    const [
      totalDiagnoses,
      pendingDiagnoses,
      totalAppointments,
      upcomingAppointments,
      totalPatients
    ] = await Promise.all([
      Diagnosis.countDocuments({ dentist: dentistId }),
      Diagnosis.countDocuments({ dentist: dentistId, status: 'pending_review' }),
      Appointment.countDocuments({ dentist: dentistId }),
      Appointment.countDocuments({ 
        dentist: dentistId, 
        status: 'scheduled',
        date: { $gte: new Date() }
      }),
      User.countDocuments({ role: 'patient' })
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalDiagnoses,
        pendingDiagnoses,
        totalAppointments,
        upcomingAppointments,
        totalPatients
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStats
};
