const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const asyncHandler = require('../shared/asyncHandler');
const { requireAuth } = require('../middlewares/auth');

const router = express.Router();
router.get('/summary', requireAuth, asyncHandler(dashboardController.summary));
module.exports = router;
