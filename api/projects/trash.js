import { getDb, toObjects } from '../_db.js';

export default async function handler(req, res) {
  const db = await getDb();

  if (req.method === 'GET') {
    try {
      const result = await db.execute('SELECT * FROM projects WHERE deleted_at IS NOT NULL ORDER BY deleted_at DESC');
      return res.json(toObjects(result));
    } catch (err) { return res.status(500).json({ success: false, message: err.message }); }
  }

  // Permanent delete
  if (req.method === 'DELETE') {
    try {
      const { id } = req.body;
      await db.execute({ sql: 'DELETE FROM leveling_rows WHERE project_id = ?', args: [id] });
      await db.execute({ sql: 'DELETE FROM calibrations WHERE project_id = ?', args: [id] });
      await db.execute({ sql: 'DELETE FROM projects WHERE id = ?', args: [id] });
      return res.json({ success: true });
    } catch (err) { return res.status(500).json({ success: false, message: err.message }); }
  }

  res.status(405).json({ success: false, message: 'Method not allowed' });
}
