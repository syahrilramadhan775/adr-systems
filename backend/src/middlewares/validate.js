const AppError = require('../domain/errors/AppError');
const HTTP = require('../shared/httpStatus');

function validateBody(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: false });
    if (error) {
      return next(new AppError(
        HTTP.UNPROCESSABLE_CONTENT,
        'VALIDATION_ERROR',
        'Request body tidak valid.',
        error.details.map((item) => ({ field: item.path.join('.'), message: item.message }))
      ));
    }
    req.body = value;
    next();
  };
}

function validateParams(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.params, { abortEarly: false });
    if (error) {
      return next(new AppError(HTTP.UNPROCESSABLE_CONTENT, 'INVALID_ROUTE_PARAMETER', 'Parameter URL tidak valid.',
        error.details.map((item) => ({ field: item.path.join('.'), message: item.message }))));
    }
    req.params = value;
    next();
  };
}

module.exports = { validateBody, validateParams };
