const express = require('express');
const multer = require('multer');
const { requireAdmin, authenticate } = require('../middlewares/auth');
const { createChallenge, updateChallenge, deleteChallenge } = require('../controllers/adminController');

const router = express.Router();

const upload = multer({
  dest: process.env.UPLOAD_DIR || 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// All admin endpoints must be authenticated + admin
router.post('/challenge', authenticate, requireAdmin, upload.single('file'), createChallenge);
router.put('/challenge/:id', authenticate, requireAdmin, upload.single('file'), updateChallenge);
router.delete('/challenge/:id', authenticate, requireAdmin, deleteChallenge);

module.exports = router;
