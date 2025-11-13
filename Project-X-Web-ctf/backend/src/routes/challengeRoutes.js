/**
 * Challenge Routes
 * ----------------
 * Handles:
 *  - Fetching all challenges
 *  - Fetching public released challenges
 *  - Fetching individual challenge details
 */

const express = require("express");
const {
  getChallengeById,
  getChallenges,
  getPublicChallenges,
} = require("../controllers/challengeController");

const router = express.Router();

/* -------------------------------------------------------------------------- */
/*                                Public Routes                                */
/* -------------------------------------------------------------------------- */

/**
 * Get all public released challenges
 * GET /api/challenges/public
 */
router.get("/public", getPublicChallenges);

/**
 * Get all challenges (admin or internal use depending on controller behavior)
 * GET /api/challenges
 */
router.get("/", getChallenges);

/**
 * Get a challenge by ID
 * GET /api/challenges/:id
 */
router.get("/:id", getChallengeById);

module.exports = router;
