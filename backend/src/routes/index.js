const express = require('express');
const HTTP = require('../shared/httpStatus');
const { sendData } = require('../shared/response');
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const decisionRoutes = require('./decisionRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const departmentRoutes = require('./departmentRoutes');

const router = express.Router();
router.get('/health', (_req, res) => sendData(res, HTTP.OK, { status: 'ok' }));
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/decisions', decisionRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/departments', departmentRoutes);

router.use((req, res) => {
  return res.status(HTTP.NOT_FOUND).json({
    error: { code: 'ENDPOINT_NOT_FOUND', message: `Endpoint ${req.method} ${req.originalUrl} tidak ditemukan.` }
  });
});

module.exports = router;
