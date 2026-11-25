const sheetsService = require("../services/sheetsService");
const aiService = require("../services/aiService");
const discordService = require("../services/discordService");
const { generateId } = require("../utils/generateId");
const { successResponse, errorResponse } = require("../utils/response");

async function submitReflection(req, res) {
  try {
    const {
      reflectionDate,
      achievements,
      challenges,
      learnings,
      improvements,
      goalStatuses = [],
    } = req.body;

    const userId = req.user.userId;
    const councilId = req.user.councilId;

    // Check if reflection already exists for this date and user/council
    const existing = await sheetsService.findOne(
      "Reflections",
      (r) => (r.userId === userId || (councilId && r.councilId === councilId)) && r.reflectionDate === reflectionDate
    );

    const now = new Date().toISOString();

    // Batch update goal statuses and reasons if provided
    let incompleteSummary = [];
    if (Array.isArray(goalStatuses) && goalStatuses.length > 0) {
      for (const item of goalStatuses) {
        if (!item.goalId) continue;
        const goal = await sheetsService.getById("Goals", "goalId", item.goalId);
        if (goal && (goal.userId === userId || goal.councilId === councilId)) {
          const newStatus = (item.status || "PENDING").toUpperCase();
          const reason = item.incompleteReason || "";

          if (newStatus === "INCOMPLETE" && reason) {
            incompleteSummary.push(`${goal.title}: ${reason}`);
          }

          if (goal.status !== newStatus || goal.incompleteReason !== reason) {
            const oldStatus = goal.status;
            await sheetsService.update("Goals", "goalId", item.goalId, {
              status: newStatus,
              incompleteReason: reason,
            });

            await sheetsService.logGoalHistory(
              item.goalId,
              userId,
              oldStatus,
              newStatus,
              `Reflection submission update (${reason ? `Reason: ${reason}` : "Status confirmed"})`
            );
          }
        }
      }
    }

    let reflectionRecord;
    if (existing) {
      // Update existing reflection and preserve history
      reflectionRecord = await sheetsService.update("Reflections", "reflectionId", existing.reflectionId, {
        achievements: achievements.trim(),
        incompleteGoals: incompleteSummary.join("; ") || existing.incompleteGoals || "",
        challenges: challenges.trim(),
        learnings: learnings.trim(),
        improvements: improvements.trim(),
        updatedAt: now,
      });

      await sheetsService.logAudit(userId, "REFLECTION_UPDATED", "REFLECTION", existing.reflectionId, {
        date: reflectionDate,
      });
    } else {
      reflectionRecord = {
        reflectionId: generateId("REF"),
        userId,
        councilId: councilId || "",
        reflectionDate,
        achievements: achievements.trim(),
        incompleteGoals: incompleteSummary.join("; ") || "None",
        challenges: challenges.trim(),
        learnings: learnings.trim(),
        improvements: improvements.trim(),
        submittedAt: now,
        updatedAt: now,
      };

      await sheetsService.insert("Reflections", reflectionRecord);
      await sheetsService.logAudit(userId, "REFLECTION_SUBMITTED", "REFLECTION", reflectionRecord.reflectionId, {
        date: reflectionDate,
        councilId,
      });
    }

    // Generate heuristic AI analysis of this reflection
    const aiAnalysis = aiService.analyzeReflection({
      achievements,
      challenges,
      learnings,
      improvements,
      goalStatuses,
    });

    // Notify Discord reflections channel asynchronously
    sheetsService.getAll("Councils").then((councils) => {
      const c = councils.find((item) => item.councilId === req.user.councilId);
      const councilName = c ? c.councilName : "General Council";
      const summary = `**Member:** ${req.user.name} (${councilName})\n**Achievements:** ${achievements.slice(0, 200)}\n**Challenges:** ${challenges.slice(0, 150)}`;
      discordService
        .notifyWeeklyReflectionSummary(summary, councilName)
        .catch((err) => console.warn("[Discord] Failed to send reflection notification:", err.message));
    }).catch(() => {});

    return successResponse(res, { ...reflectionRecord, aiAnalysis }, "Evening reflection submitted successfully", 201);
  } catch (err) {
    console.error("submitReflection error:", err);
    return errorResponse(res, "Failed to submit reflection", 500);
  }
}

async function getMyReflections(req, res) {
  try {
    const userId = req.user.userId;
    const councilId = req.user.councilId;
    const reflections = await sheetsService.find(
      "Reflections",
      (r) => r.userId === userId || (councilId && r.councilId === councilId)
    );
    reflections.sort((a, b) => (b.reflectionDate || "").localeCompare(a.reflectionDate || ""));

    return successResponse(res, reflections, "Reflections retrieved successfully");
  } catch (err) {
    return errorResponse(res, "Failed to retrieve reflections", 500);
  }
}

async function getAllReflections(req, res) {
  try {
    const { councilId, userId, reflectionDate } = req.query;
    let reflections = await sheetsService.getAll("Reflections");
    const users = await sheetsService.getAll("Users");
    const councils = await sheetsService.getAll("Councils");

    const userMap = new Map(users.map((u) => [u.userId, u]));
    const councilMap = new Map(councils.map((c) => [c.councilId, c.councilName]));

    if (userId) {
      reflections = reflections.filter((r) => r.userId === userId);
    }
    if (reflectionDate) {
      reflections = reflections.filter((r) => r.reflectionDate === reflectionDate);
    }

    let enriched = reflections.map((r) => {
      const u = userMap.get(r.userId);
      return {
        ...r,
        memberName: u?.name || "Unknown",
        councilId: u?.councilId || "",
        councilName: councilMap.get(u?.councilId) || "Unknown",
        position: u?.position || "",
      };
    });

    if (councilId) {
      enriched = enriched.filter((r) => r.councilId === councilId);
    }

    enriched.sort((a, b) => (b.reflectionDate || "").localeCompare(a.reflectionDate || ""));

    return successResponse(res, enriched, "Reflections retrieved successfully");
  } catch (err) {
    return errorResponse(res, "Failed to retrieve reflections", 500);
  }
}

async function getReflectionById(req, res) {
  try {
    const { id } = req.params;
    const reflection = await sheetsService.getById("Reflections", "reflectionId", id);

    if (!reflection) {
      return errorResponse(res, "Reflection not found", 404);
    }

    if (req.user.role !== "ADMIN" && reflection.userId !== req.user.userId) {
      return errorResponse(res, "Access denied", 403);
    }

    const user = await sheetsService.getById("Users", "userId", reflection.userId);
    const council = user?.councilId ? await sheetsService.getById("Councils", "councilId", user.councilId) : null;

    return successResponse(
      res,
      {
        ...reflection,
        memberName: user?.name || "Unknown",
        councilName: council?.councilName || "Unknown",
        position: user?.position || "",
      },
      "Reflection retrieved"
    );
  } catch (err) {
    return errorResponse(res, "Failed to retrieve reflection", 500);
  }
}

module.exports = {
  submitReflection,
  getMyReflections,
  getAllReflections,
  getReflectionById,
};
