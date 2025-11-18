/**
 * Admin Routes (ESM)
 * ------------------
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

const upload = multer({
  dest: process.env.UPLOAD_DIR || "uploads/",
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

/**
 * Challenge management
 */
router.get("/challenges", authenticate, requireAdmin, getAllChallenges);
router.post("/challenge", authenticate, requireAdmin, upload.single("file"), createChallenge);
router.put("/challenge/:id", authenticate, requireAdmin, upload.single("file"), updateChallenge);
router.delete("/challenge/:id", authenticate, requireAdmin, deleteChallenge);
router.patch("/challenge/:id/toggle", authenticate, requireAdmin, toggleRelease);

/**
 * Team management
 */
router.get("/teams", authenticate, requireAdmin, getAllTeams);
router.post("/team/:id/ban", authenticate, requireAdmin, banTeam);
router.post("/team/:id/unban", authenticate, requireAdmin, unbanTeam);
router.post("/team/:id/penalty", authenticate, requireAdmin, reduceTeamScore);

export default router;
