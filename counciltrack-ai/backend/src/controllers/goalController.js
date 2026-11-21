const sheetsService = require("../services/sheetsService");
const discordService = require("../services/discordService");
const { generateId } = require("../utils/generateId");
const { emitSocketEvent } = require("../utils/socketEmitter");
const { successResponse, errorResponse } = require("../utils/responseHandler");

async function createGoal(req, res, next) {
  try {
    const { goalType, title, description, priority, startDate, dueDate, councilId } = req.body;
    if (!title?.trim() || !goalType || !dueDate) {
      return errorResponse(res, "Title, goalType (daily/weekly), and dueDate are required", 400);
    }

    if (!["daily", "weekly"].includes(goalType)) {
      return errorResponse(res, "goalType must be 'daily' or 'weekly'", 400);
    }

    const assignedCouncilId = councilId || req.user.councilId || "";
    const newGoal = {
      goalId: generateId("gol"),
      userId: req.user.userId,
      councilId: assignedCouncilId,
      goalType,
      title: title.trim(),
      description: description?.trim() || "",
      priority: priority || "Medium",
      startDate: startDate || new Date().toISOString().slice(0, 10),
      dueDate,
      status: "Not Started",
      createdAt: new Date().toISOString(),
    };

    await sheetsService.insert("Goals", newGoal);

    // Initial progress record (0%)
    const initProgress = {
      progressId: generateId("prg"),
      goalId: newGoal.goalId,
      userId: req.user.userId,
      percentage: 0,
      status: "Not Started",
      updateNote: "Goal initialized",
      updatedAt: new Date().toISOString(),
    };
    await sheetsService.insert("Progress", initProgress);

    // Discord notification & Socket.io event
    const council = assignedCouncilId ? await sheetsService.getById("Councils", "councilId", assignedCouncilId) : null;
    discordService.notifyGoalCreated(newGoal, req.user, council).catch((err) => console.error(err));
    emitSocketEvent("goal:created", { goal: newGoal, user: req.user, council });

    return successResponse(res, { ...newGoal, progress: [initProgress], currentPercentage: 0 }, "Goal created successfully", 201);
  } catch (err) {
    next(err);
  }
}

async function getGoals(req, res, next) {
  try {
    const { councilId, goalType, status, userId } = req.query;
    let allGoals = await sheetsService.getAll("Goals");

    // Role-based visibility
    if (req.user.role === "council_member") {
      // Council members can see goals for their council or their own
      if (req.user.councilId) {
        allGoals = allGoals.filter((g) => g.councilId === req.user.councilId || g.userId === req.user.userId);
      } else {
        allGoals = allGoals.filter((g) => g.userId === req.user.userId);
      }
    }

    // Apply query filters
    if (councilId) allGoals = allGoals.filter((g) => g.councilId === councilId);
    if (goalType) allGoals = allGoals.filter((g) => g.goalType === goalType);
    if (status) allGoals = allGoals.filter((g) => g.status === status);
    if (userId) allGoals = allGoals.filter((g) => g.userId === userId);

    const allProgress = await sheetsService.getAll("Progress");
    const councils = await sheetsService.getAll("Councils");
    const users = await sheetsService.getAll("Users");

    const enrichedGoals = allGoals.map((goal) => {
      const goalProgress = allProgress
        .filter((p) => p.goalId === goal.goalId)
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      const latestPercentage = goalProgress[0] ? Number(goalProgress[0].percentage) : (goal.status === "Completed" ? 100 : 0);
      const council = councils.find((c) => c.councilId === goal.councilId);
      const owner = users.find((u) => u.userId === goal.userId);

      return {
        ...goal,
        percentage: latestPercentage,
        councilName: council?.councilName || "General",
        ownerName: owner?.name || "Member",
        progressCount: goalProgress.length,
      };
    });

    return successResponse(res, enrichedGoals, "Goals retrieved successfully");
  } catch (err) {
    next(err);
  }
}

async function getGoalById(req, res, next) {
  try {
    const goal = await sheetsService.getById("Goals", "goalId", req.params.id);
    if (!goal) {
      return errorResponse(res, "Goal not found", 404);
    }

    const allProgress = await sheetsService.getAll("Progress");
    const goalProgress = allProgress
      .filter((p) => p.goalId === goal.goalId)
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    const council = await sheetsService.getById("Councils", "councilId", goal.councilId);
    const owner = await sheetsService.getById("Users", "userId", goal.userId);

    const latestPercentage = goalProgress[0] ? Number(goalProgress[0].percentage) : (goal.status === "Completed" ? 100 : 0);

    return successResponse(res, {
      ...goal,
      percentage: latestPercentage,
      progressHistory: goalProgress,
      councilName: council?.councilName || "General",
      ownerName: owner?.name || "Member",
    }, "Goal details retrieved");
  } catch (err) {
    next(err);
  }
}

async function updateGoal(req, res, next) {
  try {
    const { id } = req.params;
    const { title, description, priority, dueDate, status, startDate } = req.body;

    const existingGoal = await sheetsService.getById("Goals", "goalId", id);
    if (!existingGoal) {
      return errorResponse(res, "Goal not found", 404);
    }

    // Authorization check: Only owner or admin can update
    if (req.user.role === "council_member" && existingGoal.userId !== req.user.userId) {
      return errorResponse(res, "You can only update your own goals", 403);
    }

    const updates = {};
    if (title) updates.title = title.trim();
    if (description !== undefined) updates.description = description.trim();
    if (priority) updates.priority = priority;
    if (dueDate) updates.dueDate = dueDate;
    if (startDate) updates.startDate = startDate;
    if (status) updates.status = status;

    const updated = await sheetsService.update("Goals", "goalId", id, updates);

    // If marked Completed, notify Discord & Socket
    if (status === "Completed" && existingGoal.status !== "Completed") {
      const council = await sheetsService.getById("Councils", "councilId", updated.councilId);
      discordService.notifyGoalCompleted(updated, req.user, council).catch((err) => console.error(err));
      emitSocketEvent("goal:completed", { goal: updated, user: req.user, council });
    }

    return successResponse(res, updated, "Goal updated successfully");
  } catch (err) {
    next(err);
  }
}

async function deleteGoal(req, res, next) {
  try {
    const { id } = req.params;
    const existingGoal = await sheetsService.getById("Goals", "goalId", id);
    if (!existingGoal) {
      return errorResponse(res, "Goal not found", 404);
    }

    if (req.user.role === "council_member" && existingGoal.userId !== req.user.userId) {
      return errorResponse(res, "You can only cancel your own goals", 403);
    }

    await sheetsService.delete("Goals", "goalId", id);
    return successResponse(res, null, "Goal deleted successfully");
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createGoal,
  getGoals,
  getGoalById,
  updateGoal,
  deleteGoal,
};
