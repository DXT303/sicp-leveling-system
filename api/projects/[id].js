import { getDb, toObject } from '../_db.js';

export default async function handler(req, res) {
  const db = await getDb();
  const { id } = req.query;

  if (req.method === 'PATCH') {
    try {
      const { name, instrument, bm_elevation, method, distance_k, status, progress } = req.body;
      await db.execute({
        sql: `UPDATE projects SET
          name         = COALESCE(?, name),
          instrument   = COALESCE(?, instrument),
          bm_elevation = COALESCE(?, bm_elevation),
          method       = COALESCE(?, method),
          distance_k   = COALESCE(?, distance_k),
          status       = COALESCE(?, status),
          progress     = COALESCE(?, progress)
        WHERE id = ?`,
        args: [name ?? null, instrument ?? null, bm_elevation ?? null, method ?? null, distance_k ?? null, status ?? null, progress ?? null, id],
      });
      return res.json({ success: true });
    } catch (err) { return res.status(500).json({ success: false, message: err.message }); }
  }

  if (req.method === 'DELETE') {
    try {
      await db.execute({ sql: 'DELETE FROM leveling_rows WHERE project_id = ?', args: [id] });
      await db.execute({ sql: 'DELETE FROM calibrations WHERE project_id = ?', args: [id] });
      await db.execute({ sql: 'DELETE FROM projects WHERE id = ?', args: [id] });
      return res.json({ success: true });
    } catch (err) { return res.status(500).json({ success: false, message: err.message }); }
  }

  res.status(405).json({ success: false, message: 'Method not allowed' });
}
