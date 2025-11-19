/**
 * Profile Routes (ESM + Secure + Optimized)
 * -----------------------------------------
 * Handles:
 *  - Authenticated user's profile
 *  - Profile updates
 *  - Public profile pages
 */

import express from "express";
import { authenticate } from "../middlewares/auth.js";

import {
  getMyProfile,
  getPublicProfile,
  updateMyProfile,
} from "../controllers/profileController.js";

const router = express.Router();

/* ============================
   AUTHENTICATED PROFILE ACTIONS
   ============================ */
router.use("/me", authenticate);

/** My profile */
router.get("/me", getMyProfile);

/** Update my profile */
router.put("/me", updateMyProfile);

/* ============================
   PUBLIC PROFILE LOOKUP
   ============================ */
/** Public profile by username */
router.get("/:username", getPublicProfile);

export default router;
