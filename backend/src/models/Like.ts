import { query } from '../config/database';

export class LikeModel {
  static async toggle(postId: string, userId: string): Promise<boolean> {
    // Check if like exists
    const existing = await query(
      'SELECT id FROM likes WHERE post_id = $1 AND user_id = $2',
      [postId, userId]
    );

    if (existing.rows.length > 0) {
      // Unlike
      await query(
        'DELETE FROM likes WHERE post_id = $1 AND user_id = $2',
        [postId, userId]
      );
      return false;
    } else {
      // Like
      await query(
        'INSERT INTO likes (post_id, user_id) VALUES ($1, $2)',
        [postId, userId]
      );
      return true;
    }
  }

  static async getLikedUserIds(postId: string): Promise<string[]> {
    const result = await query(
      'SELECT user_id FROM likes WHERE post_id = $1',
      [postId]
    );
    return result.rows.map(row => row.user_id);
  }
}
