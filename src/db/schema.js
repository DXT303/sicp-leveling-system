import db from './client.js';

export async function initSchema() {
  await db.batch([
    {
      sql: `CREATE TABLE IF NOT EXISTS users (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        name       TEXT    NOT NULL,
        email      TEXT    NOT NULL UNIQUE,
        password   TEXT    NOT NULL,
        created_at TEXT    NOT NULL DEFAULT (datetime('now'))
      )`,
      args: [],
    },
    {
      sql: `CREATE TABLE IF NOT EXISTS projects (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        name       TEXT    NOT NULL,
        status     TEXT    NOT NULL DEFAULT 'active',
        progress   INTEGER NOT NULL DEFAULT 0,
        created_at TEXT    NOT NULL DEFAULT (datetime('now'))
      )`,
      args: [],
    },
    {
      sql: `CREATE TABLE IF NOT EXISTS leveling_rows (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        station    TEXT,
        bs         REAL,
        is_val     REAL,
        fs         REAL,
        hi         REAL,
        rise       REAL,
        fall       REAL,
        rl         REAL,
        remarks    TEXT,
        row_order  INTEGER NOT NULL DEFAULT 0
      )`,
      args: [],
    },
    {
      sql: `CREATE TABLE IF NOT EXISTS calibrations (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
        instrument TEXT,
        date       TEXT,
        d1_near    REAL,
        d1_far     REAL,
        d2_near    REAL,
        d2_far     REAL,
        error      REAL,
        status     TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`,
      args: [],
    },
    {
      sql: `CREATE TABLE IF NOT EXISTS activity_logs (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        type       TEXT NOT NULL,
        message    TEXT NOT NULL,
        sub        TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`,
      args: [],
    },
  ]);

  console.log('✅ Database schema initialized');
}
