const express = require("express");
const { authenticate } = require("../middlewares/auth");


const {
  getChallengeById,
  getChallenges,
  getPublicChallenges,
  startChallenge,
  stopChallenge,
  getChallengeInstance,
  spawnChallengeInstance,
  extendInstance
} = require("../controllers/challengeController");

const router = express.Router();

/* ------------------- Instance Routes (protected) ------------------- */
// User must be logged in to view their container instance
router.get("/instance/:id", authenticate, getChallengeInstance);

// User must be logged in to spawn a container
router.post("/spawn/:id", authenticate, spawnChallengeInstance);

/* ----------------------------- Public Routes ---------------------------- */
// Public info – no login required
router.get("/public", getPublicChallenges);

// Might be public or admin depending on your app; currently public
router.get("/", getChallenges);

/* ------------------------- Challenge Metadata --------------------------- */
// Challenge details (if private challenges shouldn't be visible, move behind auth)
router.get("/:id", getChallengeById);

/* ------------------------- Container Lifecycle -------------------------- */
// Starting/stopping a container requires login
router.post("/start/:id", authenticate, startChallenge);
router.post("/stop/:id", authenticate, stopChallenge);
router.post("/extend/:id", authenticate, extendInstance);


module.exports = router;
