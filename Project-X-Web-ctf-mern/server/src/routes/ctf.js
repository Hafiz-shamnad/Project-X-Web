const express = require('express');
const router = express.Router();
const ctf = require('../controllers/ctfController');

router.post('/challenges', ctf.createChallenge);
router.post('/spawn', ctf.spawnInstance);
router.post('/verify', ctf.verifyFlag);

module.exports = router;
