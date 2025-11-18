/**
 * Leaderboard Routes (ESM)
 * ------------------------
 */

import express from "express";
import {
  getLeaderboard,
  getTeamLeaderboard,
  getTeamMembersLeaderboard,
} from "../controllers/leaderboardController.js";

const router = express.Router();

/**
 * Global leaderboard
 */
router.get("/", getLeaderboard);

/**
 * Team leaderboard
 */
router.get("/teams", getTeamLeaderboard);

/**
 * Internal team leaderboard
 */
router.get("/team/:id", getTeamMembersLeaderboard);

export default router;
