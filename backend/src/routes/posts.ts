import { Router } from 'express';
import { createPost, getFeed, getPost, getUserPosts, updatePost, deletePost } from '../controllers/postsController';
import { authenticate, optionalAuth } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, createPost);
router.get('/', optionalAuth, getFeed);
router.get('/:id', optionalAuth, getPost);
router.get('/user/:userId', optionalAuth, getUserPosts);
router.put('/:id', authenticate, updatePost);
router.delete('/:id', authenticate, deletePost);

export default router;
