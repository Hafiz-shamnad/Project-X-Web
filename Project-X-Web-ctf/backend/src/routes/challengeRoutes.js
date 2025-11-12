const express = require('express');
const { getChallengeById, getChallenges, getPublicChallenges } = require('../controllers/challengeController');
const router = express.Router();

router.get('/', getChallenges);
router.get('/:id', getChallengeById);
router.get('/challenges', getPublicChallenges);


module.exports = router;
