const sheetsService = require("../services/sheetsService");
const discordService = require("../services/discordService");
const { generateId } = require("../utils/generateId");
const { emitSocketEvent } = require("../utils/socketEmitter");
const { successResponse, errorResponse } = require("../utils/responseHandler");

async function addProgress(req, res, next) {
  try {
    const { goalId, percentage, status, updateNote } = req.body;
    if (!goalId || percentage === undefined) {
      return errorResponse(res, "goalId and percentage (0-100) are required", 400);
    }

    const goal = await sheetsService.getById("Goals", "goalId", goalId);
    if (!goal) {
      return errorResponse(res, "Goal not found", 404);
    }

    // Role check: Only goal owner or admin can update
    if (req.user.role === "council_member" && goal.userId !== req.user.userId) {
      return errorResponse(res, "You can only update progress on your own goals", 403);
    }

    const pct = Math.max(0, Math.min(100, Number(percentage)));
    const newStatus = status || (pct === 100 ? "Completed" : pct > 0 ? "In Progress" : goal.status);

    const progressRecord = {
      progressId: generateId("prg"),
      goalId,
      userId: req.user.userId,
      percentage: pct,
      status: newStatus,
      updateNote: updateNote?.trim() || "",
      updatedAt: new Date().toISOString(),
    };

    // Maintain immutable history by inserting a new record
    await sheetsService.insert("Progress", progressRecord);

    // Update goal's status
    const previousStatus = goal.status;
    await sheetsService.update("Goals", "goalId", goalId, { status: newStatus });

    const updatedGoal = { ...goal, status: newStatus, percentage: pct };

    // If completed, trigger discord and socket
    if (newStatus === "Completed" && previousStatus !== "Completed") {
      const council = await sheetsService.getById("Councils", "councilId", goal.councilId);
      discordService.notifyGoalCompleted(updatedGoal, req.user, council).catch((err) => console.error(err));
      emitSocketEvent("goal:completed", { goal: updatedGoal, user: req.user, council });
    }

    emitSocketEvent("progress:updated", { progress: progressRecord, goal: updatedGoal });

    return successResponse(res, progressRecord, "Progress recorded successfully", 201);
  } catch (err) {
    next(err);
  }
}

async function getProgressHistory(req, res, next) {
  try {
    const { goalId } = req.params;
    const allProgress = await sheetsService.getAll("Progress");
    const history = allProgress
      .filter((p) => p.goalId === goalId)
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    const users = await sheetsService.getAll("Users");
    const enriched = history.map((p) => {
      const u = users.find((user) => user.userId === p.userId);
      return {
        ...p,
        userName: u?.name || "Council Member",
      };
    });

    return successResponse(res, enriched, "Progress history retrieved");
  } catch (err) {
    next(err);
  }
}

async function updateProgress(req, res, next) {
  try {
    const { id } = req.params;
    const { updateNote, percentage, status } = req.body;

    const existing = await sheetsService.getById("Progress", "progressId", id);
    if (!existing) {
      return errorResponse(res, "Progress record not found", 404);
    }

    if (req.user.role === "council_member" && existing.userId !== req.user.userId) {
      return errorResponse(res, "You can only edit your own progress entries", 403);
    }

    const updates = {};
    if (updateNote !== undefined) updates.updateNote = updateNote.trim();
    if (percentage !== undefined) updates.percentage = Math.max(0, Math.min(100, Number(percentage)));
    if (status) updates.status = status;

    const updated = await sheetsService.update("Progress", "progressId", id, updates);
    return successResponse(res, updated, "Progress record updated");
  } catch (err) {
    next(err);
  }
}

module.exports = {
  addProgress,
  getProgressHistory,
  updateProgress,
};
