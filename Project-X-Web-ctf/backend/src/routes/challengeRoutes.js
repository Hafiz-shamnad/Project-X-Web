const express = require("express");
const {
  getChallengeById,
  getChallenges,
  getPublicChallenges,
  startChallenge,
  stopChallenge,
  getChallengeInstance,
  spawnChallengeInstance
} = require("../controllers/challengeController");

const router = express.Router();

/* ------------------- Instance Routes MUST come FIRST ------------------- */
router.get("/instance/:id", getChallengeInstance);
router.post("/spawn/:id", spawnChallengeInstance);

/* ----------------------------- Public Routes ---------------------------- */
router.get("/public", getPublicChallenges);
router.get("/", getChallenges);

/* ------------------------- Challenge Metadata --------------------------- */
router.get("/:id", getChallengeById);

/* ------------------------- Container Lifecycle -------------------------- */
router.post("/start/:id", startChallenge);
router.post("/stop/:id", stopChallenge);

module.exports = router;
