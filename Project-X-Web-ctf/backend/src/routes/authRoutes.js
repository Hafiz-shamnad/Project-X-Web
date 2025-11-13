/**
 * Authentication Routes
 * ----------------------
 * Handles:
 *  - User registration
 *  - Login
 *  - Logout
 *  - Session check (/me)
 */

const express = require("express");
const { register, login, logout, me } = require("../controllers/authController");
const { authenticate } = require("../middlewares/auth");

const router = express.Router();

/* -------------------------------------------------------------------------- */
/*                                 Public Routes                               */
/* -------------------------------------------------------------------------- */

/**
 * Register a new user
 * POST /api/auth/register
 */
router.post("/register", register);

/**
 * Authenticate a user and issue a session token
 * POST /api/auth/login
 */
router.post("/login", login);

/**
 * Clear authentication cookie
 * POST /api/auth/logout
 */
router.post("/logout", logout);

/* -------------------------------------------------------------------------- */
/*                               Protected Routes                              */
/* -------------------------------------------------------------------------- */

/**
 * Get authenticated user's session data
 * GET /api/auth/me
 */
router.get("/me", authenticate, me);

module.exports = router;
