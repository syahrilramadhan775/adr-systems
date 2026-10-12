const AppError = require('../../domain/errors/AppError');
const HTTP = require('../../shared/httpStatus');
const decisions = require('../../infrastructure/repositories/decisionRepository');

async function listForUser(userId) {
  return decisions.listByOwner(userId);
}

async function assertOwner(id, userId) {
  const record = await decisions.findOwnerId(id);
  if (!record) throw new AppError(HTTP.NOT_FOUND, 'DECISION_NOT_FOUND', 'ADR tidak ditemukan.');
  if (Number(record.userId) !== Number(userId)) {
    throw new AppError(HTTP.FORBIDDEN, 'ADR_OWNERSHIP_REQUIRED', 'Kamu hanya boleh mengubah atau menghapus ADR yang kamu buat sendiri.');
  }
}

async function getForUser(id, userId) {
  await assertOwner(id, userId);
  return decisions.findById(id);
}

async function create(userId, data) {
  return decisions.create(userId, data);
}

async function update(id, userId, data) {
  await assertOwner(id, userId);
  return decisions.updateOwned(id, userId, data);
}

async function updateStatus(id, userId, status) {
  await assertOwner(id, userId);
  return decisions.updateStatusOwned(id, userId, status);
}

async function remove(id, userId) {
  await assertOwner(id, userId);
  await decisions.removeOwned(id, userId);
}

module.exports = { listForUser, getForUser, create, update, updateStatus, remove };
