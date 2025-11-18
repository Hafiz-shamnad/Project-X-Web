/**
 * User Routes (ESM)
 * -----------------
 */

import express from "express";
import {
  createOrGetUser,
  getUser,
  toggleSolve,
} from "../controllers/userController.js";

const router = express.Router();

/**
 * Create or retrieve a user
 * POST /api/user
 */
router.post("/", createOrGetUser);

/**
 * Toggle solve status
 * POST /api/user/solve
 */
router.post("/solve", toggleSolve);

/**
 * Get a user's profile and solve history
 * GET /api/user/:username
 */
router.get("/:username", getUser);

export default router;
