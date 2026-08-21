import { get, post, put } from './api';

export const appointmentService = {
  createAppointment: async (appointmentData) => {
    return await post('/appointments', appointmentData);
  },
  getAppointments: async (status) => {
    return await get('/appointments', { status });
  },
  getAppointmentById: async (id) => {
    return await get(`/appointments/${id}`);
  },
  updateStatus: async (id, statusData) => {
    return await put(`/appointments/${id}/status`, statusData);
  },
  getAvailability: async (dentistId, date) => {
    return await get(`/appointments/availability/${dentistId}`, { date });
  },
};
