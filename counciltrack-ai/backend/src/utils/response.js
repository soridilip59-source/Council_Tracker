function successResponse(res, data = null, message = "Success", statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

function errorResponse(res, message = "Internal server error", statusCode = 500, errors = null) {
  return res.status(statusCode).json({
    success: false,
    message,
    errors: Array.isArray(errors) ? errors : errors ? [errors] : [],
    // Provide backwards compatibility for clients checking 'error'
    error: message,
  });
}

module.exports = {
  successResponse,
  errorResponse,
};
