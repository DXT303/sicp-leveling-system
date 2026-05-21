import 'dotenv/config';
import { createClient } from '@libsql/client';
import { runMigrations } from '../src/db/migrate.js';

const db = createClient({
  url: process.env.TURSO_DATABASE_URL ?? process.env.TURSO_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

console.log('🚀 Running migrations...');
runMigrations(db)
  .then(() => { console.log('✅ All migrations complete.'); process.exit(0); })
  .catch(err => { console.error('❌ Migration failed:', err.message); process.exit(1); });
