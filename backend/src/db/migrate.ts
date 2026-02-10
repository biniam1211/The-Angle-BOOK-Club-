import { pool } from '../config/database';
import { readFileSync } from 'fs';
import { join } from 'path';

async function migrate() {
  try {
    console.log('Starting database migration...');

    const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf-8');
    await pool.query(schema);

    console.log('✅ Database migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
