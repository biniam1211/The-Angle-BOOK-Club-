import type { Comment, ID, Message, Post, Thread, User, Book } from '../types';

export interface DataProvider {
  getCurrentUser(): Promise<User>;
  listFriends(): Promise<User[]>;

  // Feed
  listFeed(): Promise<Post[]>;
  createPost(input: { text: string; book?: Omit<Book, 'id'> }): Promise<Post>;
  likePost(postId: ID, like: boolean): Promise<void>;
  addComment(postId: ID, text: string): Promise<Comment>;

  // Chat
  listThreads(): Promise<Thread[]>;
  getThreadMessages(threadId: ID): Promise<Message[]>;
  sendMessage(threadId: ID, text: string): Promise<Message>;

  // Subscriptions
  onFeed(callback: () => void): () => void;
  onThread(threadId: ID, callback: () => void): () => void;
}

