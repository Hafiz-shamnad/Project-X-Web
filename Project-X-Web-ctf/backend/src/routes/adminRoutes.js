/**
 * Admin Routes (ESM + Optimized)
 * ------------------------------
 * All routes under /api/admin/* require:
 *   - Valid Bearer token
 *   - Admin role
 */

import express from "express";
import multer from "multer";
import { authenticate, requireAdmin } from "../middlewares/auth.js";

import {
  createChallenge,
  updateChallenge,
  deleteChallenge,
  getAllChallenges,
  toggleRelease,
  getAllTeams,
  banTeam,
  unbanTeam,
  reduceTeamScore,
} from "../controllers/adminController.js";

const router = express.Router();

// Multer upload config (10MB limit)
const upload = multer({
  dest: process.env.UPLOAD_DIR || "uploads/",
  limits: { fileSize: 10 * 1024 * 1024 },
});

// ---------------------------------------------
//  Apply authentication for ALL admin routes
// ---------------------------------------------
router.use(authenticate, requireAdmin);

// ---------------------------------------------
//  Challenge Management
// ---------------------------------------------
router.get("/challenges", getAllChallenges);

router.post(
  "/challenge",
  upload.single("file"),
  createChallenge
);

router.put(
  "/challenge/:id",
  upload.single("file"),
  updateChallenge
);

router.delete("/challenge/:id", deleteChallenge);

router.patch("/challenge/:id/toggle", toggleRelease);

// ---------------------------------------------
//  Team Management
// ---------------------------------------------
router.get("/teams", getAllTeams);
router.post("/team/:id/ban", banTeam);
router.post("/team/:id/unban", unbanTeam);
router.post("/team/:id/penalty", reduceTeamScore);

export default router;
