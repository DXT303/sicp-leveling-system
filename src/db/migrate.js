import * as m001 from './migrations/001_initial_schema.js';
import * as m002 from './migrations/002_projects_add_fields.js';
import * as m003 from './migrations/003_activity_logs_add_details.js';
import * as m004 from './migrations/004_leveling_rows_index.js';
import * as m005 from './migrations/005_calibrations_add_method.js';

const ALL_MIGRATIONS = [m001, m002, m003, m004, m005];

export async function runMigrations(db) {
  // Ensure migrations tracking table exists
  await db.execute(
    `CREATE TABLE IF NOT EXISTS _migrations (
      id         TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`
  );

  // Get already-applied migrations
  const result = await db.execute('SELECT id FROM _migrations');
  const applied = new Set(result.rows.map(r => r[0] ?? r.id));

  // Run pending migrations in order
  for (const migration of ALL_MIGRATIONS) {
    if (applied.has(migration.id)) continue;

    console.log(`Running migration: ${migration.id}`);
    for (const sql of migration.up) {
      await db.execute(sql).catch(err => {
        // Ignore "already exists" / "duplicate column" errors
        if (!err.message?.includes('already exists') && !err.message?.includes('duplicate column')) {
          throw err;
        }
      });
    }

    await db.execute({
      sql: 'INSERT INTO _migrations (id) VALUES (?)',
      args: [migration.id],
    });
    console.log(`✅ Applied: ${migration.id}`);
  }
}
