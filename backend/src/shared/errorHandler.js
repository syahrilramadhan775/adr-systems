const AppError = require('../domain/errors/AppError');
const HTTP = require('./httpStatus');

function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);

  if (error && error.type === 'entity.parse.failed') {
    return res.status(HTTP.BAD_REQUEST).json({
      error: { code: 'INVALID_JSON', message: 'Request body harus berupa JSON yang valid.' }
    });
  }

  if (error instanceof AppError) {
    const body = { error: { code: error.code, message: error.message } };
    if (error.details !== undefined) body.error.details = error.details;
    return res.status(error.statusCode).json(body);
  }

  if (error && error.code === '23505') {
    return res.status(HTTP.CONFLICT).json({
      error: { code: 'RESOURCE_CONFLICT', message: 'Data bertabrakan dengan data yang sudah ada.' }
    });
  }
  if (error && error.code === '23503') {
    return res.status(HTTP.CONFLICT).json({
      error: { code: 'RELATED_RESOURCE_EXISTS', message: 'Data tidak dapat dihapus atau diubah karena masih digunakan oleh data terkait.' }
    });
  }
  if (error && error.code === '23514') {
    return res.status(HTTP.UNPROCESSABLE_CONTENT).json({
      error: { code: 'CONSTRAINT_VIOLATION', message: 'Data tidak memenuhi batasan yang ditetapkan.' }
    });
  }

  console.error(`[${req.method} ${req.originalUrl}]`, error);
  return res.status(HTTP.INTERNAL_SERVER_ERROR).json({
    error: { code: 'INTERNAL_SERVER_ERROR', message: 'Terjadi kesalahan pada server.' }
  });
}

module.exports = errorHandler;
