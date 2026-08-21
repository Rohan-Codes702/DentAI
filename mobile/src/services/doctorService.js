import { get, post, put, del } from './api';

export const doctorService = {
  uploadXrayAndDiagnose: async (formData) => {
    return await post('/diagnoses', formData);
  },
  getDiagnoses: async (status) => {
    return await get('/diagnoses', { status });
  },
  getDiagnosisById: async (id) => {
    return await get(`/diagnoses/${id}`);
  },
  reviewDiagnosis: async (id, reviewData) => {
    return await put(`/diagnoses/${id}/review`, reviewData);
  },
  deleteDiagnosis: async (id) => {
    return await del(`/diagnoses/${id}`);
  },
  getStats: async () => {
    return await get('/dentists/stats');
  },
};

