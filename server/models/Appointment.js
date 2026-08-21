const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    dentist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      required: [true, 'Appointment date is required'],
    },
    timeSlot: {
      type: String, // e.g. "10:00 AM - 10:30 AM"
      required: [true, 'Time slot is required'],
    },
    reason: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled', 'no_show'],
      default: 'pending',
    },
    notes: {
      type: String,
      trim: true,
    },
    location: {
      type: {
        type: String,
        enum: ['clinic', 'video_call'],
        default: 'clinic',
      },
      address: String,
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    cancellationReason: String,
    reminderSent: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

appointmentSchema.index({ dentist: 1, date: 1 });
appointmentSchema.index({ patient: 1, date: -1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
