const userService = require('../application/services/userService');
const HTTP = require('../shared/httpStatus');
const { sendData } = require('../shared/response');

async function list(_req, res) {
  return sendData(res, HTTP.OK, await userService.list());
}
async function getById(req, res) {
  return sendData(res, HTTP.OK, await userService.getById(req.params.id));
}
async function create(req, res) {
  return sendData(res, HTTP.CREATED, await userService.create(req.body));
}
async function update(req, res) {
  return sendData(res, HTTP.OK, await userService.update(req.params.id, req.body));
}
async function remove(req, res) {
  await userService.remove(req.params.id);
  return res.status(HTTP.NO_CONTENT).end();
}

module.exports = { list, getById, create, update, remove };
