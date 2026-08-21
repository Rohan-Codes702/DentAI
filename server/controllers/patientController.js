const User = require('../models/User');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');
const fs = require('fs');

// @desc    Get logged-in patient's full profile
// @route   GET /api/patients/profile
// @access  Private (patient)
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({ success: true, user: user.toSafeObject() });
  } catch (error) {
    next(error);
  }
};

// @desc    Create/update medical profile
// @route   PUT /api/patients/profile
// @access  Private (patient)
const updateProfile = async (req, res, next) => {
  try {
    const {
      name,
      phone,
      dateOfBirth,
      gender,
      address,
      bloodGroup,
      allergies,
      medicalHistory,
      currentMedications,
      emergencyContact,
    } = req.body;

    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (dateOfBirth) user.dateOfBirth = dateOfBirth;
    if (gender) user.gender = gender;
    if (address) user.address = { ...user.address, ...address };

    user.medicalProfile = {
      ...user.medicalProfile,
      ...(bloodGroup && { bloodGroup }),
      ...(allergies && { allergies: Array.isArray(allergies) ? allergies : [allergies] }),
      ...(medicalHistory && {
        medicalHistory: Array.isArray(medicalHistory) ? medicalHistory : [medicalHistory],
      }),
      ...(currentMedications && {
        currentMedications: Array.isArray(currentMedications) ? currentMedications : [currentMedications],
      }),
      ...(emergencyContact && { emergencyContact }),
    };

    await user.save();

    res.status(200).json({ success: true, user: user.toSafeObject() });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload/replace avatar
// @route   PUT /api/patients/avatar
// @access  Private
const updateAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided' });
    }

    const user = await User.findById(req.user._id);

    if (user.avatar?.publicId) {
      await deleteFromCloudinary(user.avatar.publicId);
    }

    const uploaded = await uploadToCloudinary(req.file.path, 'dentai/avatars');
    user.avatar = uploaded;
    await user.save();

    fs.unlink(req.file.path, () => {});

    res.status(200).json({ success: true, avatar: user.avatar });
  } catch (error) {
    next(error);
  }
};

// @desc    List all verified dentists (for booking)
// @route   GET /api/patients/dentists
// @access  Private (patient)
const listDentists = async (req, res, next) => {
  try {
    const { specialization, search } = req.query;
    const query = { role: 'dentist', isActive: true };

    if (specialization) {
      query['dentistProfile.specialization'] = specialization;
    }
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const dentists = await User.find(query).select(
      'name email phone avatar address dentistProfile'
    );

    res.status(200).json({ success: true, count: dentists.length, dentists });
  } catch (error) {
    next(error);
  }
};

// @desc    List all active patients for dentist dashboard
// @route   GET /api/patients/list
// @access  Private (dentist)
const listPatients = async (req, res, next) => {
  try {
    const { search } = req.query;
    const query = { role: 'patient', isActive: true };

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const patients = await User.find(query).select(
      'name email phone avatar address medicalProfile gender dateOfBirth createdAt'
    );

    res.status(200).json({ success: true, count: patients.length, patients });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProfile, updateProfile, updateAvatar, listDentists, listPatients };
