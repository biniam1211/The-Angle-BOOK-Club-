import { Response } from 'express';
import { AuthRequest } from '../types';
import { CommentModel } from '../models/Comment';
import { PostModel } from '../models/Post';
import { z } from 'zod';

const createCommentSchema = z.object({
  text: z.string().min(1).max(2000),
});

export const createComment = async (req: AuthRequest, res: Response) => {
  try {
    const { text } = createCommentSchema.parse(req.body);
    const postId = req.params.postId;

    // Check if post exists
    const post = await PostModel.findById(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const comment = await CommentModel.create(postId, req.user!.id, text);
    const comments = await CommentModel.getByPostId(postId);

    res.status(201).json({ comment, comments });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    throw error;
  }
};

export const getComments = async (req: AuthRequest, res: Response) => {
  const comments = await CommentModel.getByPostId(req.params.postId);
  res.json({ comments });
};

export const deleteComment = async (req: AuthRequest, res: Response) => {
  const success = await CommentModel.delete(req.params.id, req.user!.id);

  if (!success) {
    return res.status(404).json({ error: 'Comment not found or not authorized' });
  }

  res.json({ success: true });
};
