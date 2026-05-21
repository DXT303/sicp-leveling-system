import bcrypt from 'bcryptjs';
import { getDb, toObject } from '../_db.js';

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

    const user = toObject(result);
    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });

    return res.status(200).json({ success: true, name: user.name });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
