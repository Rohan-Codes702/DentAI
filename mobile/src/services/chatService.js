import { get, post, handleApiError } from './api';
import axiosInstance from '../config/axios';

export const chatService = {
  getConversations: async () => {
    return await get('/chat/conversations');
  },
  getMessages: async (userId, page = 1, limit = 30) => {
    return await get(`/chat/${userId}/messages`, { page, limit });
  },
  sendMessage: async (userId, payload, isFormData = false) => {
    const headers = isFormData ? {} : {};
    return await post(`/chat/${userId}/messages`, payload, headers);
  },
  sendAttachment: async (userId, file, onUploadProgress) => {
    const data = new FormData();
    data.append('attachment', {
      uri: file.uri,
      name: file.name,
      type: file.mimeType,
    });
    try {
      const response = await axiosInstance.post(`/chat/${userId}/messages`, data, {
        onUploadProgress,
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },
  getAttachmentUrl: async (userId, messageId) => {
    const response = await get(`/chat/${userId}/messages/${messageId}/attachment`);
    return response.url;
  },
};
