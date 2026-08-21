const Appointment = require('../models/Appointment');
const User = require('../models/User');
const { sendEmail, templates } = require('../utils/sendEmail');
const logger = require('../utils/logger');

// @desc    Book an appointment
// @route   POST /api/appointments
// @access  Private (patient)
const bookAppointment = async (req, res, next) => {
  try {
    const { dentistId, date, timeSlot, reason, location } = req.body;

    const dentist = await User.findOne({ _id: dentistId, role: 'dentist' });
    if (!dentist) {
      return res.status(404).json({ success: false, message: 'Dentist not found' });
    }

    // Prevent double-booking the same dentist/date/slot
    const clash = await Appointment.findOne({
      dentist: dentistId,
      date,
      timeSlot,
      status: { $in: ['pending', 'confirmed'] },
    });
    if (clash) {
      return res.status(409).json({ success: false, message: 'This time slot is already booked' });
    }

    const appointment = await Appointment.create({
      patient: req.user._id,
      dentist: dentistId,
      date,
      timeSlot,
      reason,
      location,
    });

    sendEmail({
      to: req.user.email,
      subject: 'Appointment Booked - DentAI',
      html: templates.appointmentBooked(req.user.name, dentist.name, date, timeSlot),
    }).catch((e) => logger.warn('Appointment email failed:', e.message));

    res.status(201).json({ success: true, appointment });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged-in user's appointments (patient sees own, dentist sees own)
// @route   GET /api/appointments
// @access  Private
const getMyAppointments = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter =
      req.user.role === 'dentist' ? { dentist: req.user._id } : { patient: req.user._id };

    if (status) filter.status = status;

    const appointments = await Appointment.find(filter)
      .populate('patient', 'name email phone avatar')
      .populate('dentist', 'name email phone avatar dentistProfile.specialization')
      .sort({ date: -1 });

    res.status(200).json({ success: true, count: appointments.length, appointments });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single appointment
// @route   GET /api/appointments/:id
// @access  Private
const getAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'name email phone avatar medicalProfile')
      .populate('dentist', 'name email phone avatar dentistProfile');

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    const isOwner =
      appointment.patient._id.equals(req.user._id) || appointment.dentist._id.equals(req.user._id);
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this appointment' });
    }

    res.status(200).json({ success: true, appointment });
  } catch (error) {
    next(error);
  }
};

// @desc    Update appointment status (confirm/complete/cancel) — dentist or patient
// @route   PUT /api/appointments/:id/status
// @access  Private
const updateStatus = async (req, res, next) => {
  try {
    const { status, cancellationReason } = req.body;
    const allowed = ['pending', 'confirmed', 'completed', 'cancelled', 'no_show'];

    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    const isOwner =
      appointment.patient.equals(req.user._id) || appointment.dentist.equals(req.user._id);
    if (!isOwner) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    appointment.status = status;
    if (status === 'cancelled') {
      appointment.cancelledBy = req.user._id;
      appointment.cancellationReason = cancellationReason;
    }

    await appointment.save();

    res.status(200).json({ success: true, appointment });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dentist's available slots for a given date (books minus taken)
// @route   GET /api/appointments/availability/:dentistId?date=YYYY-MM-DD
// @access  Private
const getAvailability = async (req, res, next) => {
  try {
    const { dentistId } = req.params;
    const { date } = req.query;

    const dentist = await User.findOne({ _id: dentistId, role: 'dentist' });
    if (!dentist) {
      return res.status(404).json({ success: false, message: 'Dentist not found' });
    }

    const dayOfWeek = new Date(date)
      .toLocaleDateString('en-US', { weekday: 'short' })
      .toLowerCase()
      .slice(0, 3);

    const dayAvailability = dentist.dentistProfile?.availability?.find(
      (a) => a.day === dayOfWeek
    );
    const allSlots = dayAvailability ? dayAvailability.slots : [];

    const booked = await Appointment.find({
      dentist: dentistId,
      date,
      status: { $in: ['pending', 'confirmed'] },
    }).select('timeSlot');

    const bookedSlots = new Set(booked.map((b) => b.timeSlot));
    const availableSlots = allSlots.filter((s) => !bookedSlots.has(s));

    res.status(200).json({ success: true, date, availableSlots });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  bookAppointment,
  getMyAppointments,
  getAppointment,
  updateStatus,
  getAvailability,
};
