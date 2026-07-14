import { getDb } from '../../_db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST')
    return res.status(405).json({ success: false, message: 'Method not allowed' });

  const db = await getDb();
  const { id } = req.query;

  try {
    await db.execute({ sql: 'UPDATE projects SET deleted_at = NULL WHERE id = ?', args: [id] });
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
