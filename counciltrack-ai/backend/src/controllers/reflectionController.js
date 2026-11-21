const sheetsService = require("../services/sheetsService");
const { generateId } = require("../utils/generateId");
const { successResponse, errorResponse } = require("../utils/responseHandler");

async function submitReflection(req, res, next) {
  try {
    const { periodType, periodStart, periodEnd, achievements, challenges, learnings, nextSteps } = req.body;

    if (!periodType || !achievements?.trim()) {
      return errorResponse(res, "periodType (daily/weekly) and achievements are required", 400);
    }

    if (!["daily", "weekly"].includes(periodType)) {
      return errorResponse(res, "periodType must be 'daily' or 'weekly'", 400);
    }

    const todayStr = new Date().toISOString().slice(0, 10);
    const newReflection = {
      reflectionId: generateId("ref"),
      userId: req.user.userId,
      periodType,
      periodStart: periodStart || todayStr,
      periodEnd: periodEnd || todayStr,
      achievements: achievements.trim(),
      challenges: challenges?.trim() || "",
      learnings: learnings?.trim() || "",
      nextSteps: nextSteps?.trim() || "",
      submittedAt: new Date().toISOString(),
    };

    await sheetsService.insert("Reflections", newReflection);
    return successResponse(res, newReflection, "Reflection submitted successfully", 201);
  } catch (err) {
    next(err);
  }
}

async function getReflections(req, res, next) {
  try {
    // Strictly forbidden for students
    if (req.user.role === "student") {
      return errorResponse(res, "Forbidden: Students cannot access reflections", 403);
    }

    let reflections = await sheetsService.getAll("Reflections");
    const { userId, periodType } = req.query;

    // Council Members can only access their own reflections
    if (req.user.role === "council_member") {
      reflections = reflections.filter((r) => r.userId === req.user.userId);
    } else if (userId) {
      reflections = reflections.filter((r) => r.userId === userId);
    }

    if (periodType) {
      reflections = reflections.filter((r) => r.periodType === periodType);
    }

    // Sort by latest submission
    reflections.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

    const users = await sheetsService.getAll("Users");
    const enriched = reflections.map((r) => {
      const u = users.find((user) => user.userId === r.userId);
      return {
        ...r,
        authorName: u?.name || "Council Member",
      };
    });

    return successResponse(res, enriched, "Reflections retrieved successfully");
  } catch (err) {
    next(err);
  }
}

async function getReflectionById(req, res, next) {
  try {
    if (req.user.role === "student") {
      return errorResponse(res, "Forbidden: Students cannot access reflections", 403);
    }

    const reflection = await sheetsService.getById("Reflections", "reflectionId", req.params.id);
    if (!reflection) {
      return errorResponse(res, "Reflection not found", 404);
    }

    // Role check: Council member can only view their own
    if (req.user.role === "council_member" && reflection.userId !== req.user.userId) {
      return errorResponse(res, "Forbidden: You can only view your own reflections", 403);
    }

    const user = await sheetsService.getById("Users", "userId", reflection.userId);
    return successResponse(res, { ...reflection, authorName: user?.name || "Council Member" }, "Reflection retrieved");
  } catch (err) {
    next(err);
  }
}

module.exports = {
  submitReflection,
  getReflections,
  getReflectionById,
};
