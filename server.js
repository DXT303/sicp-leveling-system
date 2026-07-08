import 'dotenv/config';
import express from 'express';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import db from './src/db/client.js';
import { initSchema } from './src/db/schema.js';

const app = express();
app.use(express.json());

// Convert Turso array rows to objects using column names
function toObjects(result) {
  const cols = result.columns ?? [];
  return result.rows.map(row =>
    cols.length > 0 ? Object.fromEntries(cols.map((c, i) => [c, row[i]])) : row
  );
}

function toObject(result) {
  return toObjects(result)[0] ?? null;
}

// ── Rate Limiting ──
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many attempts. Try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

// ── Register ──
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  try {
    const existing = await db.execute({ sql: 'SELECT id FROM users WHERE email = ?', args: [email] });
    if (existing.rows.length > 0)
      return res.status(409).json({ success: false, message: 'Email already registered.' });
    const hashed = await bcrypt.hash(password, 10);
    await db.execute({ sql: 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)', args: [name, email, hashed] });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Registration failed.' });
  }
});

// ── Login ──
app.post('/api/auth/login', loginLimiter, async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  try {
    const result = await db.execute({ sql: 'SELECT id, name, email, password FROM users WHERE email = ?', args: [email] });
    if (result.rows.length === 0)
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    const row = result.rows[0];
    const cols = result.columns ?? [];
    const user = cols.length > 0
      ? Object.fromEntries(cols.map((c, i) => [c, row[i]]))
      : row;
    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    res.json({ success: true, name: user.name });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Login failed.' });
  }
});

