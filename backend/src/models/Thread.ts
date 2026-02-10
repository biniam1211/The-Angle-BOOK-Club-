import { query } from '../config/database';
import { Thread, Message } from '../types';

export class ThreadModel {
  static async create(userIds: string[]): Promise<Thread> {
    const client = await query('BEGIN');

    try {
      // Create thread
      const threadResult = await query(
        'INSERT INTO threads DEFAULT VALUES RETURNING *'
      );
      const thread = threadResult.rows[0];

      // Add participants
      for (const userId of userIds) {
        await query(
          'INSERT INTO thread_participants (thread_id, user_id) VALUES ($1, $2)',
          [thread.id, userId]
        );
      }

      await query('COMMIT');
      return thread;
    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }
  }

  static async findByParticipants(userIds: string[]): Promise<Thread | null> {
    // For 1-on-1 chats
    if (userIds.length === 2) {
      const result = await query(
        `SELECT t.* FROM threads t
         WHERE t.id IN (
           SELECT thread_id FROM thread_participants
           WHERE user_id = ANY($1)
           GROUP BY thread_id
           HAVING COUNT(DISTINCT user_id) = $2
           AND array_agg(user_id ORDER BY user_id) = $1
         )
         LIMIT 1`,
        [userIds.sort(), userIds.length]
      );

      return result.rows[0] || null;
    }

    return null;
  }

  static async findOrCreate(userIds: string[]): Promise<Thread> {
    const existing = await this.findByParticipants(userIds);
    if (existing) return existing;

    return this.create(userIds);
  }

  static async getByUserId(userId: string): Promise<Thread[]> {
    const result = await query(
      `SELECT
        t.*,
        array_agg(DISTINCT jsonb_build_object(
          'id', u.id,
          'username', u.username,
          'name', u.name,
          'avatar_url', u.avatar_url
        )) as participants,
        (SELECT jsonb_build_object(
          'id', m.id,
          'text', m.text,
          'user_id', m.user_id,
          'created_at', m.created_at
        )
        FROM messages m
        WHERE m.thread_id = t.id
        ORDER BY m.created_at DESC
        LIMIT 1) as last_message
       FROM threads t
       JOIN thread_participants tp ON t.id = tp.thread_id
       JOIN users u ON tp.user_id = u.id
       WHERE t.id IN (
         SELECT thread_id FROM thread_participants WHERE user_id = $1
       )
       GROUP BY t.id
       ORDER BY t.updated_at DESC`,
      [userId]
    );

    return result.rows.map(row => ({
      id: row.id,
      created_at: row.created_at,
      updated_at: row.updated_at,
      participants: row.participants || [],
      last_message: row.last_message || undefined,
    }));
  }
}

export class MessageModel {
  static async create(threadId: string, userId: string, text: string): Promise<Message> {
    const client = await query('BEGIN');

    try {
      // Insert message
      const result = await query(
        `INSERT INTO messages (thread_id, user_id, text)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [threadId, userId, text]
      );

      // Update thread timestamp
      await query(
        'UPDATE threads SET updated_at = CURRENT_TIMESTAMP WHERE id = $1',
        [threadId]
      );

      await query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }
  }

  static async getByThreadId(threadId: string): Promise<Message[]> {
    const result = await query(
      `SELECT
        m.*,
        u.id as user_id, u.username, u.name, u.avatar_url
       FROM messages m
       JOIN users u ON m.user_id = u.id
       WHERE m.thread_id = $1
       ORDER BY m.created_at ASC`,
      [threadId]
    );

    return result.rows.map(row => ({
      id: row.id,
      thread_id: row.thread_id,
      user_id: row.user_id,
      text: row.text,
      created_at: row.created_at,
      user: {
        id: row.user_id,
        username: row.username,
        name: row.name,
        avatar_url: row.avatar_url,
      },
    }));
  }
}
