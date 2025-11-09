const express = require('express');
const { getChallenges } = require('../controllers/challengeController');
const router = express.Router();

router.get('/', getChallenges);

module.exports = router;
