const mongoose = require('mongoose');

const detectionSchema = new mongoose.Schema(
  {
    classId: Number,
    className: String,
    confidence: Number,
    bbox: {
      x1: Number,
      y1: Number,
      x2: Number,
      y2: Number,
    },
  },
  { _id: false }
);

const diagnosisSchema = new mongoose.Schema(
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
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
    },

    // Original uploaded X-ray
    xrayImage: {
      url: { type: String, required: true },
      publicId: { type: String, required: true },
    },

    // AI-annotated result image
    annotatedImage: {
      url: String,
      publicId: String,
    },

    // Raw AI output
    aiDetections: [detectionSchema],
    aiSummary: {
      totalFindings: Number,
      conditionsFound: [
        {
          condition: String,
          count: Number,
        },
      ],
      urgentFindings: [
        {
          condition: String,
          confidence: Number,
        },
      ],
      averageConfidence: Number,
    },

    // Dentist review / final say
    dentistReview: {
      confirmed: { type: Boolean, default: false },
      notes: { type: String, trim: true },
      modifiedDetections: [detectionSchema], // if dentist edits AI results
      reviewedAt: Date,
    },

    status: {
      type: String,
      enum: ['processing', 'pending_review', 'confirmed', 'rejected'],
      default: 'processing',
    },

    // Generated PDF report
    report: {
      url: String,
      publicId: String,
      generatedAt: Date,
    },

    emailSent: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

diagnosisSchema.index({ patient: 1, createdAt: -1 });
diagnosisSchema.index({ dentist: 1, status: 1 });

module.exports = mongoose.model('Diagnosis', diagnosisSchema);
