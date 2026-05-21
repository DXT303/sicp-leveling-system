import { createClient } from '@libsql/client';
import { runMigrations } from '../src/db/migrate.js';

let _db = null;

export async function getDb() {
  if (_db) return _db;
  _db = createClient({
    url: process.env.TURSO_DATABASE_URL ?? process.env.TURSO_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
  await runMigrations(_db);
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
