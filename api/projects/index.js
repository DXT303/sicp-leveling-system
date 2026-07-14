import { getDb, toObjects, toObject } from '../_db.js';

export default async function handler(req, res) {
  const db = await getDb();

  if (req.method === 'GET') {
    try {
      const result = await db.execute('SELECT * FROM projects WHERE deleted_at IS NULL ORDER BY created_at DESC');
      return res.json(toObjects(result));
    } catch (err) { return res.status(500).json({ success: false, message: err.message }); }
  }

  if (req.method === 'POST') {
    try {
      const { name, status = 'active', progress = 0 } = req.body;
      const instrument   = req.body.instrument   ?? null;
      const bm_elevation = req.body.bm_elevation ?? req.body.bmElevation ?? null;
      const method       = req.body.method       ?? null;
      const distance_k   = req.body.distance_k   ?? req.body.distanceK   ?? null;
      const result = await db.execute({
        sql: 'INSERT INTO projects (name, instrument, bm_elevation, method, distance_k, status, progress) VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING *',
        args: [name, instrument, bm_elevation, method, distance_k, status, progress],
      });
      return res.json(toObject(result));
    } catch (err) { return res.status(500).json({ success: false, message: err.message }); }
  }

  res.status(405).json({ success: false, message: 'Method not allowed' });
}
