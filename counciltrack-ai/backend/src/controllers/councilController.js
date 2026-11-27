const bcrypt = require("bcryptjs");
const sheetsService = require("../services/sheetsService");
const { generateId } = require("../utils/generateId");
const { successResponse, errorResponse } = require("../utils/response");

const SALT_ROUNDS = Math.min(Math.max(parseInt(process.env.BCRYPT_SALT_ROUNDS || "12", 10) || 12, 4), 15);

async function getAllCouncils(req, res) {
  try {
    const councils = await sheetsService.getAll("Councils");
    const users = await sheetsService.getAll("Users");
    const isAdmin = (req.user?.role || "").toUpperCase() === "ADMIN";

    const result = councils.map((c) => {
      const assignedMembers = users.filter((u) => u.councilId === c.councilId);
      const activeMembers = assignedMembers.filter((u) => (u.status || "").toUpperCase() === "ACTIVE");
      const memberCount = c.members?.length || assignedMembers.length;
      const councilUser =
        assignedMembers.find((u) => (u.role || "").toUpperCase() === "COUNCIL") ||
        assignedMembers[0] ||
        users.find((u) => c.loginEmail && (u.email || "").toLowerCase() === c.loginEmail.toLowerCase());

      return {
        ...c,
        memberCount,
        activeMemberCount: memberCount,
        ...(isAdmin
          ? {
              currentPassword: councilUser
                ? sheetsService.resolveVisiblePassword(councilUser)
                : sheetsService.DEFAULT_PLAIN_PASSWORD,
            }
          : {}),
      };
    });

    return successResponse(res, result, "Councils retrieved successfully");
  } catch (err) {
    console.error("getAllCouncils error:", err);
    return errorResponse(res, "Failed to retrieve councils", 500);
  }
}

async function getCouncilById(req, res) {
  try {
    const { id } = req.params;
    const council = await sheetsService.getById("Councils", "councilId", id);

    if (!council) {
      return errorResponse(res, "Council not found", 404);
    }

    let members = council.members || [];
    if (!members || members.length === 0) {
      const users = await sheetsService.find("Users", (u) => u.councilId === id);
      const councilUser = users.find((u) => u.members && u.members.length > 0);
      members = councilUser?.members || users.map(({ passwordHash, ...safeUser }) => safeUser);
    }

    return successResponse(
      res,
      {
        ...council,
        members,
      },
      "Council details retrieved"
    );
  } catch (err) {
    return errorResponse(res, "Failed to retrieve council details", 500);
  }
}

async function createCouncil(req, res) {
  try {
    const { councilName, description = "", status = "ACTIVE", slug = "", loginEmail = "", members = [] } = req.body;

    if (members && members.length > 3) {
      return errorResponse(res, "A council can have a maximum of 3 members", 400);
    }

    const existing = await sheetsService.findOne(
      "Councils",
      (c) => c.councilName?.toLowerCase() === councilName.toLowerCase().trim()
    );
    if (existing) {
      return errorResponse(res, "A council with this name already exists", 409);
    }

    const now = new Date().toISOString();
    const councilId = generateId("CNL");
    const councilSlug = slug || councilName.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
    const councilLogin = loginEmail || `${councilSlug}@counciltrack.org`;

    const newCouncil = {
      councilId,
      councilName: councilName.trim(),
      slug: councilSlug,
      loginEmail: councilLogin,
      description: description.trim(),
      members: members || [],
      status: status.toUpperCase(),
      createdAt: now,
      updatedAt: now,
    };

    await sheetsService.insert("Councils", newCouncil);

    // Create shared user account for this council if not exists
    const existingUser = await sheetsService.findOne("Users", (u) => u.councilId === councilId || u.email === councilLogin);
    if (!existingUser) {
      const defaultHash = "$2b$10$o0O6k.vZ.7Ft/Oz/yosx9uZ731QobdnCMQntp.XHJxJHW7w3RdkW."; // Admin@123
      await sheetsService.insert("Users", {
        userId: generateId("USR_CNL"),
        name: newCouncil.councilName,
        email: councilLogin,
        slug: councilSlug,
        passwordHash: defaultHash,
        visiblePassword: sheetsService.DEFAULT_PLAIN_PASSWORD,
        role: "COUNCIL",
        councilId,
        position: `${newCouncil.councilName} Lead`,
        members: newCouncil.members,
        status: "ACTIVE",
        createdAt: now,
        updatedAt: now,
      });
    }

    await sheetsService.logAudit(req.user.userId, "COUNCIL_CREATED", "COUNCIL", newCouncil.councilId, {
      councilName: newCouncil.councilName,
      memberCount: (members || []).length,
    });

    return successResponse(res, newCouncil, "Council created successfully", 201);
  } catch (err) {
    console.error("createCouncil error:", err);
    return errorResponse(res, "Failed to create council", 500);
  }
}

