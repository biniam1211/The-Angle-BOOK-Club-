import { Response } from 'express';
import { AuthRequest } from '../types';
import { PostModel } from '../models/Post';
import { BookModel } from '../models/Book';
import { z } from 'zod';

const createPostSchema = z.object({
  text: z.string().min(1).max(5000),
  book: z.object({
    title: z.string(),
    author: z.string(),
    coverUrl: z.string().optional(),
    googleBooksId: z.string().optional(),
  }).optional(),
});

export const createPost = async (req: AuthRequest, res: Response) => {
  try {
    const { text, book } = createPostSchema.parse(req.body);

    let bookId: string | undefined;

    if (book) {
      const savedBook = await BookModel.findOrCreate(
        book.title,
        book.author,
        book.coverUrl,
        book.googleBooksId
      );
      bookId = savedBook.id;
    }

    const post = await PostModel.create(req.user!.id, text, bookId);
    const fullPost = await PostModel.findById(post.id, req.user!.id);

    res.status(201).json({ post: fullPost });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    throw error;
  }
};

export const getFeed = async (req: AuthRequest, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 50;
  const offset = parseInt(req.query.offset as string) || 0;

  const posts = await PostModel.getFeed(req.user?.id, limit, offset);
  res.json({ posts });
};

export const getPost = async (req: AuthRequest, res: Response) => {
  const post = await PostModel.findById(req.params.id, req.user?.id);

  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }

  res.json({ post });
};

export const getUserPosts = async (req: AuthRequest, res: Response) => {
  const posts = await PostModel.getByUserId(req.params.userId, req.user?.id);
  res.json({ posts });
};

export const updatePost = async (req: AuthRequest, res: Response) => {
  const { text } = req.body;

  if (!text || text.trim().length === 0) {
    return res.status(400).json({ error: 'Text is required' });
  }

  const post = await PostModel.findById(req.params.id);

  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }

  if (post.user_id !== req.user!.id) {
    return res.status(403).json({ error: 'Not authorized' });
  }

  const updated = await PostModel.update(req.params.id, text);
  const fullPost = await PostModel.findById(updated!.id, req.user!.id);

  res.json({ post: fullPost });
};

export const deletePost = async (req: AuthRequest, res: Response) => {
  const post = await PostModel.findById(req.params.id);

  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }

  if (post.user_id !== req.user!.id) {
    return res.status(403).json({ error: 'Not authorized' });
  }

  await PostModel.delete(req.params.id);
  res.json({ success: true });
};
