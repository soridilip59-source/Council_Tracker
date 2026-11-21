const sheetsService = require("../services/sheetsService");
const { generateId } = require("../utils/generateId");
const { successResponse, errorResponse } = require("../utils/responseHandler");

const CATEGORIES = ["Communication", "Support", "Engagement", "Problem Resolution", "Overall Experience"];

async function submitFeedback(req, res, next) {
  try {
    const { councilId, month, category, rating, comments, suggestions } = req.body;

    if (!councilId || !rating || !category) {
      return errorResponse(res, "councilId, category, and rating (1-5) are required", 400);
    }

    if (!CATEGORIES.includes(category)) {
      return errorResponse(res, `category must be one of: ${CATEGORIES.join(", ")}`, 400);
    }

    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return errorResponse(res, "Rating must be between 1 and 5", 400);
    }

    const currentMonth = month || new Date().toISOString().slice(0, 7); // "YYYY-MM"
    const newFeedback = {
      feedbackId: generateId("fdb"),
      studentId: req.user.userId,
      councilId,
      month: currentMonth,
      category,
      rating: numRating,
      comments: comments?.trim() || "",
      suggestions: suggestions?.trim() || "",
      submittedAt: new Date().toISOString(),
    };

    await sheetsService.insert("Student_Feedback", newFeedback);
    return successResponse(res, newFeedback, "Feedback submitted successfully. Thank you!", 201);
  } catch (err) {
    next(err);
  }
}

async function getFeedback(req, res, next) {
  try {
    let feedbackList = await sheetsService.getAll("Student_Feedback");
    const { councilId, month, category } = req.query;

    // Role-based visibility
    if (req.user.role === "student") {
      // Students see feedback they themselves submitted
      feedbackList = feedbackList.filter((f) => f.studentId === req.user.userId);
    } else if (req.user.role === "council_member") {
      // Council members see feedback for their own council
      feedbackList = feedbackList.filter((f) => f.councilId === req.user.councilId);
    }

    if (councilId) feedbackList = feedbackList.filter((f) => f.councilId === councilId);
    if (month) feedbackList = feedbackList.filter((f) => f.month === month);
    if (category) feedbackList = feedbackList.filter((f) => f.category === category);

    // Enrich with council names
    const councils = await sheetsService.getAll("Councils");
    const enriched = feedbackList.map((f) => {
      const council = councils.find((c) => c.councilId === f.councilId);
      return {
        ...f,
        councilName: council?.councilName || "Council",
      };
    });

    return successResponse(res, enriched, "Feedback retrieved successfully");
  } catch (err) {
    next(err);
  }
}

async function getFeedbackById(req, res, next) {
  try {
    const feedback = await sheetsService.getById("Student_Feedback", "feedbackId", req.params.id);
    if (!feedback) {
      return errorResponse(res, "Feedback not found", 404);
    }

    if (req.user.role === "student" && feedback.studentId !== req.user.userId) {
      return errorResponse(res, "Forbidden", 403);
    }
    if (req.user.role === "council_member" && feedback.councilId !== req.user.councilId) {
      return errorResponse(res, "Forbidden", 403);
    }

    const council = await sheetsService.getById("Councils", "councilId", feedback.councilId);
    return successResponse(res, { ...feedback, councilName: council?.councilName || "Council" }, "Feedback details retrieved");
  } catch (err) {
    next(err);
  }
}

module.exports = {
  submitFeedback,
  getFeedback,
  getFeedbackById,
};
