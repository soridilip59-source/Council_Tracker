const sheetsService = require("../services/sheetsService");
const aiService = require("../services/aiService");
const { generateId } = require("../utils/generateId");
const { successResponse, errorResponse } = require("../utils/response");

async function createGoal(req, res) {
  try {
    const {
      title,
      description,
      expectedOutcome = "",
      priority = "MEDIUM",
      goalDate,
      assignedTo,
      assignedToName,
      isOnLeave,
      leaveStartDate,
      leaveEndDate,
      leaveDays,
      leaveReason,
    } = req.body;

    const actorId = req.user.userId;
    const actorRole = req.user.role;
    let councilId = req.user.councilId;
    let targetUserId = actorId;
    let finalAssignedToName = (assignedToName || "").trim();

    // If an existing registered council member ID was selected
    if (assignedTo && assignedTo !== actorId) {
      const assignee = await sheetsService.getById("Users", "userId", assignedTo);
      if (!assignee) {
        return errorResponse(res, "Assigned council member not found", 404);
      }
      if (actorRole === "COUNCIL" && assignee.councilId !== councilId) {
        return errorResponse(res, "You can only assign goals to members within your council", 403);
      }
      targetUserId = assignee.userId;
      councilId = assignee.councilId;
      if (!finalAssignedToName) {
        finalAssignedToName = assignee.name;
      }
    } else if (!finalAssignedToName) {
      finalAssignedToName = req.user.name;
    }

    if (!councilId) {
      return errorResponse(res, "Target member is not assigned to any council. Please contact Admin.", 400);
    }

    const now = new Date().toISOString();
    const newGoal = {
      goalId: generateId("GL"),
      userId: targetUserId,
      councilId,
      title: title.trim(),
      description: description.trim(),
      expectedOutcome: expectedOutcome.trim(),
      priority: priority.toUpperCase(),
      goalDate,
      status: "PENDING",
      incompleteReason: "",
      assignedTo: targetUserId,
      assignedToName: finalAssignedToName,
      assignedBy: actorId,
      assignedByName: req.user.name,
      isOnLeave: Boolean(isOnLeave) ? "TRUE" : "FALSE",
      leaveStartDate: leaveStartDate || "",
      leaveEndDate: leaveEndDate || "",
      leaveDays: leaveDays ? String(leaveDays) : "",
      leaveReason: leaveReason ? leaveReason.trim() : "",
      createdAt: now,
      updatedAt: now,
    };

    await sheetsService.insert("Goals", newGoal);

    // If council member is on leave, also record in Council_Leaves table
    if (Boolean(isOnLeave)) {
      const newLeave = {
        leaveId: generateId("LEV"),
        userId: actorId,
        memberName: req.user.name,
        councilId,
        startDate: leaveStartDate || goalDate,
        endDate: leaveEndDate || goalDate,
        totalDays: leaveDays ? String(leaveDays) : "1",
        reason: leaveReason ? leaveReason.trim() : "Council Leave",
        handoverStudentName: finalAssignedToName || req.user.name,
        status: "ACTIVE",
        createdAt: now,
      };
      await sheetsService.insert("Council_Leaves", newLeave);
    }

    const users = await sheetsService.getAll("Users");
    const userMap = new Map(users.map((u) => [u.userId, u.name]));
    const councils = await sheetsService.getAll("Councils");
    const councilMap = new Map(councils.map((c) => [c.councilId, c.councilName]));

    const enriched = {
      ...newGoal,
      memberName: userMap.get(targetUserId) || req.user.name,
      assignedToName: finalAssignedToName,
      assignedByName: req.user.name,
      councilName: councilMap.get(councilId) || "Unknown",
    };

    return successResponse(res, enriched, "Daily goal created successfully", 201);
  } catch (err) {
    console.error("createGoal error:", err);
    return errorResponse(res, "Failed to create goal", 500);
  }
}

