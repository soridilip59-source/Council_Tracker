const { verifyToken } = require("../utils/generateToken");
const sheetsService = require("../services/sheetsService");
const { errorResponse } = require("../utils/responseHandler");

async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return errorResponse(res, "Authentication required. Please login.", 401);
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = verifyToken(token);
    // Verify user exists and is active
    const user = await sheetsService.getById("Users", "userId", decoded.userId || decoded.id);
    if (!user) {
      return errorResponse(res, "User account no longer exists", 401);
    }
    if (user.status !== "active") {
      return errorResponse(res, "Account is deactivated. Contact an administrator.", 403);
    }

    req.user = {
      userId: user.userId,
      id: user.userId,
      name: user.name,
      email: user.email,
      role: user.role,
      councilId: user.councilId,
    };
    next();
  } catch (err) {
    return errorResponse(res, "Invalid or expired session. Please login again.", 401);
  }
}

module.exports = { authenticate };
