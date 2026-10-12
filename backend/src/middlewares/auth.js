const jwt = require('jsonwebtoken');
const AppError = require('../domain/errors/AppError');
const HTTP = require('../shared/httpStatus');
const users = require('../infrastructure/repositories/userRepository');

async function requireAuth(req, res, next) {
  const authorization = req.get('authorization') || '';
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    return next(new AppError(HTTP.UNAUTHORIZED, 'AUTHENTICATION_REQUIRED', 'Bearer token diperlukan.'));
  }

  let payload;
  try {
    payload = jwt.verify(match[1], process.env.JWT_SECRET);
  } catch (_error) {
    return next(new AppError(HTTP.UNAUTHORIZED, 'INVALID_OR_EXPIRED_TOKEN', 'Token tidak valid atau sudah kedaluwarsa.'));
  }

  const userId = Number(payload.sub);
  if (!Number.isInteger(userId) || userId <= 0) {
    return next(new AppError(HTTP.UNAUTHORIZED, 'INVALID_OR_EXPIRED_TOKEN', 'Token tidak valid atau sudah kedaluwarsa.'));
  }

  // Re-read current position from DB so a changed/deleted account takes effect immediately.
  const currentUser = await users.findAuthById(userId);
  if (!currentUser) {
    return next(new AppError(HTTP.UNAUTHORIZED, 'USER_NO_LONGER_EXISTS', 'Akun tidak tersedia. Silakan login kembali.'));
  }

  req.user = { id: currentUser.id, position: currentUser.position };
  return next();
}

function requireLead(req, res, next) {
  if (!req.user || req.user.position !== 'lead') {
    return next(new AppError(HTTP.FORBIDDEN, 'LEAD_POSITION_REQUIRED', 'Operasi ini hanya dapat dilakukan oleh user dengan position lead.'));
  }
  return next();
}

module.exports = { requireAuth, requireLead };
