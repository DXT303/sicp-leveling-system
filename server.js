import 'dotenv/config';
import express from 'express';

const app = express();
app.use(express.json());

app.post('/api/auth/login', (req, res) => {
  const { passcode } = req.body;
  if (passcode === process.env.PASSCODE) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, message: 'Invalid passcode' });
  }
});

app.listen(3001, () => console.log('API server running on port 3001'));
