import { Router } from 'express';
import { createComment, getComments, deleteComment } from '../controllers/commentsController';
import { authenticate, optionalAuth } from '../middleware/auth';

const router = Router();

router.post('/:postId', authenticate, createComment);
router.get('/:postId', optionalAuth, getComments);
router.delete('/:id', authenticate, deleteComment);

export default router;
