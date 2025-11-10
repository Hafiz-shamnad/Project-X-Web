const express = require('express');
const { getChallengeById, getChallenges } = require('../controllers/challengeController');
const router = express.Router();

router.get('/', getChallenges);
router.get('/:id', getChallengeById);


module.exports = router;
