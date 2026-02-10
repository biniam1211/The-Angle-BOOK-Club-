import { Request } from 'express';

export interface User {
  id: string;
  email: string;
  username: string;
  name: string;
  avatar_url?: string;
  bio?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Book {
  id: string;
  google_books_id?: string;
  title: string;
  author: string;
  cover_url?: string;
  description?: string;
  published_date?: string;
  page_count?: number;
  categories?: string[];
  created_at: Date;
}

export interface Post {
  id: string;
  user_id: string;
  text: string;
  book_id?: string;
  created_at: Date;
  updated_at: Date;
  // Joined fields
  user?: User;
  book?: Book;
  like_count?: number;
  comment_count?: number;
  liked_by_current_user?: boolean;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  text: string;
  created_at: Date;
  updated_at: Date;
  user?: User;
}

export interface Thread {
  id: string;
  created_at: Date;
  updated_at: Date;
  participants?: User[];
  last_message?: Message;
}

export interface Message {
  id: string;
  thread_id: string;
  user_id: string;
  text: string;
  created_at: Date;
  user?: User;
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    username: string;
  };
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'like' | 'comment' | 'message' | 'friend_request';
  content: string;
  related_id?: string;
  read: boolean;
  created_at: Date;
}
