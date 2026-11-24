const { errorResponse } = require("../utils/response");

/**
 * Role-based access control middleware
 * Supports 'ADMIN', 'COUNCIL', etc. (case-insensitive)
 */
function authorize(...allowedRoles) {
  const normalizedAllowed = allowedRoles.map((r) => r.toUpperCase());
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, "Authentication required", 401);
    }

    const userRole = (req.user.role || "").toUpperCase();
    if (!normalizedAllowed.includes(userRole)) {
      return errorResponse(res, `Forbidden: role '${req.user.role}' lacks permission for this action`, 403);
    }

    next();
  };
}

module.exports = { authorize };
