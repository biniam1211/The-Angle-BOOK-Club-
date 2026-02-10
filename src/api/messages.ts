import apiClient from './client';
import { Thread, Message } from '../types';

export const messagesApi = {
  getThreads: async (): Promise<Thread[]> => {
    const response = await apiClient.get('/messages/threads');
    return response.data.threads;
  },

  createThread: async (userId: string): Promise<Thread> => {
    const response = await apiClient.post('/messages/threads', { userId });
    return response.data.thread;
  },

  getMessages: async (threadId: string): Promise<Message[]> => {
    const response = await apiClient.get(`/messages/threads/${threadId}/messages`);
    return response.data.messages;
  },

  sendMessage: async (threadId: string, text: string): Promise<Message> => {
    const response = await apiClient.post(`/messages/threads/${threadId}/messages`, { text });
    return response.data.message;
  },
};
