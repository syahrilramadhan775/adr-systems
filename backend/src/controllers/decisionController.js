const decisionService = require('../application/services/decisionService');
const HTTP = require('../shared/httpStatus');
const { sendData } = require('../shared/response');

async function list(req, res) {
  return sendData(res, HTTP.OK, await decisionService.listForUser(req.user.id));
}
async function getById(req, res) {
  return sendData(res, HTTP.OK, await decisionService.getForUser(req.params.id, req.user.id));
}
async function create(req, res) {
  return sendData(res, HTTP.CREATED, await decisionService.create(req.user.id, req.body));
}
async function update(req, res) {
  return sendData(res, HTTP.OK, await decisionService.update(req.params.id, req.user.id, req.body));
}
async function updateStatus(req, res) {
  return sendData(res, HTTP.OK, await decisionService.updateStatus(req.params.id, req.user.id, req.body.status));
}
async function remove(req, res) {
  await decisionService.remove(req.params.id, req.user.id);
  return res.status(HTTP.NO_CONTENT).end();
}

module.exports = { list, getById, create, update, updateStatus, remove };
