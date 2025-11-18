/**
 * Challenge Routes (ESM)
 * ----------------------
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

/**
 * Instance Routes (protected)
 */
router.get("/instance/:id", authenticate, getChallengeInstance);
router.post("/spawn/:id", authenticate, spawnChallengeInstance);

/**
 * Public challenge list
 */
router.get("/public", getPublicChallenges);

/**
 * Get all challenges
 */
router.get("/", getChallenges);

/**
 * Get challenge metadata
 */
router.get("/:id", getChallengeById);

/**
 * Container lifecycle (protected)
 */
router.post("/start/:id", authenticate, startChallenge);
router.post("/stop/:id", authenticate, stopChallenge);
router.post("/extend/:id", authenticate, extendInstance);

export default router;
