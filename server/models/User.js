const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['patient', 'dentist', 'admin'],
      default: 'patient',
    },
    phone: {
      type: String,
      trim: true,
    },
    avatar: {
      url: String,
      publicId: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },

    // ---- Patient-specific fields ----
    dateOfBirth: Date,
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
    },
    address: {
      street: String,
      city: String,
      state: String,
      zip: String,
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },
    medicalProfile: {
      bloodGroup: String,
      allergies: [String],
      medicalHistory: [String],
      currentMedications: [String],
      emergencyContact: {
        name: String,
        phone: String,
        relation: String,
      },
    },

    // ---- Dentist-specific fields ----
    dentistProfile: {
      specialization: String,
      licenseNumber: String,
      experienceYears: Number,
      clinicName: String,
      clinicAddress: String,
      bio: String,
      availability: [
        {
          day: {
            type: String,
            enum: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
          },
          slots: [String], // e.g. ["09:00-09:30", "09:30-10:00"]
        },
      ],
      isVerified: {
        type: Boolean,
        default: false,
      },
    },

    // Push notification token (Expo/FCM)
    pushToken: String,

    lastLoginAt: Date,
  },
  { timestamps: true }
);

// Hash password before save
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
