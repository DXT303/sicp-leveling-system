import { createClient } from '@libsql/client';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST')
    return res.status(405).json({ success: false, message: 'Method not allowed' });

  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ success: false, message: 'All fields are required.' });

  try {
    const db = createClient({
      url: process.env.TURSO_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });

    const existing = await db.execute({ sql: 'SELECT id FROM users WHERE email = ?', args: [email] });
    if (existing.rows.length > 0)
      return res.status(409).json({ success: false, message: 'Email already registered.' });

    const hashed = await bcrypt.hash(password, 10);
    await db.execute({ sql: 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)', args: [name, email, hashed] });

    return res.status(201).json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Registration failed.' });
  }
}