async function getMyGoals(req, res) {
  try {
    const userId = req.user.userId;
    const { goalDate, status, startDate, endDate, scope } = req.query;

    let goals = await sheetsService.find("Goals", (g) => {
      const isAssignedToMe = g.userId === userId || g.assignedTo === userId;
      const isAssignedByMe = g.assignedBy === userId;
      if (scope === "assigned_by_me") return isAssignedByMe;
      if (scope === "assigned_to_me") return isAssignedToMe;
      return isAssignedToMe || isAssignedByMe;
    });

    if (goalDate) {
      goals = goals.filter((g) => g.goalDate === goalDate);
    }
    if (status) {
      goals = goals.filter((g) => (g.status || "").toUpperCase() === status.toUpperCase());
    }
    if (startDate && endDate) {
      goals = goals.filter((g) => g.goalDate >= startDate && g.goalDate <= endDate);
    }

    const users = await sheetsService.getAll("Users");
    const councils = await sheetsService.getAll("Councils");
    const userMap = new Map(users.map((u) => [u.userId, u.name]));
    const councilMap = new Map(councils.map((c) => [c.councilId, c.councilName]));

    const enrichedGoals = goals.map((g) => {
      const assignedToId = g.assignedTo || g.userId;
      const assignedById = g.assignedBy || g.userId;
      const assignedToName = g.assignedToName || userMap.get(assignedToId) || userMap.get(g.userId) || "Unknown";
      const assignedByName = g.assignedByName || userMap.get(assignedById) || (assignedById === userId ? req.user.name : "Self");
      const isStudent = Boolean(g.assignedToName && g.assignedToName !== userMap.get(assignedToId) && g.assignedToName !== req.user.name);

      return {
        ...g,
        assignedTo: assignedToId,
        assignedBy: assignedById,
        assignedToName,
        assignedByName,
        memberName: userMap.get(g.userId) || "Unknown",
        councilName: councilMap.get(g.councilId) || "Unknown",
        isAssignedByMe: assignedById === userId && (assignedToId !== userId || isStudent),
        isAssignedToMe: assignedToId === userId && !isStudent,
        isStudentDelegate: isStudent,
        isOnLeave: g.isOnLeave === "TRUE" || g.isOnLeave === true,
      };
    });

    // Sort descending by date, then creation
    enrichedGoals.sort((a, b) => (b.goalDate || "").localeCompare(a.goalDate || ""));

    return successResponse(res, enrichedGoals, "Goals retrieved successfully");
  } catch (err) {
    return errorResponse(res, "Failed to retrieve goals", 500);
  }
}

async function getAllGoals(req, res) {
  try {
    const { councilId, userId, goalDate, status, startDate, endDate, assignedBy, assignedTo } = req.query;
    let goals = await sheetsService.getAll("Goals");
    const users = await sheetsService.getAll("Users");
    const councils = await sheetsService.getAll("Councils");

    const userMap = new Map(users.map((u) => [u.userId, u.name]));
    const councilMap = new Map(councils.map((c) => [c.councilId, c.councilName]));

    if (councilId) {
      goals = goals.filter((g) => g.councilId === councilId);
    }
    if (userId) {
      goals = goals.filter((g) => g.userId === userId || g.assignedTo === userId);
    }
    if (assignedBy) {
      goals = goals.filter((g) => g.assignedBy === assignedBy);
    }
    if (assignedTo) {
      goals = goals.filter((g) => (g.assignedTo || g.userId) === assignedTo);
    }
    if (goalDate) {
      goals = goals.filter((g) => g.goalDate === goalDate);
    }
    if (status) {
      goals = goals.filter((g) => (g.status || "").toUpperCase() === status.toUpperCase());
    }
    if (startDate && endDate) {
      goals = goals.filter((g) => g.goalDate >= startDate && g.goalDate <= endDate);
    }

    const enrichedGoals = goals.map((g) => {
      const assignedToId = g.assignedTo || g.userId;
      const assignedById = g.assignedBy || g.userId;
      const assignedToName = g.assignedToName || userMap.get(assignedToId) || userMap.get(g.userId) || "Unknown";
      const assignedByName = g.assignedByName || userMap.get(assignedById) || userMap.get(g.userId) || "Self";
      const isStudent = Boolean(g.assignedToName && g.assignedToName !== userMap.get(assignedToId));

      return {
        ...g,
        assignedTo: assignedToId,
        assignedBy: assignedById,
        assignedToName,
        assignedByName,
        memberName: userMap.get(g.userId) || "Unknown",
        councilName: councilMap.get(g.councilId) || "Unknown",
        isStudentDelegate: isStudent,
        isOnLeave: g.isOnLeave === "TRUE" || g.isOnLeave === true,
      };
    });

    enrichedGoals.sort((a, b) => (b.goalDate || "").localeCompare(a.goalDate || ""));

    return successResponse(res, enrichedGoals, "Goals retrieved successfully");
  } catch (err) {
    return errorResponse(res, "Failed to retrieve goals", 500);
  }
}

