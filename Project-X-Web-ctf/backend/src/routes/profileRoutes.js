/**
 * Profile Routes
 * --------------
 * Handles:
 *  - Authenticated user profile retrieval
 *  - Profile updates
 *  - Public profile lookup by username
 */

const express = require("express");
const { authenticate } = require("../middlewares/auth");

const {
  getMyProfile,
  getPublicProfile,
  updateMyProfile,
} = require("../controllers/profileController");

const router = express.Router();

/* -------------------------------------------------------------------------- */
/*                               Authenticated Routes                           */
/* -------------------------------------------------------------------------- */

/**
 * Get the authenticated user's profile
 * GET /api/profile/me
 */
router.get("/me", authenticate, getMyProfile);

/**
 * Update authenticated user's profile
 * PUT /api/profile/me
 */
router.put("/me", authenticate, updateMyProfile);

/* -------------------------------------------------------------------------- */
/*                                  Public Routes                               */
/* -------------------------------------------------------------------------- */

/**
 * Get a public profile by username
 * GET /api/profile/:username
 */
router.get("/:username", getPublicProfile);

module.exports = router;
