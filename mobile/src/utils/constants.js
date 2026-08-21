export const ROLES = {
  PATIENT: 'patient',
  DENTIST: 'dentist',
  ADMIN: 'admin',
};

export const APPOINTMENT_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no_show',
};

export const DIAGNOSIS_CLASSES = {
  0: { name: 'Caries', color: '#ef4444', severity: 'High' },
  1: { name: 'Gingivitis', color: '#f59e0b', severity: 'Medium' },
  2: { name: 'Periapical Lesion', color: '#dc2626', severity: 'Urgent' },
  3: { name: 'Impacted Tooth', color: '#3b82f6', severity: 'Low' },
  4: { name: 'Calculus', color: '#10b981', severity: 'Low' },
};

export const TIME_SLOTS = [
  '09:00 AM - 09:30 AM',
  '09:30 AM - 10:00 AM',
  '10:00 AM - 10:30 AM',
  '10:30 AM - 11:00 AM',
  '11:00 AM - 11:30 AM',
  '02:00 PM - 02:30 PM',
  '02:30 PM - 03:00 PM',
  '03:00 PM - 03:30 PM',
  '04:00 PM - 04:30 PM',
];
