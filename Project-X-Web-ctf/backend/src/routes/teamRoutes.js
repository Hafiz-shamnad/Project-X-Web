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

/* --------------------------------------------------------------------------
   AUTHENTICATED TEAM ACTIONS (all routes require auth)
   -------------------------------------------------------------------------- */
router.use(authenticate);

/** Get the authenticated user's team */
router.get("/me", getMyTeam);

/** Create a new team */
router.post("/create", createTeam);

/** Join a team via join code */
router.post("/join", joinTeam);

/* --------------------------------------------------------------------------
   GET TEAM SOLVES BY ID 
   (must remain last to avoid matching /me, /create, etc.)
   -------------------------------------------------------------------------- */
router.get("/:id/solves", getTeamSolves);

export default router;
