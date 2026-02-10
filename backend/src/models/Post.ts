import { query } from '../config/database';
import { Post } from '../types';

export class PostModel {
  static async create(userId: string, text: string, bookId?: string): Promise<Post> {
    const result = await query(
      `INSERT INTO posts (user_id, text, book_id)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [userId, text, bookId || null]
    );

    return result.rows[0];
  }

  static async findById(id: string, currentUserId?: string): Promise<Post | null> {
    const result = await query(
      `SELECT
        p.*,
        u.id as user_id, u.username, u.name, u.avatar_url,
        b.id as book_id, b.title as book_title, b.author as book_author, b.cover_url as book_cover_url,
        (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as like_count,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count
        ${currentUserId ? `, (SELECT COUNT(*) > 0 FROM likes WHERE post_id = p.id AND user_id = $2) as liked_by_current_user` : ''}
       FROM posts p
       JOIN users u ON p.user_id = u.id
       LEFT JOIN books b ON p.book_id = b.id
       WHERE p.id = $1`,
      currentUserId ? [id, currentUserId] : [id]
    );

    if (result.rows.length === 0) return null;

    return this.formatPost(result.rows[0]);
  }

  static async getFeed(currentUserId?: string, limit: number = 50, offset: number = 0): Promise<Post[]> {
    const result = await query(
      `SELECT
        p.*,
        u.id as user_id, u.username, u.name, u.avatar_url,
        b.id as book_id, b.title as book_title, b.author as book_author, b.cover_url as book_cover_url,
        (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as like_count,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count
        ${currentUserId ? `, (SELECT COUNT(*) > 0 FROM likes WHERE post_id = p.id AND user_id = $1) as liked_by_current_user` : ''}
       FROM posts p
       JOIN users u ON p.user_id = u.id
       LEFT JOIN books b ON p.book_id = b.id
       ORDER BY p.created_at DESC
       LIMIT $${currentUserId ? '2' : '1'} OFFSET $${currentUserId ? '3' : '2'}`,
      currentUserId ? [currentUserId, limit, offset] : [limit, offset]
    );

    return result.rows.map(this.formatPost);
  }

  static async getByUserId(userId: string, currentUserId?: string, limit: number = 50): Promise<Post[]> {
    const result = await query(
      `SELECT
        p.*,
        u.id as user_id, u.username, u.name, u.avatar_url,
        b.id as book_id, b.title as book_title, b.author as book_author, b.cover_url as book_cover_url,
        (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as like_count,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count
        ${currentUserId ? `, (SELECT COUNT(*) > 0 FROM likes WHERE post_id = p.id AND user_id = $2) as liked_by_current_user` : ''}
       FROM posts p
       JOIN users u ON p.user_id = u.id
       LEFT JOIN books b ON p.book_id = b.id
       WHERE p.user_id = $1
       ORDER BY p.created_at DESC
       LIMIT $${currentUserId ? '3' : '2'}`,
      currentUserId ? [userId, currentUserId, limit] : [userId, limit]
    );

    return result.rows.map(this.formatPost);
  }

  static async update(id: string, text: string): Promise<Post | null> {
    const result = await query(
      `UPDATE posts SET text = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [text, id]
    );

    return result.rows[0] || null;
  }

  static async delete(id: string): Promise<boolean> {
    const result = await query('DELETE FROM posts WHERE id = $1', [id]);
    return result.rowCount! > 0;
  }

  private static formatPost(row: any): Post {
    return {
      id: row.id,
      user_id: row.user_id,
      text: row.text,
      book_id: row.book_id,
      created_at: row.created_at,
      updated_at: row.updated_at,
      user: {
        id: row.user_id,
        username: row.username,
        name: row.name,
        avatar_url: row.avatar_url,
      },
      book: row.book_id ? {
        id: row.book_id,
        title: row.book_title,
        author: row.book_author,
        cover_url: row.book_cover_url,
      } : undefined,
      like_count: parseInt(row.like_count || 0),
      comment_count: parseInt(row.comment_count || 0),
      liked_by_current_user: row.liked_by_current_user || false,
    } as Post;
  }
}
