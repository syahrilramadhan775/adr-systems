const dashboardService = require('../application/services/dashboardService');
const HTTP = require('../shared/httpStatus');
const { sendData } = require('../shared/response');

async function summary(req, res) {
  return sendData(res, HTTP.OK, await dashboardService.summary(req.user.id));
}

module.exports = { summary };
