/**
 * User Routes (ESM + Optimized)
 * -----------------------------
 */

import express from "express";
import {
  createOrGetUser,
  getUser,
  toggleSolve,
} from "../controllers/userController.js";

import { authenticate } from "../middlewares/auth.js";

const router = express.Router();

/* =====================================================
   CREATE OR RETRIEVE USER (for legacy / compatibility)
   ===================================================== */
router.post("/", createOrGetUser);

/* =====================================================
   SOLVE TOGGLE (must be protected)
   ===================================================== */
router.post("/solve", authenticate, toggleSolve);

/* =====================================================
   PUBLIC USER PROFILE
   ===================================================== */
router.get("/:username", getUser);

export default router;
