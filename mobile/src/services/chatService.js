import { get, post } from './api';

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
};
