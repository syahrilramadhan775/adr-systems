const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const AppError = require('../../domain/errors/AppError');
const HTTP = require('../../shared/httpStatus');
const users = require('../../infrastructure/repositories/userRepository');

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, position: user.position };
}

async function login({ email, password }) {
  const user = await users.findAuthByEmail(email);
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    throw new AppError(HTTP.UNAUTHORIZED, 'INVALID_CREDENTIALS', 'Email atau password salah.');
  }

  const token = jwt.sign(
    { position: user.position },
    process.env.JWT_SECRET,
    { subject: String(user.id), expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  );
  return { token, user: publicUser(user) };
}

async function me(userId) {
  const user = await users.findById(userId);
  if (!user) throw new AppError(HTTP.UNAUTHORIZED, 'USER_NO_LONGER_EXISTS', 'Akun tidak tersedia. Silakan login kembali.');
  return user;
}

module.exports = { login, me };
