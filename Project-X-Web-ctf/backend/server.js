const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { initDB } = require('./src/config/db');
const path = require('path');


const challengeRoutes = require('./src/routes/challengeRoutes');
const leaderboardRoutes = require('./src/routes/leaderboardRoutes');
const userRoutes = require('./src/routes/userRoutes');
const flagRoutes = require('./src/routes/flagRoutes');
const authRoutes = require('./src/routes/authRoutes');
const adminRoutes = require('./src/routes/adminRoutes');

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));


// Initialize database
initDB();

// Routes
app.use('/api/challenges', challengeRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/user', userRoutes);
app.use('/api/flag', flagRoutes); 
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const fs = require('fs');

// ✅ Secure file download route (authenticated)
app.get('/api/download/:filename', async (req, res) => {
  try {
    const fileName = req.params.filename;

    // prevent path traversal
    if (!/^[a-zA-Z0-9._-]+$/.test(fileName)) {
      return res.status(400).json({ error: 'Invalid filename' });
    }

    const filePath = path.join(__dirname, 'uploads', fileName);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    // send file for download
    res.download(filePath, fileName);
  } catch (err) {
    console.error('❌ File download error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


// Health endpoint
app.get('/api/health', (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Project_X API running on port ${PORT}`));
