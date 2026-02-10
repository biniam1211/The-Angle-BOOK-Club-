import { Request, Response } from 'express';
import { GoogleBooksService } from '../services/googleBooksService';

export const searchBooks = async (req: Request, res: Response) => {
  const query = req.query.q as string;

  if (!query) {
    return res.status(400).json({ error: 'Query parameter "q" is required' });
  }

  const books = await GoogleBooksService.search(query);
  res.json({ books });
};

export const getBook = async (req: Request, res: Response) => {
  const book = await GoogleBooksService.getById(req.params.id);

  if (!book) {
    return res.status(404).json({ error: 'Book not found' });
  }

  res.json({ book });
};
