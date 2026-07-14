import { createClient } from '@libsql/client';

const db = createClient({
  url: process.env.TURSO_DATABASE_URL ?? process.env.TURSO_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

await db.execute('PRAGMA foreign_keys = ON');

export default db;
