import { Router } from 'express';
import { toggleLike } from '../controllers/likesController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/:postId', authenticate, toggleLike);

export default router;