// ── Update User (name + password) ──
app.patch('/api/auth/update', async (req, res) => {
  const { email, name, currentPassword, newPassword } = req.body;
  if (!email || !name)
    return res.status(400).json({ success: false, message: 'Email and name are required.' });
  try {
    const result = await db.execute({ sql: 'SELECT id, password FROM users WHERE email = ?', args: [email] });
    const user = toObject(result);
    if (!user)
      return res.status(404).json({ success: false, message: 'User not found.' });
    if (newPassword) {
      const match = await bcrypt.compare(currentPassword, user.password);
      if (!match)
        return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
      const hashed = await bcrypt.hash(newPassword, 10);
      await db.execute({ sql: 'UPDATE users SET name = ?, password = ? WHERE email = ?', args: [name, hashed, email] });
    } else {
      await db.execute({ sql: 'UPDATE users SET name = ? WHERE email = ?', args: [name, email] });
    }
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ── Projects ──
app.get('/api/projects', async (req, res) => {
  try {
    const result = await db.execute('SELECT * FROM projects ORDER BY created_at DESC');
    res.json(toObjects(result));
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.post('/api/projects', async (req, res) => {
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
    res.json(toObject(result));
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.patch('/api/projects/:id', async (req, res) => {
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
      args: [name ?? null, instrument ?? null, bm_elevation ?? null, method ?? null, distance_k ?? null, status ?? null, progress ?? null, req.params.id],
    });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.delete('/api/projects/:id', async (req, res) => {
  try {
    await db.execute({ sql: 'DELETE FROM projects WHERE id = ?', args: [req.params.id] });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ── Leveling Rows ──
app.get('/api/projects/:id/rows', async (req, res) => {
  try {
    const result = await db.execute({
      sql: 'SELECT * FROM leveling_rows WHERE project_id = ? ORDER BY row_order',
      args: [req.params.id],
    });
    res.json(toObjects(result));
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.post('/api/projects/:id/rows', async (req, res) => {
  try {
    const { station, bs, is_val, fs, hi, rise, fall, rl, remarks, row_order } = req.body;
    const result = await db.execute({
      sql: `INSERT INTO leveling_rows (project_id, station, bs, is_val, fs, hi, rise, fall, rl, remarks, row_order)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`,
      args: [
        req.params.id,
        station  ?? null,
        bs       ?? null,
        is_val   ?? null,
        fs       ?? null,
        hi       ?? null,
        rise     ?? null,
        fall     ?? null,
        rl       ?? null,
        remarks  ?? null,
        row_order ?? 0,
      ],
    });
    res.json(toObject(result));
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.delete('/api/projects/:id/rows', async (req, res) => {
  try {
    await db.execute({ sql: 'DELETE FROM leveling_rows WHERE project_id = ?', args: [req.params.id] });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ── Bulk Import Observations ──
app.post('/api/observations/bulk', async (req, res) => {
  try {
    const { project_id, observations } = req.body;
    if (!project_id || !observations || !Array.isArray(observations)) {
      return res.status(400).json({ success: false, message: 'Invalid request' });
    }
    
    // Insert all observations
    for (let i = 0; i < observations.length; i++) {
      const obs = observations[i];
      await db.execute({
        sql: `INSERT INTO leveling_rows (project_id, station, bs, is_val, fs, hi, rise, fall, rl, row_order)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          project_id,
          obs.station ?? null,
          obs.bs ?? null,
          obs.is ?? null,
          obs.fs ?? null,
          obs.hi ?? null,
          obs.rise ?? null,
          obs.fall ?? null,
          obs.rl ?? null,
          i,
        ],
      });
    }
    
    res.json({ success: true, count: observations.length });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ── Calibrations ──
app.get('/api/calibrations', async (req, res) => {
  try {
    const result = await db.execute('SELECT * FROM calibrations ORDER BY created_at DESC');
    res.json(toObjects(result));
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.post('/api/calibrations', async (req, res) => {
  try {
    const { project_id, instrument, date, d1_near, d1_far, d2_near, d2_far, error, status, method, distance } = req.body;
    const result = await db.execute({
      sql: `INSERT INTO calibrations (project_id, instrument, date, d1_near, d1_far, d2_near, d2_far, error, status, method, distance)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`,
      args: [
        project_id ?? null,
        instrument ?? null,
        date       ?? null,
        d1_near    ?? null,
        d1_far     ?? null,
        d2_near    ?? null,
        d2_far     ?? null,
        error      ?? null,
        status     ?? null,
        method     ?? null,
        distance   ?? null,
      ],
    });
    res.json(toObject(result));
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.get('/api/projects/:id/calibration', async (req, res) => {
  try {
    const result = await db.execute({
      sql: 'SELECT * FROM calibrations WHERE project_id = ? ORDER BY created_at DESC LIMIT 1',
      args: [req.params.id],
    });
    res.json(toObject(result));
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.patch('/api/calibrations/:id', async (req, res) => {
  try {
    const { instrument, date, d1_near, d1_far, d2_near, d2_far, error, status, method, distance } = req.body;
    await db.execute({
      sql: `UPDATE calibrations SET
        instrument = COALESCE(?, instrument),
        date       = COALESCE(?, date),
        d1_near    = COALESCE(?, d1_near),
        d1_far     = COALESCE(?, d1_far),
        d2_near    = COALESCE(?, d2_near),
        d2_far     = COALESCE(?, d2_far),
        error      = COALESCE(?, error),
        status     = COALESCE(?, status),
        method     = COALESCE(?, method),
        distance   = COALESCE(?, distance)
      WHERE id = ?`,
      args: [instrument ?? null, date ?? null, d1_near ?? null, d1_far ?? null, d2_near ?? null, d2_far ?? null, error ?? null, status ?? null, method ?? null, distance ?? null, req.params.id],
    });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.delete('/api/calibrations/:id', async (req, res) => {
  try {
    await db.execute({ sql: 'DELETE FROM calibrations WHERE id = ?', args: [req.params.id] });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ── Dashboard Stats ──
app.get('/api/stats/dashboard', async (req, res) => {
  try {
    const calTotal = await db.execute('SELECT COUNT(*) as cnt FROM calibrations');
    const calPending = await db.execute(
      `SELECT COUNT(*) as cnt FROM projects
       WHERE progress >= 25
       AND id NOT IN (SELECT project_id FROM calibrations WHERE project_id IS NOT NULL)`
    );
    // Last closure: most recent project with >= 2 rows that has rl values
    const lastProject = await db.execute(
      `SELECT p.id, p.distance_k FROM projects p
       WHERE (SELECT COUNT(*) FROM leveling_rows WHERE project_id = p.id) >= 2
       ORDER BY p.created_at DESC LIMIT 1`
    );
    let lastClosureMm = null;
    const proj = toObject(lastProject);
    if (proj) {
      const rows = await db.execute({
        sql: 'SELECT bs, fs, rl FROM leveling_rows WHERE project_id = ? ORDER BY row_order',
        args: [proj.id],
      });
      const rws = toObjects(rows);
      if (rws.length >= 2) {
        const sumBS = rws.reduce((s, r) => s + (Number(r.bs) || 0), 0);
        const sumFS = rws.reduce((s, r) => s + (Number(r.fs) || 0), 0);
        const firstRL = Number(rws[0].rl) || 0;
        const lastRL  = Number(rws[rws.length - 1].rl) || 0;
        lastClosureMm = ((sumBS - sumFS) - (lastRL - firstRL)) * 1000;
      }
    }
    res.json({
      calibrationTotal: Number(toObject(calTotal)?.cnt ?? 0),
      calibrationPending: Number(toObject(calPending)?.cnt ?? 0),
      lastClosureMm,
    });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ── Activity Logs ──
app.get('/api/logs', async (req, res) => {
  try {
    const result = await db.execute('SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 50');
    res.json(toObjects(result));
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.post('/api/logs', async (req, res) => {
  try {
    const { type, message, sub, details } = req.body;
    const result = await db.execute({
      sql: 'INSERT INTO activity_logs (type, message, sub, details) VALUES (?, ?, ?, ?) RETURNING *',
      args: [type, message, sub ?? null, details ?? null],
    });
    res.json(toObject(result));
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ── Start (local) / Export (Vercel) ──
initSchema().catch(err => console.error('Schema init failed:', err.message));

if (!process.env.VERCEL) {
  app.listen(3001, () => console.log('API server running on port 3001'));
}

export default app;
