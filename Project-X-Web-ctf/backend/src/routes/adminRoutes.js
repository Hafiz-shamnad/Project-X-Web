const express = require('express');
const multer = require('multer');
const { requireAdmin, authenticate } = require('../middlewares/auth');
const {
  createChallenge,
  updateChallenge,
  deleteChallenge,
  getAllChallenges
} = require('../controllers/adminController');

const router = express.Router();

const upload = multer({
  dest: process.env.UPLOAD_DIR || 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// 🧩 List all challenges
router.get('/challenges', authenticate, requireAdmin, getAllChallenges);

// 🧩 Create a new challenge (with optional file)
router.post('/challenge', authenticate, requireAdmin, upload.single('file'), createChallenge);

// 🧩 Update existing challenge
router.put('/challenge/:id', authenticate, requireAdmin, upload.single('file'), updateChallenge);

// 🧩 Delete challenge
router.delete('/challenge/:id', authenticate, requireAdmin, deleteChallenge);

module.exports = router;
