const express = require('express');
const departmentController = require('../controllers/departmentController');
const asyncHandler = require('../shared/asyncHandler');
const { requireAuth } = require('../middlewares/auth');

const router = express.Router();
router.get('/', requireAuth, asyncHandler(departmentController.list));
module.exports = router;
