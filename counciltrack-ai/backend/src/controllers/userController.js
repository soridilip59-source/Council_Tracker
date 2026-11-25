const bcrypt = require("bcryptjs");
const sheetsService = require("../services/sheetsService");
const { generateId } = require("../utils/generateId");
const { successResponse, errorResponse } = require("../utils/response");

// Helper to get today's date in YYYY-MM-DD
function getTodayDate() {
  const now = new Date();
  return now.toISOString().split("T")[0];
}

async function getAllUsers(req, res) {
  try {
    const { councilId, status, search } = req.query;
    let users = await sheetsService.getAll("Users");
    const councils = await sheetsService.getAll("Councils");
    const goals = await sheetsService.getAll("Goals");

    const councilMap = new Map(councils.map((c) => [c.councilId, c.councilName]));
    const today = getTodayDate();

    // Map user with progress & council
    let result = users.map((u) => {
      const userGoalsToday = goals.filter((g) => g.userId === u.userId && g.goalDate === today);
      const totalGoals = userGoalsToday.length;
      const completedGoals = userGoalsToday.filter((g) => (g.status || "").toUpperCase() === "COMPLETED").length;
      const incompleteGoals = userGoalsToday.filter((g) => (g.status || "").toUpperCase() === "INCOMPLETE").length;
      const pendingGoals = userGoalsToday.filter((g) => (g.status || "").toUpperCase() === "PENDING").length;

      const finalized = completedGoals + incompleteGoals;
      const completionRate = finalized > 0 ? Math.round((completedGoals / finalized) * 100) : "N/A";

      // Do not return passwordHash
      const { passwordHash, ...safeUser } = u;
      return {
        ...safeUser,
        councilName: councilMap.get(u.councilId) || "None",
        todayStats: {
          totalGoals,
          completedGoals,
          incompleteGoals,
          pendingGoals,
          completionRate,
        },
      };
    });

    if (councilId) {
      result = result.filter((u) => u.councilId === councilId);
    }
    if (status) {
      result = result.filter((u) => (u.status || "").toUpperCase() === status.toUpperCase());
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (u) =>
          u.name?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q) ||
          u.position?.toLowerCase().includes(q)
      );
    }

    return successResponse(res, result, "Users retrieved successfully");
  } catch (err) {
    console.error("getAllUsers error:", err);
    return errorResponse(res, "Failed to retrieve users", 500);
  }
}

async function getUserById(req, res) {
  try {
    const { id } = req.params;

    // Authorization check: Admin or own member
    if (req.user.role !== "ADMIN" && req.user.userId !== id) {
      return errorResponse(res, "Access denied", 403);
    }

    const user = await sheetsService.getById("Users", "userId", id);
    if (!user) {
      return errorResponse(res, "User not found", 404);
    }

    const councils = await sheetsService.getAll("Councils");
    const councilMap = new Map(councils.map((c) => [c.councilId, c.councilName]));

    const goals = await sheetsService.find("Goals", (g) => g.userId === id);
    const reflections = await sheetsService.find("Reflections", (r) => r.userId === id);

    const { passwordHash, ...safeUser } = user;

    return successResponse(
      res,
      {
        ...safeUser,
        councilName: councilMap.get(user.councilId) || "None",
        recentGoals: goals.slice(-10).reverse(),
        reflections: reflections.slice(-10).reverse(),
      },
      "User details retrieved"
    );
  } catch (err) {
    return errorResponse(res, "Failed to retrieve user details", 500);
  }
}

async function createUser(req, res) {
  try {
    const { name, email, password, role = "COUNCIL", councilId = "", position = "" } = req.body;

    const existing = await sheetsService.findOne(
      "Users",
      (u) => u.email?.toLowerCase() === email.toLowerCase().trim()
    );
    if (existing) {
      return errorResponse(res, "A user with this email already exists", 409);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const now = new Date().toISOString();
    const newUser = {
      userId: generateId("USR"),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      role: role.toUpperCase(),
      councilId: councilId || "",
      position: position.trim(),
      status: "ACTIVE",
      createdAt: now,
      updatedAt: now,
    };

    await sheetsService.insert("Users", newUser);
    await sheetsService.logAudit(req.user.userId, "MEMBER_CREATED", "USER", newUser.userId, {
      name: newUser.name,
      email: newUser.email,
      councilId: newUser.councilId,
    });

    const { passwordHash: _, ...safeUser } = newUser;
    return successResponse(res, safeUser, "Member created successfully", 201);
  } catch (err) {
    console.error("createUser error:", err);
    return errorResponse(res, "Failed to create user", 500);
  }
}

async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const { name, email, councilId, position, status, password } = req.body;

    const user = await sheetsService.getById("Users", "userId", id);
    if (!user) {
      return errorResponse(res, "User not found", 404);
    }

    const updates = {};
    if (name !== undefined) updates.name = name.trim();
    if (email !== undefined) {
      const emailTrimmed = email.toLowerCase().trim();
      const existing = await sheetsService.findOne(
        "Users",
        (u) => u.email?.toLowerCase() === emailTrimmed && u.userId !== id
      );
      if (existing) {
        return errorResponse(res, "This email/login ID is already taken by another account", 409);
      }
      updates.email = emailTrimmed;
    }
    if (councilId !== undefined) updates.councilId = councilId;
    if (position !== undefined) updates.position = position.trim();
    if (status !== undefined) updates.status = status.toUpperCase();
    if (password && password.trim().length > 0) {
      if (password.trim().length < 4) {
        return errorResponse(res, "Password must be at least 4 characters long", 400);
      }
      updates.passwordHash = await bcrypt.hash(password.trim(), 10);
    }

    const updated = await sheetsService.update("Users", "userId", id, updates);
    await sheetsService.logAudit(req.user.userId, "MEMBER_UPDATED", "USER", id, {
      ...updates,
      passwordHash: updates.passwordHash ? "[UPDATED]" : undefined,
    });

    const { passwordHash: _, ...safeUser } = updated;
    return successResponse(res, safeUser, "Member updated successfully");
  } catch (err) {
    return errorResponse(res, "Failed to update member", 500);
  }
}

async function updateUserStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !["ACTIVE", "INACTIVE"].includes(status.toUpperCase())) {
      return errorResponse(res, "Invalid status. Must be ACTIVE or INACTIVE", 400);
    }

    const user = await sheetsService.getById("Users", "userId", id);
    if (!user) {
      return errorResponse(res, "User not found", 404);
    }

    const updated = await sheetsService.update("Users", "userId", id, {
      status: status.toUpperCase(),
    });

    await sheetsService.logAudit(req.user.userId, "STATUS_CHANGED", "USER", id, {
      oldStatus: user.status,
      newStatus: status.toUpperCase(),
    });

    const { passwordHash: _, ...safeUser } = updated;
    return successResponse(res, safeUser, `Member account ${status.toUpperCase().toLowerCase()}d`);
  } catch (err) {
    return errorResponse(res, "Failed to update status", 500);
  }
}

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  updateUserStatus,
};
