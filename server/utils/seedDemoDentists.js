const bcrypt = require('bcryptjs');
const User = require('../models/User');
const logger = require('./logger');

const demoDentists = [
  {
    name: 'Dr. Rohan Mane',
    email: 'demo.rohan@dentai.local',
    password: 'Password123!',
    phone: '+91-9000000001',
    role: 'dentist',
    isActive: true,
    address: {
      street: 'MG Road',
      city: 'Nashik',
      state: 'MH',
      zip: '422001',
      coordinates: { lat: 19.9975, lng: 73.7898 },
    },
    dentistProfile: {
      specialization: 'Orthodontics',
      licenseNumber: 'DENTAI-ORTHO-001',
      experienceYears: 8,
      clinicName: 'DentAI Super Speciality Clinic',
      clinicAddress: 'MG Road, Nashik',
      bio: 'Orthodontic care with a focus on braces, aligners, and smile correction.',
      availability: [
        { day: 'mon', slots: ['09:00 AM - 09:30 AM', '09:30 AM - 10:00 AM'] },
        { day: 'wed', slots: ['11:00 AM - 11:30 AM', '11:30 AM - 12:00 PM'] },
      ],
      isVerified: true,
    },
  },
  {
    name: 'Dr. Ananya Sharma',
    email: 'demo.ananya@dentai.local',
    password: 'Password123!',
    phone: '+91-9000000002',
    role: 'dentist',
    isActive: true,
    address: {
      street: 'College Road',
      city: 'Nashik',
      state: 'MH',
      zip: '422005',
      coordinates: { lat: 20.005, lng: 73.795 },
    },
    dentistProfile: {
      specialization: 'Endodontics',
      licenseNumber: 'DENTAI-ENDO-002',
      experienceYears: 6,
      clinicName: 'Smile Care Center',
      clinicAddress: 'College Road, Nashik',
      bio: 'Root canal and restorative dentistry with gentle care.',
      availability: [
        { day: 'tue', slots: ['10:00 AM - 10:30 AM', '10:30 AM - 11:00 AM'] },
        { day: 'fri', slots: ['02:00 PM - 02:30 PM', '02:30 PM - 03:00 PM'] },
      ],
      isVerified: true,
    },
  },
];

const seedDemoDentists = async () => {
  try {
    for (const d of demoDentists) {
      const existing = await User.findOne({ email: d.email }).select('+password');
      if (!existing) {
        // Create user individually so Mongoose pre('save') hook hashes password
        await User.create(d);
        logger.info(`Seeded demo dentist: ${d.email}`);
      } else {
        // If password is not a bcrypt hash (doesn't start with $2a$ or $2b$), re-hash it!
        if (existing.password && !existing.password.startsWith('$2')) {
          existing.password = d.password; // setting raw password triggers pre('save') hash hook
          await existing.save();
          logger.info(`Re-hashed password for demo dentist: ${d.email}`);
        }
      }
    }
    return { success: true };
  } catch (error) {
    logger.error('Error seeding demo dentists:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = seedDemoDentists;