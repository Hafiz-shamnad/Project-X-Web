// src/routes/teamRoutes.js
const express = require('express');
const { authenticate } = require('../middlewares/auth');
const { getMyTeam, createTeam, joinTeam, getTeamSolves } = require('../controllers/teamController');

const router = express.Router();

router.get('/me', authenticate, getMyTeam);
router.post('/create', authenticate, createTeam);
router.post('/join', authenticate, joinTeam);
router.get('/:id/solves', authenticate, getTeamSolves);

module.exports = router;
