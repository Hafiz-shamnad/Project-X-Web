const express = require('express');
const cors = require('cors');
const { initDB } = require('./src/config/db');

const challengeRoutes = require('./src/routes/challengeRoutes');
const leaderboardRoutes = require('./src/routes/leaderboardRoutes');
const userRoutes = require('./src/routes/userRoutes');
const flagRoutes = require('./src/routes/flagRoutes');

const app = express();
app.use(express.json());
app.use(cors());

// Initialize database
initDB();

// Routes
app.use('/api/challenges', challengeRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/user', userRoutes);
app.use('/api/flag', flagRoutes); 

// Health endpoint
app.get('/api/health', (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Project_X API running on port ${PORT}`));
