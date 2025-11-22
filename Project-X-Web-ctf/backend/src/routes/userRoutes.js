/**
 * User Routes (ESM + Clean + Secured)
 */

import { Router } from "express";

import {
  createOrGetUser,
  getUser,
  toggleSolve,
} from "../controllers/userController.js";

import { authenticate } from "../middlewares/auth.js";

const router = Router();

/* ---------------------------------------------------------
   PUBLIC ROUTES
--------------------------------------------------------- */

// Create or fetch user by username
router.post("/create", createOrGetUser);

// Get user profile (with solved challenges)
router.get("/:username", getUser);


/* ---------------------------------------------------------
   PROTECTED ROUTES (Requires login via HttpOnly cookie)
--------------------------------------------------------- */

// Toggle challenge solve
router.post("/solve/toggle", authenticate, toggleSolve);

export default router;