async function updateCouncil(req, res) {
  try {
    const { id } = req.params;
    const { councilName, description, status, slug, loginEmail, members } = req.body;

    if (members && members.length > 3) {
      return errorResponse(res, "A council can have a maximum of 3 members", 400);
    }

    const council = await sheetsService.getById("Councils", "councilId", id);
    if (!council) {
      return errorResponse(res, "Council not found", 404);
    }

    const updates = {};
    if (councilName !== undefined) updates.councilName = councilName.trim();
    if (description !== undefined) updates.description = description.trim();
    if (status !== undefined) updates.status = status.toUpperCase();
    if (slug !== undefined) updates.slug = slug.trim().toLowerCase();
    if (loginEmail !== undefined) {
      const normalizedEmail = loginEmail.trim().toLowerCase();
      if (normalizedEmail) {
        const duplicateCouncil = await sheetsService.findOne(
          "Councils",
          (c) => c.councilId !== id && (c.loginEmail || "").toLowerCase().trim() === normalizedEmail
        );
        if (duplicateCouncil) {
          return errorResponse(res, "This login email is already assigned to another council", 409);
        }
      }
      updates.loginEmail = normalizedEmail;
    }
    if (members !== undefined) updates.members = members;
    updates.updatedAt = new Date().toISOString();

    const updated = await sheetsService.update("Councils", "councilId", id, updates);

    // Also update associated council user account
    const councilUser =
      (await sheetsService.findOne(
        "Users",
        (u) => u.councilId === id && (u.role || "").toUpperCase() === "COUNCIL"
      )) || (await sheetsService.findOne("Users", (u) => u.councilId === id));
    if (councilUser) {
      const userUpdates = {};
      if (councilName !== undefined) userUpdates.name = councilName.trim();
      if (loginEmail !== undefined) userUpdates.email = loginEmail.trim().toLowerCase();
      if (slug !== undefined) userUpdates.slug = slug.trim().toLowerCase();
      if (members !== undefined) userUpdates.members = members;
      if (status !== undefined) userUpdates.status = status.toUpperCase();
      userUpdates.updatedAt = new Date().toISOString();
      await sheetsService.update("Users", "userId", councilUser.userId, userUpdates);
    }

    await sheetsService.logAudit(req.user.userId, "COUNCIL_UPDATED", "COUNCIL", id, updates);

    return successResponse(res, updated, "Council updated successfully");
  } catch (err) {
    console.error("updateCouncil error:", err);
    return errorResponse(res, "Failed to update council", 500);
  }
}

async function deleteCouncil(req, res) {
  try {
    const { id } = req.params;
    const council = await sheetsService.getById("Councils", "councilId", id);
    if (!council) {
      return errorResponse(res, "Council not found", 404);
    }

    const deleted = await sheetsService.delete("Councils", "councilId", id);
    if (!deleted) {
      return errorResponse(res, "Failed to delete council record", 500);
    }

    // Delete associated council user account
    const councilUser = await sheetsService.findOne("Users", (u) => u.councilId === id);
    if (councilUser) {
      await sheetsService.delete("Users", "userId", councilUser.userId);
    }

    await sheetsService.logAudit(req.user.userId, "COUNCIL_DELETED", "COUNCIL", id, {
      councilName: council.councilName,
    });

    return successResponse(res, { councilId: id, councilName: council.councilName }, "Council deleted successfully");
  } catch (err) {
    console.error("deleteCouncil error:", err);
    return errorResponse(res, "Failed to delete council", 500);
  }
}

async function syncCouncils(req, res) {
  try {
    const pulled = await sheetsService.fetchFromGoogleSheets("Councils");
    return successResponse(
      res,
      { count: pulled.length, councils: pulled },
      "Councils synced from Google Sheets successfully"
    );
  } catch (err) {
    console.error("syncCouncils error:", err);
    return errorResponse(res, "Failed to sync councils with Google Sheets", 500);
  }
}

async function resetCouncilPassword(req, res) {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.trim().length < 4) {
      return errorResponse(res, "New password must be at least 4 characters long", 400);
    }

    const council = await sheetsService.getById("Councils", "councilId", id);
    if (!council) {
      return errorResponse(res, "Council not found", 404);
    }

    const trimmedPassword = newPassword.trim();
    const passwordHash = await bcrypt.hash(trimmedPassword, SALT_ROUNDS);
    const now = new Date().toISOString();

    let councilUser = await sheetsService.findOne(
      "Users",
      (u) =>
        u.councilId === id ||
        (council.loginEmail && (u.email || "").toLowerCase() === council.loginEmail.toLowerCase())
    );

    if (councilUser) {
      await sheetsService.update("Users", "userId", councilUser.userId, {
        passwordHash,
        visiblePassword: trimmedPassword,
        updatedAt: now,
      });
    } else {
      const councilSlug =
        council.slug || council.councilName.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
      const councilLogin = council.loginEmail || `${councilSlug}@counciltrack.org`;
      councilUser = await sheetsService.insert("Users", {
        userId: generateId("USR_CNL"),
        name: council.councilName,
        email: councilLogin,
        slug: councilSlug,
        passwordHash,
        visiblePassword: trimmedPassword,
        role: "COUNCIL",
        councilId: id,
        position: `${council.councilName} Lead`,
        members: council.members || [],
        status: "ACTIVE",
        createdAt: now,
        updatedAt: now,
      });
    }

    await sheetsService.logAudit(req.user.userId, "COUNCIL_PASSWORD_RESET", "COUNCIL", id, {
      councilName: council.councilName,
      userId: councilUser.userId,
    });

    return successResponse(
      res,
      {
        councilId: id,
        loginEmail: councilUser.email,
        currentPassword: trimmedPassword,
      },
      "Council password updated successfully"
    );
  } catch (err) {
    console.error("resetCouncilPassword error:", err);
    return errorResponse(res, "Failed to update council password", 500);
  }
}

module.exports = {
  getAllCouncils,
  getCouncilById,
  createCouncil,
  updateCouncil,
  deleteCouncil,
  syncCouncils,
  resetCouncilPassword,
};
