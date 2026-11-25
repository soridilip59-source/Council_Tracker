const sheetsService = require("../services/sheetsService");
const { generateId } = require("../utils/generateId");
const { successResponse, errorResponse } = require("../utils/response");

async function getAllCouncils(req, res) {
  try {
    const councils = await sheetsService.getAll("Councils");
    const users = await sheetsService.getAll("Users");

    const result = councils.map((c) => {
      const assignedMembers = users.filter((u) => u.councilId === c.councilId);
      const activeMembers = assignedMembers.filter((u) => (u.status || "").toUpperCase() === "ACTIVE");
      const memberCount = c.members?.length || assignedMembers.length;

      return {
        ...c,
        memberCount,
        activeMemberCount: memberCount,
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
    const { councilName, description = "", status = "ACTIVE" } = req.body;

    const existing = await sheetsService.findOne(
      "Councils",
      (c) => c.councilName?.toLowerCase() === councilName.toLowerCase().trim()
    );
    if (existing) {
      return errorResponse(res, "A council with this name already exists", 409);
    }

    const now = new Date().toISOString();
    const newCouncil = {
      councilId: generateId("CNL"),
      councilName: councilName.trim(),
      description: description.trim(),
      status: status.toUpperCase(),
      createdAt: now,
      updatedAt: now,
    };

    await sheetsService.insert("Councils", newCouncil);
    await sheetsService.logAudit(req.user.userId, "COUNCIL_CREATED", "COUNCIL", newCouncil.councilId, {
      councilName: newCouncil.councilName,
    });

    return successResponse(res, newCouncil, "Council created successfully", 201);
  } catch (err) {
    return errorResponse(res, "Failed to create council", 500);
  }
}

async function updateCouncil(req, res) {
  try {
    const { id } = req.params;
    const { councilName, description, status } = req.body;

    const council = await sheetsService.getById("Councils", "councilId", id);
    if (!council) {
      return errorResponse(res, "Council not found", 404);
    }

    const updates = {};
    if (councilName !== undefined) updates.councilName = councilName.trim();
    if (description !== undefined) updates.description = description.trim();
    if (status !== undefined) updates.status = status.toUpperCase();

    const updated = await sheetsService.update("Councils", "councilId", id, updates);
    await sheetsService.logAudit(req.user.userId, "COUNCIL_UPDATED", "COUNCIL", id, updates);

    return successResponse(res, updated, "Council updated successfully");
  } catch (err) {
    return errorResponse(res, "Failed to update council", 500);
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

module.exports = {
  getAllCouncils,
  getCouncilById,
  createCouncil,
  updateCouncil,
  syncCouncils,
};
