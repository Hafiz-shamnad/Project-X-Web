/**
 * Flag Submission Routes
 * -----------------------
 * Handles:
 *  - User flag submissions for challenges
 */

const express = require("express");
const { submitFlag } = require("../controllers/flagController");

const router = express.Router();

/* -------------------------------------------------------------------------- */
/*                                   Routes                                    */
/* -------------------------------------------------------------------------- */

/**
 * Submit a flag for a challenge
 * POST /api/flag/submit
 */
router.post("/submit", submitFlag);

module.exports = router;
