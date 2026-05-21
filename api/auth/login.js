import { createClient } from '@libsql/client';
import bcrypt from 'bcryptjs';

async function getDb() {
  const db = createClient({
    url: process.env.TURSO_DATABASE_URL ?? process.env.TURSO_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
  await db.execute({
    sql: `CREATE TABLE IF NOT EXISTS users (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT    NOT NULL,
      email      TEXT    NOT NULL UNIQUE,
      password   TEXT    NOT NULL,
      created_at TEXT    NOT NULL DEFAULT (datetime('now'))
    )`,
    args: [],
  });
  return db;
}

export default async function handler(req, res) {
  if (req.method !== 'POST')
    return res.status(405).json({ success: false, message: 'Method not allowed' });

  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ success: false, message: 'Email and password required' });

  try {
    const db = await getDb();

    const result = await db.execute({ sql: 'SELECT id, name, email, password FROM users WHERE email = ?', args: [email] });

    if (result.rows.length === 0)
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });

    const row = result.rows[0];
    const cols = result.columns ?? [];
    const user = cols.length > 0 ? Object.fromEntries(cols.map((c, i) => [c, row[i]])) : row;

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });

    return res.status(200).json({ success: true, name: user.name });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
