const express = require('express');
const decisionController = require('../controllers/decisionController');
const asyncHandler = require('../shared/asyncHandler');
const { requireAuth } = require('../middlewares/auth');
const { validateBody, validateParams } = require('../middlewares/validate');
const schemas = require('../application/validators/schemas');

const router = express.Router();
router.use(requireAuth);
router.get('/', asyncHandler(decisionController.list));
router.get('/:id', validateParams(schemas.idParam), asyncHandler(decisionController.getById));
router.post('/', validateBody(schemas.decisionCreate), asyncHandler(decisionController.create));
router.patch('/:id/status', validateParams(schemas.idParam), validateBody(schemas.statusUpdate), asyncHandler(decisionController.updateStatus));
router.patch('/:id', validateParams(schemas.idParam), validateBody(schemas.decisionUpdate), asyncHandler(decisionController.update));
router.delete('/:id', validateParams(schemas.idParam), asyncHandler(decisionController.remove));
module.exports = router;
