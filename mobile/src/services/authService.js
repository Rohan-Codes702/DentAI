import { get, post, put } from './api';
import axiosInstance from '../config/axios';

export const authService = {
  login: async (credentials) => {
    return await post('/auth/login', credentials);
  },
  register: async (userData) => {
    return await post('/auth/register', userData);
  },
  googleLogin: async (data) => {
    return await post('/auth/google', data);
  },
  appleLogin: async (data) => {
    return await post('/auth/apple', data);
  },
  sendOtp: async (email) => {
    return await post('/auth/send-otp', { email });
  },
  getCurrentUser: async () => {
    return await get('/auth/me');
  },
  updatePassword: async (passwords) => {
    return await put('/auth/update-password', passwords);
  },
  logout: async () => {
    return await post('/auth/logout');
  },
  uploadAvatar: async (imageUri) => {
    const formData = new FormData();
    const filename = imageUri.split('/').pop();
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';
    formData.append('avatar', { uri: imageUri, name: filename, type });
    const response = await axiosInstance.put('/auth/upload-avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};
