/**
 * Profile Routes (ESM + Secure + Optimized)
 * -----------------------------------------
 */

import express from "express";
import { authenticate } from "../middlewares/auth.js";

import {
  getMyProfile,
  getPublicProfile,
  updateMyProfile,
} from "../controllers/profileController.js";

const router = express.Router();

/* --------------------------------------------------------------------------
   AUTHENTICATED USER PROFILE
   -------------------------------------------------------------------------- */

// All `/me` endpoints require authentication
router.use("/me", authenticate);

/** Get authenticated user's profile */
router.get("/me", getMyProfile);

/** Update authenticated user's profile */
router.put("/me", updateMyProfile);

/* --------------------------------------------------------------------------
   PUBLIC USER PROFILE (must stay last so it doesn’t override /me)
   -------------------------------------------------------------------------- */

/** Public profile by username */
router.get("/:username", getPublicProfile);

export default router;
