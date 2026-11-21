const { errorResponse } = require("../utils/responseHandler");

/**
 * Role-based access control middleware
 * @param  {...string} allowedRoles - 'super_admin', 'admin', 'council_member', 'student'
 */
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, "Authentication required", 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return errorResponse(res, `Forbidden: role '${req.user.role}' lacks permission for this action`, 403);
    }

    next();
  };
}

module.exports = { authorize };
