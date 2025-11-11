const express = require('express');
const { authenticate } = require('../middlewares/auth');
const {
  getMyProfile,
  getPublicProfile,
  updateMyProfile,
} = require('../controllers/profileController');

const router = express.Router();

// Authenticated user profile
router.get('/me', authenticate, getMyProfile);

// Update profile (bio, country, avatar)
router.put('/me', authenticate, updateMyProfile);

// Public profile by username
router.get('/:username', getPublicProfile);

module.exports = router;
