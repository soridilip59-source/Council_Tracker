const sheetsService = require("../services/sheetsService");
const discordService = require("../services/discordService");
const { generateId } = require("../utils/generateId");
const { successResponse, errorResponse } = require("../utils/response");

// Council creates/updates weekly goal (shared for the whole council)
async function upsertWeeklyGoal(req, res) {
  try {
    const { title, description, weekStart, weekEnd, status = "ACTIVE", assignedToName = "" } = req.body;
    const userId = req.user.userId;
    const councilId = req.user.councilId;

    if (!councilId) return errorResponse(res, "Council account required", 403);
    if (!weekStart || !weekEnd) return errorResponse(res, "weekStart and weekEnd are required (YYYY-MM-DD)", 400);

    // Check for existing weekly goal for this council and week
    const existing = await sheetsService.findOne("Weekly_Goals", (w) =>
      w.councilId === councilId && w.weekStart === weekStart && w.weekEnd === weekEnd
    );

    const now = new Date().toISOString();
    let record;
    if (existing) {
      record = await sheetsService.update("Weekly_Goals", "weeklyGoalId", existing.weeklyGoalId, {
        title: title.trim(),
        description: (description || "").trim(),
        status: status.toUpperCase(),
        assignedToName: (assignedToName || "").trim(),
        userId,
        updatedAt: now,
      });
    } else {
      record = {
        weeklyGoalId: generateId("WGL"),
        councilId,
        userId,
        weekStart,
        weekEnd,
        title: title.trim(),
        description: (description || "").trim(),
        status: status.toUpperCase(),
        assignedToName: (assignedToName || "").trim(),
        createdAt: now,
        updatedAt: now,
      };
      await sheetsService.insert("Weekly_Goals", record);
    }

    await sheetsService.logAudit(userId, "WEEKLY_GOAL_UPSERTED", "WEEKLY_GOAL", record.weeklyGoalId, { councilId, weekStart, weekEnd });

    // Asynchronously notify Discord with dedicated Weekly Goal embed
    sheetsService.getById("Councils", "councilId", councilId).then((council) => {
      discordService
        .notifyWeeklyGoalCreated(record, council, req.user)
        .catch((err) => console.warn("[Discord] Failed to send weekly goal notification:", err.message));
    }).catch(console.error);

    return successResponse(res, record, existing ? "Weekly goal updated" : "Weekly goal created", existing ? 200 : 201);
  } catch (err) {
    console.error("upsertWeeklyGoal error:", err);
    return errorResponse(res, "Failed to save weekly goal", 500);
  }
}

// Get council's weekly goals (optionally filtered by weekStart)
async function getCouncilWeeklyGoals(req, res) {
  try {
    const councilId = req.user.councilId || req.query.councilId;
    if (!councilId) return errorResponse(res, "councilId required", 400);
    const { weekStart } = req.query;

    let goals = await sheetsService.find("Weekly_Goals", (w) => w.councilId === councilId);
    if (weekStart) {
      goals = goals.filter((w) => w.weekStart <= weekStart && w.weekEnd >= weekStart);
    }
    goals.sort((a, b) => (b.weekStart || "").localeCompare(a.weekStart || ""));
    return successResponse(res, goals, "Weekly goals retrieved");
  } catch (err) {
    return errorResponse(res, "Failed to retrieve weekly goals", 500);
  }
}

// Admin gets all councils' weekly goals
async function getAllWeeklyGoals(req, res) {
  try {
    const { councilId, weekStart } = req.query;
    let goals = await sheetsService.getAll("Weekly_Goals");
    const councils = await sheetsService.getAll("Councils");
    const councilMap = new Map(councils.map((c) => [c.councilId, c.councilName]));

    if (councilId) goals = goals.filter((w) => w.councilId === councilId);
    if (weekStart) goals = goals.filter((w) => w.weekStart <= weekStart && w.weekEnd >= weekStart);

    const enriched = goals.map((w) => ({ ...w, councilName: councilMap.get(w.councilId) || "Unknown" }));
    enriched.sort((a, b) => (b.weekStart || "").localeCompare(a.weekStart || ""));
    return successResponse(res, enriched, "All weekly goals retrieved");
  } catch (err) {
    return errorResponse(res, "Failed to retrieve weekly goals", 500);
  }
}

async function deleteWeeklyGoal(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const councilId = req.user.councilId;

    const goal = await sheetsService.getById("Weekly_Goals", "weeklyGoalId", id);
    if (!goal) return errorResponse(res, "Weekly goal not found", 404);
    if (req.user.role !== "ADMIN" && goal.councilId !== councilId) return errorResponse(res, "Access denied", 403);

    await sheetsService.delete("Weekly_Goals", "weeklyGoalId", id);
    await sheetsService.logAudit(userId, "WEEKLY_GOAL_DELETED", "WEEKLY_GOAL", id, {});
    return successResponse(res, null, "Weekly goal deleted");
  } catch (err) {
    return errorResponse(res, "Failed to delete weekly goal", 500);
  }
}

module.exports = { upsertWeeklyGoal, getCouncilWeeklyGoals, getAllWeeklyGoals, deleteWeeklyGoal };
