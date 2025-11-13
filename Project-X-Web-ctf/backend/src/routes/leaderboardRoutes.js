/**
 * Leaderboard Routes
 * -------------------
 * Handles:
 *  - Global user leaderboard
 *  - Global team leaderboard
 *  - Team-specific member leaderboard
 */

const express = require("express");
const router = express.Router();
const {
  getLeaderboard,
  getTeamLeaderboard,
  getTeamMembersLeaderboard,
} = require("../controllers/leaderboardController");

/* -------------------------------------------------------------------------- */
/*                                   Routes                                    */
/* -------------------------------------------------------------------------- */

/**
 * Global user leaderboard
 * GET /api/leaderboard
 */
router.get("/", getLeaderboard);

/**
 * Global team leaderboard
 * GET /api/leaderboard/teams
 */
router.get("/teams", getTeamLeaderboard);

/**
 * Team-specific internal leaderboard
 * GET /api/leaderboard/team/:id
 */
router.get("/team/:id", getTeamMembersLeaderboard);

module.exports = router;
