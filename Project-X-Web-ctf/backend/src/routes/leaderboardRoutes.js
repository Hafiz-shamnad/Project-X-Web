const express = require('express');
const router = express.Router();
const leaderboardController = require('../controllers/leaderboardController');

// 🌍 Global User Leaderboard
router.get('/', leaderboardController.getLeaderboard);

// 🏆 Team Leaderboard
router.get('/teams', leaderboardController.getTeamLeaderboard);

// 👥 Team Member Leaderboard (specific team)
router.get('/team/:id', leaderboardController.getTeamMembersLeaderboard);

module.exports = router;
