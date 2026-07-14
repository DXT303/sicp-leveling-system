import { createClient } from '@libsql/client';

let _db = null;

export async function getDb() {
  if (_db) return _db;
  const url = process.env.TURSO_DATABASE_URL ?? process.env.TURSO_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (!url) throw new Error('TURSO_URL is not set in environment variables.');
  _db = createClient({ url, authToken });
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