async function getGoalById(req, res) {
  try {
    const { id } = req.params;
    const goal = await sheetsService.getById("Goals", "goalId", id);

    if (!goal) {
      return errorResponse(res, "Goal not found", 404);
    }

    // Permission check
    const isOwner = goal.userId === req.user.userId || goal.assignedTo === req.user.userId;
    const isAssigner = goal.assignedBy === req.user.userId;
    if (req.user.role !== "ADMIN" && !isOwner && !isAssigner) {
      return errorResponse(res, "Access denied", 403);
    }

    const history = await sheetsService.find("Goal_History", (h) => h.goalId === id);
    const users = await sheetsService.getAll("Users");
    const councils = await sheetsService.getAll("Councils");

    const userMap = new Map(users.map((u) => [u.userId, u.name]));
    const councilMap = new Map(councils.map((c) => [c.councilId, c.councilName]));
    const assignedToId = goal.assignedTo || goal.userId;
    const assignedById = goal.assignedBy || goal.userId;

    return successResponse(
      res,
      {
        ...goal,
        assignedTo: assignedToId,
        assignedBy: assignedById,
        assignedToName: goal.assignedToName || userMap.get(assignedToId) || userMap.get(goal.userId) || "Unknown",
        assignedByName: goal.assignedByName || userMap.get(assignedById) || userMap.get(goal.userId) || "Self",
        memberName: userMap.get(goal.userId) || "Unknown",
        councilName: councilMap.get(goal.councilId) || "Unknown",
        isOnLeave: goal.isOnLeave === "TRUE" || goal.isOnLeave === true,
        history,
      },
      "Goal retrieved"
    );
  } catch (err) {
    return errorResponse(res, "Failed to retrieve goal", 500);
  }
}

async function updateGoal(req, res) {
  try {
    const { id } = req.params;
    const goal = await sheetsService.getById("Goals", "goalId", id);

    if (!goal) {
      return errorResponse(res, "Goal not found", 404);
    }

    // Only owner, assigner, or admin can edit
    const isOwner = goal.userId === req.user.userId || goal.assignedTo === req.user.userId;
    const isAssigner = goal.assignedBy === req.user.userId;
    if (!isOwner && !isAssigner && req.user.role !== "ADMIN") {
      return errorResponse(res, "You can only update your own or assigned goals", 403);
    }

    const { title, description, expectedOutcome, priority, goalDate, assignedTo } = req.body;
    const updates = {};
    if (title !== undefined) updates.title = title.trim();
    if (description !== undefined) updates.description = description.trim();
    if (expectedOutcome !== undefined) updates.expectedOutcome = expectedOutcome.trim();
    if (priority !== undefined) updates.priority = priority.toUpperCase();
    if (goalDate !== undefined) updates.goalDate = goalDate;
    if (assignedTo !== undefined) {
      updates.assignedTo = assignedTo;
      updates.userId = assignedTo;
    }

    const updated = await sheetsService.update("Goals", "goalId", id, updates);

    return successResponse(res, updated, "Goal updated successfully");
  } catch (err) {
    return errorResponse(res, "Failed to update goal", 500);
  }
}

async function updateGoalStatus(req, res) {
  try {
    const { id } = req.params;
    const goal = await sheetsService.getById("Goals", "goalId", id);

    if (!goal) {
      return errorResponse(res, "Goal not found", 404);
    }

    // Only owner, assigner, or admin can update status
    const isOwner = goal.userId === req.user.userId || goal.assignedTo === req.user.userId;
    const isAssigner = goal.assignedBy === req.user.userId;
    if (req.user.role !== "ADMIN" && !isOwner && !isAssigner) {
      return errorResponse(res, "Access denied", 403);
    }

    const { status, incompleteReason = "" } = req.body;
    const normStatus = status.toUpperCase();

    if (!["PENDING", "COMPLETED", "INCOMPLETE"].includes(normStatus)) {
      return errorResponse(res, "Invalid status. Must be PENDING, COMPLETED, or INCOMPLETE", 400);
    }

    if (normStatus === "INCOMPLETE" && !incompleteReason && !goal.incompleteReason) {
      return errorResponse(res, "A reason is required when marking a goal incomplete", 400);
    }

    const oldStatus = goal.status;
    const updates = {
      status: normStatus,
      incompleteReason: normStatus === "INCOMPLETE" ? incompleteReason || goal.incompleteReason : "",
    };

    const updated = await sheetsService.update("Goals", "goalId", id, updates);

    // Record in Goal_History
    await sheetsService.logGoalHistory(
      id,
      req.user.userId,
      oldStatus,
      normStatus,
      `Status changed by ${req.user.name} (${req.user.role})`
    );

    return successResponse(res, updated, "Goal status updated successfully");
  } catch (err) {
    return errorResponse(res, "Failed to update goal status", 500);
  }
}

async function suggestGoals(req, res) {
  try {
    const userId = req.user.userId;
    const suggestions = await aiService.suggestGoals(userId);
    return successResponse(res, suggestions, "AI goal suggestions generated");
  } catch (err) {
    console.error("suggestGoals error:", err);
    return errorResponse(res, "Failed to generate suggestions", 500);
  }
}

module.exports = {
  createGoal,
  getMyGoals,
  getAllGoals,
  getGoalById,
  updateGoal,
  updateGoalStatus,
  suggestGoals,
};
