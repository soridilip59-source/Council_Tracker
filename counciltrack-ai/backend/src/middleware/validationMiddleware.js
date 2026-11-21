const { errorResponse } = require("../utils/responseHandler");

/**
 * Validates request data using a Zod schema
 * @param {import("zod").ZodSchema} schema 
 * @param {"body" | "query" | "params"} source 
 */
function validate(schema, source = "body") {
  return (req, res, next) => {
    try {
      const parsed = schema.parse(req[source]);
      req[source] = parsed;
      next();
    } catch (err) {
      const formattedErrors = err.errors?.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      })) || err.message;

      return errorResponse(res, "Validation failed", 400, formattedErrors);
    }
  };
}

module.exports = { validate };
