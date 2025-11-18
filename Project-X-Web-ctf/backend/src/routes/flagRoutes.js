/**
 * Flag Submission Routes (ESM)
 * ----------------------------
 * Handles:
 *  - User flag submissions for challenges
 */

import express from "express";
import { submitFlag } from "../controllers/flagController.js";

const router = express.Router();

/**
 * Submit a flag for a challenge
 * POST /api/flag/submit
 */
router.post("/submit", submitFlag);

export default router;
