const express = require('express');
const multer = require('multer');
const { requireAdmin, authenticate } = require('../middlewares/auth');
const {
  createChallenge,
  updateChallenge,
  deleteChallenge,
  getAllChallenges,
  toggleRelease,
  getAllTeams
} = require('../controllers/adminController');

const router = express.Router();
const upload = multer({
  dest: process.env.UPLOAD_DIR || 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// 📜 List all challenges
router.get('/challenges', authenticate, requireAdmin, getAllChallenges);

// ➕ Create new challenge
router.post('/challenge', authenticate, requireAdmin, upload.single('file'), createChallenge);

// ✏️ Update challenge
router.put('/challenge/:id', authenticate, requireAdmin, upload.single('file'), updateChallenge);

// ❌ Delete challenge
router.delete('/challenge/:id', authenticate, requireAdmin, deleteChallenge);

// 🔁 Toggle release/stop
router.patch('/challenge/:id/toggle', authenticate, requireAdmin, toggleRelease);

// 🧑‍🤝‍🧑 Get all teams (admin only)
router.get("/teams", authenticate, requireAdmin, getAllTeams);


module.exports = router;
