import { Router } from 'express';
import { getThreads, createThread, getMessages, sendMessage } from '../controllers/messagesController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/threads', authenticate, getThreads);
router.post('/threads', authenticate, createThread);
router.get('/threads/:threadId/messages', authenticate, getMessages);
router.post('/threads/:threadId/messages', authenticate, sendMessage);

export default router;
