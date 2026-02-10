import { Router } from 'express';
import { searchBooks, getBook } from '../controllers/booksController';

const router = Router();

router.get('/search', searchBooks);
router.get('/:id', getBook);

export default router;
