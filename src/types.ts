export type ID = string;

export type User = {
  id: ID;
  name: string;
  avatarUrl?: string;
};

export type Book = {
  id: ID;
  title: string;
  author: string;
  coverUrl?: string;
};

export type Comment = {
  id: ID;
  postId: ID;
  userId: ID;
  text: string;
  createdAt: number;
};

export type Post = {
  id: ID;
  userId: ID;
  text: string;
  book?: Book;
  likeUserIds: ID[];
  commentIds: ID[];
  createdAt: number;
};

export type Thread = {
  id: ID;
  userIds: ID[]; // 1-1 chat for now
  lastMessageAt: number;
};

export type Message = {
  id: ID;
  threadId: ID;
  userId: ID;
  text: string;
  createdAt: number;
};

