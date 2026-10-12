const authService = require('../application/services/authService');
const HTTP = require('../shared/httpStatus');
const { sendData } = require('../shared/response');

async function login(req, res) {
  const result = await authService.login(req.body);
  return sendData(res, HTTP.OK, result);
}

async function me(req, res) {
  const user = await authService.me(req.user.id);
  return sendData(res, HTTP.OK, user);
}

module.exports = { login, me };
