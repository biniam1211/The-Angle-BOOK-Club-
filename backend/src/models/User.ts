import { query } from '../config/database';
import bcrypt from 'bcrypt';
import { User } from '../types';

export class UserModel {
  static async create(email: string, username: string, password: string, name: string): Promise<User> {
    const passwordHash = await bcrypt.hash(password, 10);

    const result = await query(
      `INSERT INTO users (email, username, password_hash, name)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, username, name, avatar_url, bio, created_at, updated_at`,
      [email, username, passwordHash, name]
    );

    return result.rows[0];
  }

  static async findByEmail(email: string): Promise<User | null> {
    const result = await query(
      'SELECT id, email, username, name, avatar_url, bio, created_at, updated_at FROM users WHERE email = $1',
      [email]
    );

    return result.rows[0] || null;
  }

  static async findByUsername(username: string): Promise<User | null> {
    const result = await query(
      'SELECT id, email, username, name, avatar_url, bio, created_at, updated_at FROM users WHERE username = $1',
      [username]
    );

    return result.rows[0] || null;
  }

  static async findById(id: string): Promise<User | null> {
    const result = await query(
      'SELECT id, email, username, name, avatar_url, bio, created_at, updated_at FROM users WHERE id = $1',
      [id]
    );

    return result.rows[0] || null;
  }

  static async verifyPassword(email: string, password: string): Promise<User | null> {
    const result = await query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    const user = result.rows[0];
    if (!user) return null;

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) return null;

    // Return user without password hash
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  static async update(id: string, updates: Partial<User>): Promise<User | null> {
    const allowedFields = ['name', 'bio', 'avatar_url'];
    const fields = Object.keys(updates).filter(key => allowedFields.includes(key));

    if (fields.length === 0) return this.findById(id);

    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
    const values = fields.map(field => updates[field as keyof User]);

    const result = await query(
      `UPDATE users SET ${setClause}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING id, email, username, name, avatar_url, bio, created_at, updated_at`,
      [id, ...values]
    );

    return result.rows[0] || null;
  }

  static async search(searchTerm: string, limit: number = 20): Promise<User[]> {
    const result = await query(
      `SELECT id, email, username, name, avatar_url, bio, created_at, updated_at
       FROM users
       WHERE username ILIKE $1 OR name ILIKE $1
       LIMIT $2`,
      [`%${searchTerm}%`, limit]
    );

    return result.rows;
  }
}
