const bcrypt = require('bcryptjs');
const AppError = require('../../domain/errors/AppError');
const HTTP = require('../../shared/httpStatus');
const users = require('../../infrastructure/repositories/userRepository');

async function list() {
  return users.list();
}

async function getById(id) {
  const user = await users.findById(id);
  if (!user) throw new AppError(HTTP.NOT_FOUND, 'USER_NOT_FOUND', 'User tidak ditemukan.');
  return user;
}

async function create(data) {
  return users.create({
    ...data,
    passwordHash: await bcrypt.hash(data.password, 12)
  });
}

async function update(id, data) {
  await getById(id);
  const updateData = { ...data };
  delete updateData.password;
  if (data.password !== undefined) updateData.passwordHash = await bcrypt.hash(data.password, 12);
  const user = await users.update(id, updateData);
  if (!user) throw new AppError(HTTP.NOT_FOUND, 'USER_NOT_FOUND', 'User tidak ditemukan.');
  return user;
}

async function remove(id) {
  await getById(id);
  await users.remove(id);
}

module.exports = { list, getById, create, update, remove };
