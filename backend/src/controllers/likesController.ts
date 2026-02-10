import { Response } from 'express';
import { AuthRequest } from '../types';
import { LikeModel } from '../models/Like';
import { PostModel } from '../models/Post';

export const toggleLike = async (req: AuthRequest, res: Response) => {
  const postId = req.params.postId;

  // Check if post exists
  const post = await PostModel.findById(postId);
  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }

  const liked = await LikeModel.toggle(postId, req.user!.id);

  res.json({ liked });
};
