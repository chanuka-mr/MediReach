const express = require('express');
const router = express.Router();
const { getDrugDetails } = require('../Controllers/drugController');
const { protect } = require('../Middleware/authMiddleware');

router.get('/info/:name', protect, getDrugDetails);

module.exports = router;
