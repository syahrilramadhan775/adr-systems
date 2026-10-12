const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const routes = require('./routes');
const errorHandler = require('./shared/errorHandler');
const HTTP = require('./shared/httpStatus');

const app = express();
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:2000')
  .split(',').map((origin) => origin.trim()).filter(Boolean);

app.disable('x-powered-by');
app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(null, false);
  },
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 600
}));
app.use(express.json({ limit: '1mb' }));
app.use('/v1', routes);
app.use((_req, res) => res.status(HTTP.NOT_FOUND).json({
  error: { code: 'ENDPOINT_NOT_FOUND', message: 'Endpoint tidak ditemukan. Seluruh API memakai prefix /v1.' }
}));
app.use(errorHandler);

module.exports = app;
