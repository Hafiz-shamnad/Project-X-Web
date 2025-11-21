/**
 * Team Routes (ESM + Secure + Optimized)
 * --------------------------------------
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

/* =====================================================
   AUTHENTICATED TEAM OPERATIONS
   ===================================================== */
router.use(authenticate);

/** Get authenticated user's team */
router.get("/me", getMyTeam);

/** Create a team */
router.post("/create", createTeam);

/** Join a team */
router.post("/join", joinTeam);

/** Get solves of team by ID */
router.get("/:id/solves", getTeamSolves);

export default router;
