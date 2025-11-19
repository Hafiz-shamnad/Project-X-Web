/**
 * Leaderboard Routes (ESM + Optimized)
 * ------------------------------------
 * Public endpoints for:
 *  - Global leaderboard
 *  - Team leaderboard
 *  - Internal team leaderboard
 */

import express from "express";
import {
  getLeaderboard,
  getTeamLeaderboard,
  getTeamMembersLeaderboard,
} from "../controllers/leaderboardController.js";

const router = express.Router();

/** Global leaderboard */
router.get("/", getLeaderboard);

/** Team leaderboard */
router.get("/teams", getTeamLeaderboard);

/** Members inside a specific team */
router.get("/team/:id", getTeamMembersLeaderboard);

export default router;
