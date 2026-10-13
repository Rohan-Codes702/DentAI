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

// @desc    Get logged-in dentist profile
// @route   GET /api/dentists/profile
// @access  Private (dentist)
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({ success: true, user: user.toSafeObject() });
  } catch (error) {
    next(error);
  }
};

// @desc    Update dentist profile
// @route   PUT /api/dentists/profile
// @access  Private (dentist)
const updateProfile = async (req, res, next) => {
  try {
    const {
      name,
      phone,
      specialization,
      licenseNumber,
      experienceYears,
      clinicName,
      clinicAddress,
      bio,
    } = req.body;

    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (phone) user.phone = phone;

    user.dentistProfile = {
      ...user.dentistProfile,
      ...(specialization && { specialization }),
      ...(licenseNumber && { licenseNumber }),
      ...(experienceYears !== undefined && { experienceYears: Number(experienceYears) }),
      ...(clinicName && { clinicName }),
      ...(clinicAddress && { clinicAddress }),
      ...(bio !== undefined && { bio }),
    };

    await user.save();

    res.status(200).json({ success: true, user: user.toSafeObject() });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStats,
  getProfile,
  updateProfile,
};
