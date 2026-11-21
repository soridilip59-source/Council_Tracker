const sheetsService = require("../services/sheetsService");
const { generateId } = require("../utils/generateId");
const { successResponse, errorResponse } = require("../utils/responseHandler");

async function createCouncil(req, res, next) {
  try {
    const { councilName, description } = req.body;
    if (!councilName?.trim()) {
      return errorResponse(res, "Council name is required", 400);
    }

    const existing = await sheetsService.findOne("Councils", (c) => c.councilName.toLowerCase() === councilName.trim().toLowerCase());
    if (existing) {
      return errorResponse(res, "A council with this name already exists", 400);
    }

    const newCouncil = {
      councilId: generateId("cnl"),
      councilName: councilName.trim(),
      description: description?.trim() || "",
      memberIds: JSON.stringify([]),
      status: "active",
      createdAt: new Date().toISOString(),
    };

    await sheetsService.insert("Councils", newCouncil);
    return successResponse(res, { ...newCouncil, members: [] }, "Council created successfully", 201);
  } catch (err) {
    next(err);
  }
}

async function getCouncils(req, res, next) {
  try {
    const councils = await sheetsService.getAll("Councils");
    const users = await sheetsService.getAll("Users");

    const enriched = councils.map((council) => {
      let memberIds = [];
      try {
        memberIds = JSON.parse(council.memberIds || "[]");
      } catch (_) {}

      const members = users
        .filter((u) => memberIds.includes(u.userId) || u.councilId === council.councilId)
        .map(({ userId, name, email, role, status }) => ({ userId, name, email, role, status }));

      return {
        ...council,
        members,
      };
    });

    return successResponse(res, enriched, "Councils retrieved successfully");
  } catch (err) {
    next(err);
  }
}

async function getCouncilById(req, res, next) {
  try {
    const council = await sheetsService.getById("Councils", "councilId", req.params.id);
    if (!council) {
      return errorResponse(res, "Council not found", 404);
    }

    const users = await sheetsService.getAll("Users");
    let memberIds = [];
    try {
      memberIds = JSON.parse(council.memberIds || "[]");
    } catch (_) {}

    const members = users
      .filter((u) => memberIds.includes(u.userId) || u.councilId === council.councilId)
      .map(({ userId, name, email, role, status }) => ({ userId, name, email, role, status }));

    return successResponse(res, { ...council, members }, "Council details retrieved");
  } catch (err) {
    next(err);
  }
}

async function updateCouncil(req, res, next) {
  try {
    const { id } = req.params;
    const { councilName, description, status, memberIds } = req.body;

    const council = await sheetsService.getById("Councils", "councilId", id);
    if (!council) {
      return errorResponse(res, "Council not found", 404);
    }

    const updates = {};
    if (councilName) updates.councilName = councilName.trim();
    if (description !== undefined) updates.description = description.trim();
    if (status) updates.status = status;
    if (memberIds) updates.memberIds = typeof memberIds === "string" ? memberIds : JSON.stringify(memberIds);

    const updated = await sheetsService.update("Councils", "councilId", id, updates);
    return successResponse(res, updated, "Council updated successfully");
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createCouncil,
  getCouncils,
  getCouncilById,
  updateCouncil,
};
