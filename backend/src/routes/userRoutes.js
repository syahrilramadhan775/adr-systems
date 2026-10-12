const express = require('express');
const userController = require('../controllers/userController');
const asyncHandler = require('../shared/asyncHandler');
const { requireAuth, requireLead } = require('../middlewares/auth');
const { validateBody, validateParams } = require('../middlewares/validate');
const schemas = require('../application/validators/schemas');

const router = express.Router();
router.use(requireAuth);
router.get('/', asyncHandler(userController.list));
router.get('/:id', validateParams(schemas.idParam), asyncHandler(userController.getById));
router.post('/', requireLead, validateBody(schemas.userCreate), asyncHandler(userController.create));
router.patch('/:id', requireLead, validateParams(schemas.idParam), validateBody(schemas.userUpdate), asyncHandler(userController.update));
router.delete('/:id', requireLead, validateParams(schemas.idParam), asyncHandler(userController.remove));
module.exports = router;
