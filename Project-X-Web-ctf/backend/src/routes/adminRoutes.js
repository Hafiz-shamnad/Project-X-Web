/**
 * Admin Routes
 * ------------
 * Protected administrative endpoints for managing challenges and teams.
 */

const express = require("express");
const multer = require("multer");
const { authenticate, requireAdmin } = require("../middlewares/auth");

const {
  createChallenge,
  updateChallenge,
  deleteChallenge,
  getAllChallenges,
  toggleRelease,
  getAllTeams,
  banTeam,
  unbanTeam,
  reduceTeamScore,
} = require("../controllers/adminController");

const router = express.Router();

/* -------------------------------------------------------------------------- */
/*                                   Upload                                    */
/* -------------------------------------------------------------------------- */

const upload = multer({
  dest: process.env.UPLOAD_DIR || "uploads/",
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

/* -------------------------------------------------------------------------- */
/*                               Challenge Routes                              */
/* -------------------------------------------------------------------------- */

/**
 * List all challenges
 * GET /api/admin/challenges
 */
router.get("/challenges", authenticate, requireAdmin, getAllChallenges);

/**
 * Create a new challenge
 * POST /api/admin/challenge
 */
router.post(
  "/challenge",
  authenticate,
  requireAdmin,
  upload.single("file"),
  createChallenge
);

/**
 * Update a challenge
 * PUT /api/admin/challenge/:id
 */
router.put(
  "/challenge/:id",
  authenticate,
  requireAdmin,
  upload.single("file"),
  updateChallenge
);

/**
 * Delete a challenge
 * DELETE /api/admin/challenge/:id
 */
router.delete("/challenge/:id", authenticate, requireAdmin, deleteChallenge);

/**
 * Toggle release status
 * PATCH /api/admin/challenge/:id/toggle
 */
router.patch(
  "/challenge/:id/toggle",
  authenticate,
  requireAdmin,
  toggleRelease
);

/* -------------------------------------------------------------------------- */
/*                                Team Routes                                  */
/* -------------------------------------------------------------------------- */

/**
 * Get all teams with scoring details
 * GET /api/admin/teams
 */
router.get("/teams", authenticate, requireAdmin, getAllTeams);

/**
 * Ban a team
 * POST /api/admin/team/:id/ban
 */
router.post("/team/:id/ban", authenticate, requireAdmin, banTeam);

/**
 * Unban a team
 * POST /api/admin/team/:id/unban
 */
router.post("/team/:id/unban", authenticate, requireAdmin, unbanTeam);

/**
 * Apply a score penalty to a team
 * POST /api/admin/team/:id/penalty
 */
router.post("/team/:id/penalty", authenticate, requireAdmin, reduceTeamScore);

module.exports = router;
