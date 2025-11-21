/**
 * Admin Routes (ESM + Cookie Auth + Hardened)
 * -------------------------------------------
 * All routes under /api/admin/*
 *   - Require valid cookie-based JWT auth
 *   - Require admin role
 */

import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";

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
  bulkDelete,
  bulkHide,
  bulkRelease
} from "../controllers/adminController.js";

const router = express.Router();

/* -------------------------------------------------------------------------- */
/*                           UPLOAD DIRECTORY SAFETY                           */
/* -------------------------------------------------------------------------- */

const UPLOAD_DIR = process.env.UPLOAD_DIR || "uploads";

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  console.log("📁 Created upload directory:", UPLOAD_DIR);
}

/* -------------------------------------------------------------------------- */
/*                           Multer Upload Config                               */
/* -------------------------------------------------------------------------- */

const upload = multer({
  dest: UPLOAD_DIR,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

/* -------------------------------------------------------------------------- */
/*                          ROUTE MIDDLEWARE (GLOBAL)                           */
/* -------------------------------------------------------------------------- */

// All admin routes need authentication + admin role
router.use(authenticate, requireAdmin);

/* -------------------------------------------------------------------------- */
/*                              Challenge Management                             */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/*                                Team Management                               */
/* -------------------------------------------------------------------------- */

router.get("/teams", getAllTeams);
router.post("/team/:id/ban", banTeam);
router.post("/team/:id/unban", unbanTeam);
router.post("/team/:id/penalty", reduceTeamScore);

/* -------------------------------------------------------------------------- */
/*                              Bulk Operations                                */
/* -------------------------------------------------------------------------- */

router.patch("/challenges/bulk/release", bulkRelease);
router.patch("/challenges/bulk/hide", bulkHide);
router.delete("/challenges/bulk/delete", bulkDelete);


export default router;
