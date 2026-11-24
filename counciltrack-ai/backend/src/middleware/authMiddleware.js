const { verifyToken } = require("../utils/generateToken");
const sheetsService = require("../services/sheetsService");
const { errorResponse } = require("../utils/response");

async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return errorResponse(res, "Authentication required. Please login.", 401);
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = verifyToken(token);
    const userId = decoded.userId || decoded.id;
    const user = await sheetsService.getById("Users", "userId", userId);
    
    if (!user) {
      return errorResponse(res, "User account no longer exists", 401);
    }
    
    const status = (user.status || "").toUpperCase();
    if (status !== "ACTIVE") {
      return errorResponse(res, "Account is inactive or deactivated. Contact administrator.", 403);
    }

    req.user = {
      userId: user.userId,
      id: user.userId,
      name: user.name,
      email: user.email,
      role: (user.role || "").toUpperCase(),
      councilId: user.councilId || "",
      position: user.position || "",
    };
    next();
  } catch (err) {
    return errorResponse(res, "Invalid or expired session. Please login again.", 401);
  }
}

module.exports = { authenticate };
