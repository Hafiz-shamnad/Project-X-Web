/**
 * User Routes
 * -----------
 * Handles:
 *  - Creating or retrieving a user
 *  - Fetching user details
 *  - Toggling challenge solve status
 */

const express = require("express");
const {
  createOrGetUser,
  getUser,
  toggleSolve,
} = require("../controllers/userController");

const router = express.Router();

/* -------------------------------------------------------------------------- */
/*                                   Routes                                    */
/* -------------------------------------------------------------------------- */

/**
 * Create a user if not exists, otherwise return existing user
 * POST /api/user
 */
router.post("/", createOrGetUser);

/**
 * Toggle a user's solve status on a challenge
 * POST /api/user/solve
 */
router.post("/solve", toggleSolve);

/**
 * Get a user's profile and solve history
 * GET /api/user/:username
 */
router.get("/:username", getUser);

module.exports = router;
