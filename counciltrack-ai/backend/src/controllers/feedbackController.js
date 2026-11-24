const sheetsService = require("../services/sheetsService");
const { generateId } = require("../utils/generateId");
const { successResponse, errorResponse } = require("../utils/response");

async function submitFeedback(req, res) {
  try {
    const { studentName = "", councilId, feedbackType, message, contact = "" } = req.body;

    // Verify council exists
    const council = await sheetsService.getById("Councils", "councilId", councilId);
    if (!council) {
      return errorResponse(res, "Invalid council selected", 400);
    }

    // Normalize feedbackType
    let normType = "GENERAL";
    const typeUpper = (feedbackType || "").toUpperCase();
    if (typeUpper.includes("COMPLAINT")) normType = "COMPLAINT";
    else if (typeUpper.includes("SUGGEST")) normType = "SUGGESTION";
    else normType = "GENERAL";

    const now = new Date().toISOString();
    const newFeedback = {
      feedbackId: generateId("FDB"),
      studentName: (studentName || "").trim(),
      councilId,
      feedbackType: normType,
      message: message.trim(),
      contact: (contact || "").trim(),
      status: "NEW",
      adminNotes: "",
      submittedAt: now,
      updatedAt: now,
    };

    await sheetsService.insert("Student_Feedback", newFeedback);

    // Return clean user-facing success without leaking internal record IDs unnecessarily
    return successResponse(
      res,
      {
        submittedAt: newFeedback.submittedAt,
        councilName: council.councilName,
      },
      "Thank you! Your feedback has been submitted successfully.",
      201
    );
  } catch (err) {
    console.error("submitFeedback error:", err);
    return errorResponse(res, "Failed to submit feedback", 500);
  }
}

async function getAllFeedback(req, res) {
  try {
    const { councilId, feedbackType, status, search } = req.query;
    let feedback = await sheetsService.getAll("Student_Feedback");
    const councils = await sheetsService.getAll("Councils");
    const councilMap = new Map(councils.map((c) => [c.councilId, c.councilName]));

    if (councilId) {
      feedback = feedback.filter((f) => f.councilId === councilId);
    }
    if (feedbackType) {
      feedback = feedback.filter((f) => (f.feedbackType || "").toUpperCase() === feedbackType.toUpperCase());
    }
    if (status) {
      feedback = feedback.filter((f) => (f.status || "").toUpperCase() === status.toUpperCase());
    }
    if (search) {
      const q = search.toLowerCase();
      feedback = feedback.filter(
        (f) =>
          f.message?.toLowerCase().includes(q) ||
          f.studentName?.toLowerCase().includes(q) ||
          f.contact?.toLowerCase().includes(q)
      );
    }

    const enriched = feedback.map((f) => ({
      ...f,
      councilName: councilMap.get(f.councilId) || "Unknown",
    }));

    enriched.sort((a, b) => (b.submittedAt || "").localeCompare(a.submittedAt || ""));

    return successResponse(res, enriched, "Feedback retrieved successfully");
  } catch (err) {
    return errorResponse(res, "Failed to retrieve feedback", 500);
  }
}

async function getMyCouncilFeedback(req, res) {
  try {
    const councilId = req.user.councilId;
    if (!councilId) {
      return errorResponse(res, "No council assigned to your account", 400);
    }

    let feedback = await sheetsService.find("Student_Feedback", (f) => f.councilId === councilId);
    const council = await sheetsService.getById("Councils", "councilId", councilId);

    // CRITICAL SECURITY RULE: Strip private adminNotes for Council members!
    const sanitized = feedback.map((f) => ({
      feedbackId: f.feedbackId,
      studentName: f.studentName || "Anonymous Student",
      councilId: f.councilId,
      councilName: council?.councilName || "Assigned Council",
      feedbackType: f.feedbackType,
      message: f.message,
      status: f.status,
      submittedAt: f.submittedAt,
      // adminNotes explicitly omitted
    }));

    sanitized.sort((a, b) => (b.submittedAt || "").localeCompare(a.submittedAt || ""));

    return successResponse(res, sanitized, "Council feedback retrieved");
  } catch (err) {
    return errorResponse(res, "Failed to retrieve council feedback", 500);
  }
}

async function updateFeedbackStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const normStatus = (status || "").toUpperCase();
    if (!["NEW", "UNDER_REVIEW", "RESOLVED"].includes(normStatus)) {
      return errorResponse(res, "Invalid status. Must be NEW, UNDER_REVIEW, or RESOLVED", 400);
    }

    const feedback = await sheetsService.getById("Student_Feedback", "feedbackId", id);
    if (!feedback) {
      return errorResponse(res, "Feedback record not found", 404);
    }

    const updated = await sheetsService.update("Student_Feedback", "feedbackId", id, {
      status: normStatus,
    });

    await sheetsService.logAudit(req.user.userId, "FEEDBACK_STATUS_UPDATED", "FEEDBACK", id, {
      oldStatus: feedback.status,
      newStatus: normStatus,
    });

    return successResponse(res, updated, `Feedback status updated to ${normStatus}`);
  } catch (err) {
    return errorResponse(res, "Failed to update feedback status", 500);
  }
}

async function updateFeedbackNotes(req, res) {
  try {
    const { id } = req.params;
    const { adminNotes } = req.body;

    const feedback = await sheetsService.getById("Student_Feedback", "feedbackId", id);
    if (!feedback) {
      return errorResponse(res, "Feedback record not found", 404);
    }

    const updated = await sheetsService.update("Student_Feedback", "feedbackId", id, {
      adminNotes: (adminNotes || "").trim(),
    });

    await sheetsService.logAudit(req.user.userId, "FEEDBACK_NOTE_UPDATED", "FEEDBACK", id, {
      noteLength: (adminNotes || "").length,
    });

    return successResponse(res, updated, "Admin notes updated successfully");
  } catch (err) {
    return errorResponse(res, "Failed to update admin notes", 500);
  }
}

module.exports = {
  submitFeedback,
  getAllFeedback,
  getMyCouncilFeedback,
  updateFeedbackStatus,
  updateFeedbackNotes,
};
