const sheetsService = require("../services/sheetsService");
const { generateId } = require("../utils/generateId");
const { successResponse, errorResponse } = require("../utils/response");

async function getActiveLeaves(req, res) {
  try {
    const leaves = await sheetsService.getAll("Council_Leaves");
    const today = new Date().toISOString().split("T")[0];

    const activeLeaves = leaves.filter((l) => {
      if (l.status && l.status.toUpperCase() === "CANCELLED") return false;
      if (l.endDate && l.endDate < today) return false;
      return true;
    });

    return successResponse(res, activeLeaves, "Active leaves retrieved");
  } catch (err) {
    console.error("getActiveLeaves error:", err);
    return errorResponse(res, "Failed to retrieve active leaves", 500);
  }
}

async function getAllLeaves(req, res) {
  try {
    const leaves = await sheetsService.getAll("Council_Leaves");
    leaves.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
    return successResponse(res, leaves, "All leaves retrieved");
  } catch (err) {
    return errorResponse(res, "Failed to retrieve leaves", 500);
  }
}

async function createLeave(req, res) {
  try {
    const { startDate, endDate, totalDays, reason, handoverStudentName } = req.body;
    const actorId = req.user.userId;
    const councilId = req.user.councilId || "";
    const memberName = req.user.name;

    const newLeave = {
      leaveId: generateId("LEV"),
      userId: actorId,
      memberName,
      councilId,
      startDate,
      endDate,
      totalDays: String(totalDays),
      reason: reason.trim(),
      handoverStudentName: handoverStudentName.trim(),
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
    };

    await sheetsService.insert("Council_Leaves", newLeave);
    return successResponse(res, newLeave, "Council member leave registered successfully", 201);
  } catch (err) {
    return errorResponse(res, "Failed to register leave", 500);
  }
}

module.exports = {
  getActiveLeaves,
  getAllLeaves,
  createLeave,
};
