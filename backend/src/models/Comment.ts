import { query } from '../config/database';
import { Comment } from '../types';

export class CommentModel {
  static async create(postId: string, userId: string, text: string): Promise<Comment> {
    const result = await query(
      `INSERT INTO comments (post_id, user_id, text)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [postId, userId, text]
    );

    return result.rows[0];
  }

  static async getByPostId(postId: string): Promise<Comment[]> {
    const result = await query(
      `SELECT
        c.*,
        u.id as user_id, u.username, u.name, u.avatar_url
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.post_id = $1
       ORDER BY c.created_at ASC`,
      [postId]
    );

    return result.rows.map(row => ({
      id: row.id,
      post_id: row.post_id,
      user_id: row.user_id,
      text: row.text,
      created_at: row.created_at,
      updated_at: row.updated_at,
      user: {
        id: row.user_id,
        username: row.username,
        name: row.name,
        avatar_url: row.avatar_url,
      },
    }));
  }

  static async delete(id: string, userId: string): Promise<boolean> {
    const result = await query(
      'DELETE FROM comments WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    return result.rowCount! > 0;
  }
}
