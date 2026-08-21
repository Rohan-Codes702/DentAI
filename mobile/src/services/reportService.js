import axiosInstance from '../config/axios';
import { get, post } from './api';

export const reportService = {
  generateReport: async (diagnosisId) => {
    return await post(`/reports/${diagnosisId}/generate`);
  },

  getReportByDiagnosisId: async (diagnosisId) => {
    return await get(`/reports/${diagnosisId}`);
  },

  getDiagnosisById: async (diagnosisId) => {
    return await get(`/diagnoses/${diagnosisId}`);
  },

  // Get the actual PDF through the authenticated Axios instance
  downloadReportPdf: async (diagnosisId) => {
    const response = await axiosInstance.get(
      `/reports/${diagnosisId}/pdf`,
      {
        responseType: 'blob',
      }
    );

    return response.data;
  },
};