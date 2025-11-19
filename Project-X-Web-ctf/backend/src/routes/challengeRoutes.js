/**
 * Challenge Routes (ESM + Optimized)
 * ----------------------------------
 */

import express from "express";
import { authenticate } from "../middlewares/auth.js";

import {
  getChallengeById,
  getChallenges,
  getPublicChallenges,
  startChallenge,
  stopChallenge,
  getChallengeInstance,
  spawnChallengeInstance,
  extendInstance,
} from "../controllers/challengeController.js";

const router = express.Router();

/* ============================================================
   PUBLIC ROUTES (no auth)
   ============================================================ */

/** Public challenge list (released only) */
router.get("/public", getPublicChallenges);

/** All challenges (metadata only) — public by your current design */
router.get("/", getChallenges);

/** Get specific challenge */
router.get("/:id", getChallengeById);

/* ============================================================
   PROTECTED ROUTES (instances, lifecycle, private data)
   ============================================================ */

/** Require authentication for all below */
router.use(authenticate);

/** Retrieve user's running instance info */
router.get("/instance/:id", getChallengeInstance);

/** Spawn a new challenge instance */
router.post("/spawn/:id", spawnChallengeInstance);

/** Container lifecycle */
router.post("/start/:id", startChallenge);
router.post("/stop/:id", stopChallenge);

/** Extend active instance time */
router.post("/extend/:id", extendInstance);

export default router;
