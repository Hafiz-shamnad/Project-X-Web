/**
 * Challenge Routes (ESM + Optimized + Cookie Safe)
 * ------------------------------------------------
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
   PUBLIC ROUTES
   ============================================================ */

/** Public released challenges */
router.get("/public", getPublicChallenges);

/** All challenges (metadata only) */
router.get("/", getChallenges);

/* ============================================================
   AUTH-PROTECTED ROUTES MUST COME BEFORE /:id
   ============================================================ */

router.use(authenticate);

/** Challenge instance status */
router.get("/instance/:id", getChallengeInstance);

/** Spawn new instance */
router.post("/spawn/:id", spawnChallengeInstance);

/** Start container (legacy) */
router.post("/start/:id", startChallenge);

/** Stop container */
router.post("/stop/:id", stopChallenge);

/** Extend container TTL */
router.post("/extend/:id", extendInstance);

/* ============================================================
   PUBLIC GET-BY-ID (must be last to avoid route collisions)
   ============================================================ */

router.get("/:id", getChallengeById);

export default router;
