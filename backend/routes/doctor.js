const express = require('express');
const router = express.Router();
const { getSummary, getStats } = require('../controllers/doctorController');

router.get('/summary', getSummary);
router.get('/stats', getStats);

module.exports = router;
