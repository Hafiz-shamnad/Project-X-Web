const express = require('express');
const { submitFlag } = require('../controllers/flagController');
const router = express.Router();

router.post('/submit', submitFlag);

module.exports = router;
