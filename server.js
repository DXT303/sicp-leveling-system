import 'dotenv/config';
import express from 'express';
import rateLimit from 'express-rate-limit';

const app = express();
app.use(express.json());

// ── Rate Limiting: max 5 attempts per 15 minutes ──
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Too many attempts. Try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ── Login Route ──
app.post('/api/auth/login', loginLimiter, (req, res) => {
  const { passcode } = req.body;
  if (passcode === process.env.PASSCODE) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, message: 'Invalid passcode' });
  }
});

app.listen(3001, () => console.log('API server running on port 3001'));
