const { errorResponse } = require("../utils/responseHandler");

function errorHandler(err, req, res, next) {
  console.error(`[Error Handler] ${req.method} ${req.url} -`, err);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";
  return errorResponse(res, message, statusCode, err.details || null);
}

module.exports = { errorHandler };
