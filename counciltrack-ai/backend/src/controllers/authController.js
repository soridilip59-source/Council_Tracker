const bcrypt = require("bcryptjs");
const sheetsService = require("../services/sheetsService");
const { generateToken } = require("../utils/generateToken");
const { successResponse, errorResponse } = require("../utils/response");

async function login(req, res) {
  try {
    const { email, password } = req.body;
    const identifier = (email || "").toLowerCase().trim();

    // Support logging in via email, user ID, or role alias ('admin', 'council', 'english', 'academic')
    const user = await sheetsService.findOne("Users", (u) => {
      const uEmail = (u.email || "").toLowerCase().trim();
      const uId = (u.userId || "").toLowerCase().trim();
      const uRole = (u.role || "").toLowerCase().trim();
      const uPosition = (u.position || "").toLowerCase();

      if (uEmail === identifier || uId === identifier) return true;
      if (identifier === "admin" && uRole === "admin") return true;
      if (identifier === "admin@navgurukul.org" && uRole === "admin") return true;
      if (identifier === "disco" && (uRole === "disco" || uPosition.includes("disco"))) return true;
      if (identifier === "disco@navgurukul.org" && (uRole === "disco" || uPosition.includes("disco"))) return true;
      if (identifier === "council" && uRole === "council") return true;
      if (identifier === "council@navgurukul.org" && uRole === "council") return true;

      // English Facilitator alias
      if ((identifier === "english" || identifier === "englishfacilitator@navgurukul.org" || identifier.includes("english")) && 
          (uPosition.includes("culture") || uPosition.includes("english") || uEmail.includes("rahul"))) {
        return true;
      }

      // Academic Facilitator alias
      if ((identifier === "academic" || identifier === "academicfacilitator@navgurukul.org" || identifier.includes("academic")) && 
          (uPosition.includes("academic") || uEmail.includes("neha"))) {
        return true;
      }

      return false;
    });

    if (!user) {
      return errorResponse(res, "Invalid ID/Email or password", 401);
    }

    if ((user.status || "").toUpperCase() !== "ACTIVE") {
      return errorResponse(res, "This account is inactive. Please contact an administrator.", 403);
    }

    // Verify password with bcrypt
    let isMatch = false;
    if (user.passwordHash) {
      isMatch = await bcrypt.compare(password, user.passwordHash);
    }
    
    // Explicit specific passwords support for Admin and Council roles
    const userRole = (user.role || "").toUpperCase();
    if (!isMatch) {
      if (userRole === "ADMIN") {
        // Specific Admin password as requested by user
        if (password === "admin@navgurukul.org" || password === "Admin@123" || password === "admin123") {
          isMatch = true;
        }
      } else if (userRole === "DISCO") {
        if (
          password === "Disco@123" ||
          password === "disco123" ||
          password === "Council@123" ||
          password === "council123" ||
          password === "Admin@123"
        ) {
          isMatch = true;
        }
      } else if (userRole === "COUNCIL") {
        if (
          password === "Council@123" ||
          password === "council123" ||
          password === "Admin@123" ||
          password === "english@123" ||
          password === "academic@123" ||
          password === "Council@navgurukul"
        ) {
          isMatch = true;
        }
      }
    }

    if (!isMatch) {
      return errorResponse(res, "Invalid ID/Email or password", 401);
    }

    const role = (user.role || "").toUpperCase();
    const token = generateToken({
      userId: user.userId,
      role,
      councilId: user.councilId || "",
    });

    let council = null;
    if (user.councilId) {
      council = await sheetsService.getById("Councils", "councilId", user.councilId);
    }

    return successResponse(res, {
      token,
      user: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        role,
        councilId: user.councilId || "",
        councilName: council?.councilName || "",
        position: user.position || "",
        status: user.status,
      },
    }, "Login successful");
  } catch (err) {
    console.error("Login error:", err);
    return errorResponse(res, "Internal server error during login", 500);
  }
}

async function logout(req, res) {
  return successResponse(res, null, "Logged out successfully");
}

async function getMe(req, res) {
  try {
    const user = await sheetsService.getById("Users", "userId", req.user.userId);
    if (!user) {
      return errorResponse(res, "User not found", 404);
    }

    let council = null;
    if (user.councilId) {
      council = await sheetsService.getById("Councils", "councilId", user.councilId);
    }

    return successResponse(res, {
      userId: user.userId,
      name: user.name,
      email: user.email,
      role: (user.role || "").toUpperCase(),
      councilId: user.councilId || "",
      councilName: council?.councilName || "",
      position: user.position || "",
      status: user.status,
    }, "Profile retrieved");
  } catch (err) {
    return errorResponse(res, "Failed to retrieve profile", 500);
  }
}

module.exports = {
  login,
  logout,
  getMe,
};
