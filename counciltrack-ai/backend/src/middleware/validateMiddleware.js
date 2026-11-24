const { errorResponse } = require("../utils/response");

function validate(schema) {
  return (req, res, next) => {
    try {
      const parsed = schema.parse(req.body);
      req.body = parsed;
      next();
    } catch (err) {
      if (err.errors) {
        const errorMessages = err.errors.map((e) => `${e.path.join(".")}: ${e.message}`);
        return errorResponse(res, "Validation failed", 400, errorMessages);
      }
      return errorResponse(res, err.message, 400);
    }
  };
}

module.exports = { validate };
