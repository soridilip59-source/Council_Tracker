function successResponse(res, data = null, message = "Success", statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

function errorResponse(res, message = "Internal server error", statusCode = 500, details = null) {
  return res.status(statusCode).json({
    success: false,
    error: message,
    ...(details && { details }),
  });
}

module.exports = {
  successResponse,
  errorResponse,
};
