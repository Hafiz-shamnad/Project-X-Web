const express = require('express');
const {
  createOrGetUser,
  getUser,
  toggleSolve
} = require('../controllers/userController');

const router = express.Router();

router.post('/', createOrGetUser);
router.get('/:username', getUser);
router.post('/solve', toggleSolve);

module.exports = router;
