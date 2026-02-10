import { query } from '../config/database';
import { Book } from '../types';

export class BookModel {
  static async create(
    title: string,
    author: string,
    coverUrl?: string,
    googleBooksId?: string,
    description?: string,
    publishedDate?: string,
    pageCount?: number,
    categories?: string[]
  ): Promise<Book> {
    const result = await query(
      `INSERT INTO books (google_books_id, title, author, cover_url, description, published_date, page_count, categories)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [googleBooksId || null, title, author, coverUrl || null, description || null, publishedDate || null, pageCount || null, categories || null]
    );

    return result.rows[0];
  }

  static async findById(id: string): Promise<Book | null> {
    const result = await query('SELECT * FROM books WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async findByGoogleId(googleBooksId: string): Promise<Book | null> {
    const result = await query('SELECT * FROM books WHERE google_books_id = $1', [googleBooksId]);
    return result.rows[0] || null;
  }

  static async findOrCreate(
    title: string,
    author: string,
    coverUrl?: string,
    googleBooksId?: string
  ): Promise<Book> {
    if (googleBooksId) {
      const existing = await this.findByGoogleId(googleBooksId);
      if (existing) return existing;
    }

    return this.create(title, author, coverUrl, googleBooksId);
  }

  static async search(searchTerm: string, limit: number = 20): Promise<Book[]> {
    const result = await query(
      `SELECT * FROM books
       WHERE title ILIKE $1 OR author ILIKE $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [`%${searchTerm}%`, limit]
    );

    return result.rows;
  }
}
