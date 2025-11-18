/**
 * Profile Routes (ESM)
 * --------------------
 */

import express from "express";
import { authenticate } from "../middlewares/auth.js";

import {
  getMyProfile,
  getPublicProfile,
  updateMyProfile,
} from "../controllers/profileController.js";

const router = express.Router();

/**
 * Authenticated profile
 */
router.get("/me", authenticate, getMyProfile);

/**
 * Update profile
 */
router.put("/me", authenticate, updateMyProfile);

/**
 * Public profile
 */
router.get("/:username", getPublicProfile);

export default router;
