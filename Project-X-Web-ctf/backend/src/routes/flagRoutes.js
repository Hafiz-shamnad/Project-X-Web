/**
 * Flag Submission Routes (ESM + Secure + Cookie Auth)
 * ---------------------------------------------------
 * Handles:
 *   - User flag submissions for challenges
 */

import express from "express";
import { authenticate } from "../middlewares/auth.js";
import { submitFlag } from "../controllers/flagController.js";

const router = express.Router();

/**
 * Submit a flag for a challenge
 * POST /api/flag/submit
 * Requires:
 *   - Valid cookie-based JWT (authenticate)
 *   - Body: { challengeId, flag }
 */
router.post("/submit", authenticate, submitFlag);

export default router;
