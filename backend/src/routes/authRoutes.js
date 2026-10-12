const express = require('express');
const authController = require('../controllers/authController');
const asyncHandler = require('../shared/asyncHandler');
const { requireAuth } = require('../middlewares/auth');
const { validateBody } = require('../middlewares/validate');
const schemas = require('../application/validators/schemas');

const router = express.Router();
router.post('/login', validateBody(schemas.login), asyncHandler(authController.login));
router.get('/me', requireAuth, asyncHandler(authController.me));
module.exports = router;
