import defaultDb from './client.js';
import { runMigrations } from './migrate.js';

export async function initSchema(db = defaultDb) {
  await runMigrations(db);
}
