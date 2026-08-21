import { get, put, post } from './api';

export const patientService = {
  getProfile: async () => {
    return await get('/patients/profile');
  },
  updateProfile: async (profileData) => {
    return await put('/patients/profile', profileData);
  },
  uploadAvatar: async (formData) => {
    return await put('/patients/avatar', formData);
  },
  getNearbyDentists: async (params = {}) => {
    return await get('/patients/dentists', params);
  },
  getPatients: async (params = {}) => {
    return await get('/patients/list', params);
  },
};
