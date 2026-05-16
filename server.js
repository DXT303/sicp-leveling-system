import 'dotenv/config';
import express from 'express';
import rateLimit from 'express-rate-limit';
import db from './src/db/client.js';
import { initSchema } from './src/db/schema.js';

const app = express();
app.use(express.json());

// ── Rate Limiting ──
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Too many attempts. Try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

// ── Login ──
app.post('/api/auth/login', loginLimiter, (req, res) => {
  const { passcode } = req.body;
  if (passcode === process.env.PASSCODE) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, message: 'Invalid passcode' });
  }
});

// ── Projects ──
app.get('/api/projects', async (req, res) => {
  const result = await db.execute('SELECT * FROM projects ORDER BY created_at DESC');
  res.json(result.rows);
});

app.post('/api/projects', async (req, res) => {
  const { name, status = 'active', progress = 0 } = req.body;
  const result = await db.execute({
    sql: 'INSERT INTO projects (name, status, progress) VALUES (?, ?, ?) RETURNING *',
    args: [name, status, progress],
  });
  res.json(result.rows[0]);
});

app.patch('/api/projects/:id', async (req, res) => {
  const { name, status, progress } = req.body;
  await db.execute({
    sql: 'UPDATE projects SET name = COALESCE(?, name), status = COALESCE(?, status), progress = COALESCE(?, progress) WHERE id = ?',
    args: [name ?? null, status ?? null, progress ?? null, req.params.id],
  });
  res.json({ success: true });
});

app.delete('/api/projects/:id', async (req, res) => {
  await db.execute({ sql: 'DELETE FROM projects WHERE id = ?', args: [req.params.id] });
  res.json({ success: true });
});

// ── Leveling Rows ──
app.get('/api/projects/:id/rows', async (req, res) => {
  const result = await db.execute({
    sql: 'SELECT * FROM leveling_rows WHERE project_id = ? ORDER BY row_order',
    args: [req.params.id],
  });
  res.json(result.rows);
});

app.post('/api/projects/:id/rows', async (req, res) => {
  const { station, bs, is_val, fs, hi, rise, fall, rl, remarks, row_order } = req.body;
  const result = await db.execute({
    sql: `INSERT INTO leveling_rows (project_id, station, bs, is_val, fs, hi, rise, fall, rl, remarks, row_order)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`,
    args: [req.params.id, station, bs, is_val, fs, hi, rise, fall, rl, remarks, row_order ?? 0],
  });
  res.json(result.rows[0]);
});

app.delete('/api/projects/:id/rows', async (req, res) => {
  await db.execute({ sql: 'DELETE FROM leveling_rows WHERE project_id = ?', args: [req.params.id] });
  res.json({ success: true });
});

// ── Calibrations ──
app.get('/api/calibrations', async (req, res) => {
  const result = await db.execute('SELECT * FROM calibrations ORDER BY created_at DESC');
  res.json(result.rows);
});

app.post('/api/calibrations', async (req, res) => {
  const { project_id, instrument, date, d1_near, d1_far, d2_near, d2_far, error, status } = req.body;
  const result = await db.execute({
    sql: `INSERT INTO calibrations (project_id, instrument, date, d1_near, d1_far, d2_near, d2_far, error, status)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`,
    args: [project_id, instrument, date, d1_near, d1_far, d2_near, d2_far, error, status],
  });
  res.json(result.rows[0]);
});

// ── Activity Logs ──
app.get('/api/logs', async (req, res) => {
  const result = await db.execute('SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 50');
  res.json(result.rows);
});

app.post('/api/logs', async (req, res) => {
  const { type, message, sub } = req.body;
  const result = await db.execute({
    sql: 'INSERT INTO activity_logs (type, message, sub) VALUES (?, ?, ?) RETURNING *',
    args: [type, message, sub ?? null],
  });
  res.json(result.rows[0]);
});

// ── Start ──
initSchema()
  .then(() => app.listen(3001, () => console.log('API server running on port 3001')))
  .catch((err) => {
    console.error('❌ Failed to initialize database:', err.message);
    process.exit(1);
  });
