import apiClient from './client';
import { Post } from '../types';

export interface CreatePostData {
  text: string;
  book?: {
    title: string;
    author: string;
    coverUrl?: string;
    googleBooksId?: string;
  };
}

export const postsApi = {
  getFeed: async (limit = 50, offset = 0): Promise<Post[]> => {
    const response = await apiClient.get('/posts', { params: { limit, offset } });
    return response.data.posts;
  },

  getPost: async (id: string): Promise<Post> => {
    const response = await apiClient.get(`/posts/${id}`);
    return response.data.post;
  },

  getUserPosts: async (userId: string): Promise<Post[]> => {
    const response = await apiClient.get(`/posts/user/${userId}`);
    return response.data.posts;
  },

  createPost: async (data: CreatePostData): Promise<Post> => {
    const response = await apiClient.post('/posts', data);
    return response.data.post;
  },

  updatePost: async (id: string, text: string): Promise<Post> => {
    const response = await apiClient.put(`/posts/${id}`, { text });
    return response.data.post;
  },

  deletePost: async (id: string): Promise<void> => {
    await apiClient.delete(`/posts/${id}`);
  },

  toggleLike: async (postId: string): Promise<boolean> => {
    const response = await apiClient.post(`/likes/${postId}`);
    return response.data.liked;
  },
};
