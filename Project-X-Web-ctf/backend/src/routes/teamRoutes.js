/**
 * Team Routes
 * -----------
 * Handles:
 *  - Fetching authenticated user's team
 *  - Creating a team
 *  - Joining a team
 *  - Fetching a team's solve history
 */

const express = require("express");
const { authenticate } = require("../middlewares/auth");

const {
  getMyTeam,
  createTeam,
  joinTeam,
  getTeamSolves,
} = require("../controllers/teamController");

const router = express.Router();

/* -------------------------------------------------------------------------- */
/*                             Authenticated Routes                             */
/* -------------------------------------------------------------------------- */

/**
 * Get the authenticated user's team
 * GET /api/team/me
 */
router.get("/me", authenticate, getMyTeam);

/**
 * Create a new team
 * POST /api/team/create
 */
router.post("/create", authenticate, createTeam);

/**
 * Join an existing team via join code
 * POST /api/team/join
 */
router.post("/join", authenticate, joinTeam);

/**
 * Get all solves made by members of a specific team
 * GET /api/team/:id/solves
 */
router.get("/:id/solves", authenticate, getTeamSolves);

module.exports = router;
