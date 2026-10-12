function sendData(res, statusCode, data, meta = undefined) {
  const body = { data };
  if (meta !== undefined) body.meta = meta;
  return res.status(statusCode).json(body);
}

module.exports = { sendData };
