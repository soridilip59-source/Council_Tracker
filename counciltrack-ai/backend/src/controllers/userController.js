const bcrypt = require("bcryptjs");
const sheetsService = require("../services/sheetsService");
const { generateId } = require("../utils/generateId");
const { successResponse, errorResponse } = require("../utils/responseHandler");

async function createUser(req, res, next) {
  try {
    const { name, email, password, role, councilId } = req.body;
    if (!name || !email || !password || !role) {
      return errorResponse(res, "Name, email, password, and role are required", 400);
    }

    const existing = await sheetsService.findOne("Users", (u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (existing) {
      return errorResponse(res, "A user with this email already exists", 400);
    }

    if (["super_admin", "admin"].includes(role) && req.user.role !== "super_admin") {
      return errorResponse(res, "Only Super Admin can create Admin accounts", 403);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = {
      userId: generateId("usr"),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash,
      role,
      councilId: councilId || "",
      status: "active",
      createdAt: new Date().toISOString(),
    };

    await sheetsService.insert("Users", newUser);

    // If assigned to a council, add member to Council memberIds array
    if (councilId) {
      const council = await sheetsService.getById("Councils", "councilId", councilId);
      if (council) {
        let members = [];
        try {
          members = JSON.parse(council.memberIds || "[]");
        } catch (_) {}
        if (!members.includes(newUser.userId)) {
          members.push(newUser.userId);
          await sheetsService.update("Councils", "councilId", councilId, {
            memberIds: JSON.stringify(members),
          });
        }
      }
    }

    const { passwordHash: _, ...userSafe } = newUser;
    return successResponse(res, userSafe, "User created successfully", 201);
  } catch (err) {
    next(err);
  }
}

async function getUsers(req, res, next) {
  try {
    const allUsers = await sheetsService.getAll("Users");
    const { role, councilId, status } = req.query;

    let filtered = allUsers;
    if (role) filtered = filtered.filter((u) => u.role === role);
    if (councilId) filtered = filtered.filter((u) => u.councilId === councilId);
    if (status) filtered = filtered.filter((u) => u.status === status);

    const safeUsers = filtered.map(({ passwordHash, ...rest }) => rest);
    return successResponse(res, safeUsers, "Users retrieved successfully");
  } catch (err) {
    next(err);
  }
}

async function getUserById(req, res, next) {
  try {
    const user = await sheetsService.getById("Users", "userId", req.params.id);
    if (!user) {
      return errorResponse(res, "User not found", 404);
    }
    const { passwordHash, ...safeUser } = user;
    return successResponse(res, safeUser, "User retrieved successfully");
  } catch (err) {
    next(err);
  }
}

async function updateUser(req, res, next) {
  try {
    const { id } = req.params;
    const { name, role, councilId, status } = req.body;

    const user = await sheetsService.getById("Users", "userId", id);
    if (!user) {
      return errorResponse(res, "User not found", 404);
    }

    if (role && role !== user.role && req.user.role !== "super_admin") {
      return errorResponse(res, "Only Super Admin can change user roles", 403);
    }

    const updates = {};
    if (name) updates.name = name.trim();
    if (role) updates.role = role;
    if (councilId !== undefined) updates.councilId = councilId;
    if (status) updates.status = status;

    const updated = await sheetsService.update("Users", "userId", id, updates);
    const { passwordHash, ...safeUser } = updated;
    return successResponse(res, safeUser, "User updated successfully");
  } catch (err) {
    next(err);
  }
}

async function updateUserStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["active", "inactive"].includes(status)) {
      return errorResponse(res, "Status must be 'active' or 'inactive'", 400);
    }

    const user = await sheetsService.getById("Users", "userId", id);
    if (!user) {
      return errorResponse(res, "User not found", 404);
    }

    if (user.role === "super_admin" && req.user.role !== "super_admin") {
      return errorResponse(res, "Cannot modify Super Admin status", 403);
    }

    const updated = await sheetsService.update("Users", "userId", id, { status });
    const { passwordHash, ...safeUser } = updated;
    return successResponse(res, safeUser, `User status updated to ${status}`);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  updateUserStatus,
};
