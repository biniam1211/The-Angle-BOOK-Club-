import apiClient from './client';
import { Comment } from '../types';

export const commentsApi = {
  getComments: async (postId: string): Promise<Comment[]> => {
    const response = await apiClient.get(`/comments/${postId}`);
    return response.data.comments;
  },

  createComment: async (postId: string, text: string): Promise<Comment> => {
    const response = await apiClient.post(`/comments/${postId}`, { text });
    return response.data.comment;
  },

  deleteComment: async (id: string): Promise<void> => {
    await apiClient.delete(`/comments/${id}`);
  },
};
