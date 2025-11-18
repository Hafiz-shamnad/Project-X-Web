/**
 * Team Routes (ESM)
 * -----------------
 */

import express from "express";
import { authenticate } from "../middlewares/auth.js";

import {
  getMyTeam,
  createTeam,
  joinTeam,
  getTeamSolves,
} from "../controllers/teamController.js";

const router = express.Router();

/**
 * Authenticated user's team
 */
router.get("/me", authenticate, getMyTeam);

/**
 * Create team
 */
router.post("/create", authenticate, createTeam);

/**
 * Join team
 */
router.post("/join", authenticate, joinTeam);

/**
 * Team solves history
 */
router.get("/:id/solves", authenticate, getTeamSolves);

export default router;
