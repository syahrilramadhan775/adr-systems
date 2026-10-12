const departmentService = require('../application/services/departmentService');
const HTTP = require('../shared/httpStatus');
const { sendData } = require('../shared/response');

async function list(_req, res) {
  return sendData(res, HTTP.OK, await departmentService.list());
}

module.exports = { list };
