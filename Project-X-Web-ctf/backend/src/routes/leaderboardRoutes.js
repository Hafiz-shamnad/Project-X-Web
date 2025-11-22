/**
 * Leaderboard Routes (ESM + Optimized + Collision-Safe)
 * -----------------------------------------------------
 * Public endpoints:
 *   - Global leaderboard
 *   - Team leaderboard
 *   - Internal team leaderboard
 */

import express from "express";
import {
  getLeaderboard,
  getTeamLeaderboard,
  getTeamMembersLeaderboard,
} from "../controllers/leaderboardController.js";

const router = express.Router();

/* -------------------------------------------------------------------------- */
/*                               GLOBAL LEADERBOARD                            */
/* -------------------------------------------------------------------------- */
router.get("/", getLeaderboard);

/* -------------------------------------------------------------------------- */
/*                                TEAM LEADERBOARD                             */
/* -------------------------------------------------------------------------- */
router.get("/teams", getTeamLeaderboard);

/* -------------------------------------------------------------------------- */
/*                        INTERNAL MEMBERS LEADERBOARD                         */
/* -------------------------------------------------------------------------- */
/**
 * MUST be last among routes beginning with `/team/*`
 * to avoid matching `/team/anything` unintentionally.
 */
router.get("/team/:id", getTeamMembersLeaderboard);

export default router;
