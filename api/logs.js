import { getDb, toObjects, toObject } from './_db.js';

export default async function handler(req, res) {
  const db = await getDb();

  if (req.method === 'GET') {
    try {
      const result = await db.execute('SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 50');
      return res.json(toObjects(result));
    } catch (err) { return res.status(500).json({ success: false, message: err.message }); }
  }

  if (req.method === 'POST') {
    try {
      const { type, message, sub, details } = req.body;
      const result = await db.execute({
        sql: 'INSERT INTO activity_logs (type, message, sub, details) VALUES (?, ?, ?, ?) RETURNING *',
        args: [type, message, sub ?? null, details ?? null],
      });
      return res.json(toObject(result));
    } catch (err) { return res.status(500).json({ success: false, message: err.message }); }
  }

  res.status(405).json({ success: false, message: 'Method not allowed' });
}
