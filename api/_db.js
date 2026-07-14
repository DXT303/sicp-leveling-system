import { createClient } from '@libsql/client';
import { runMigrations } from '../src/db/migrate.js';

let _db = null;

export async function getDb() {
  if (_db) return _db;
  const url = process.env.TURSO_DATABASE_URL ?? process.env.TURSO_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (!url) throw new Error('TURSO_URL is not set in environment variables.');
  const client = createClient({ url, authToken });
  try {
    await runMigrations(client);
  } catch (err) {
    console.error('Migration error (non-fatal):', err.message);
  }
  _db = client;
  return _db;
}

export function toObjects(result) {
  const cols = result.columns ?? [];
  return result.rows.map(row =>
    cols.length > 0 ? Object.fromEntries(cols.map((c, i) => [c, row[i]])) : row
  );
}

export function toObject(result) {
  return toObjects(result)[0] ?? null;
}
