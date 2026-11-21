const aiService = require("../services/aiService");
const sheetsService = require("../services/sheetsService");
const discordService = require("../services/discordService");
const { emitSocketEvent } = require("../utils/socketEmitter");
const { successResponse, errorResponse } = require("../utils/responseHandler");

async function generateReport(req, res, next) {
  try {
    const { userId, month } = req.body;
    if (!userId || !month) {
      return errorResponse(res, "userId and month (YYYY-MM) are required", 400);
    }

    const targetUser = await sheetsService.getById("Users", "userId", userId);
    if (!targetUser) {
      return errorResponse(res, "Target council member not found", 404);
    }

    console.log(`[ReportController] Generating AI evaluation for ${targetUser.name} (${month})...`);
    const report = await aiService.generateMonthlyReport(userId, month);

    const enriched = {
      ...report,
      userName: targetUser.name,
      userEmail: targetUser.email,
      strengths: JSON.parse(report.strengths || "[]"),
      weaknesses: JSON.parse(report.weaknesses || "[]"),
      recommendations: JSON.parse(report.recommendations || "[]"),
    };

    emitSocketEvent("report:generated", { report: enriched });

    return successResponse(res, enriched, "AI Performance Report generated successfully", 201);
  } catch (err) {
    next(err);
  }
}

async function getReports(req, res, next) {
  try {
    if (req.user.role === "student") {
      return errorResponse(res, "Forbidden: Students cannot access AI performance reports", 403);
    }

    let reports = await sheetsService.getAll("AI_Reports");
    const { userId, month, status } = req.query;

    if (req.user.role === "council_member") {
      // Council members can only see their own approved reports
      reports = reports.filter((r) => r.userId === req.user.userId && r.status === "Approved");
    } else if (userId) {
      reports = reports.filter((r) => r.userId === userId);
    }

    if (month) reports = reports.filter((r) => r.month === month);
    if (status) reports = reports.filter((r) => r.status === status);

    const users = await sheetsService.getAll("Users");
    const councils = await sheetsService.getAll("Councils");

    const enriched = reports.map((r) => {
      const u = users.find((user) => user.userId === r.userId);
      const c = u ? councils.find((council) => council.councilId === u.councilId) : null;

      let strengths = [];
      let weaknesses = [];
      let recommendations = [];
      try { strengths = JSON.parse(r.strengths || "[]"); } catch (_) {}
      try { weaknesses = JSON.parse(r.weaknesses || "[]"); } catch (_) {}
      try { recommendations = JSON.parse(r.recommendations || "[]"); } catch (_) {}

      return {
        ...r,
        userName: u?.name || "Council Member",
        userEmail: u?.email || "",
        councilName: c?.councilName || "General Council",
        strengths,
        weaknesses,
        recommendations,
      };
    });

    enriched.sort((a, b) => new Date(b.generatedAt) - new Date(a.generatedAt));

    return successResponse(res, enriched, "AI reports retrieved successfully");
  } catch (err) {
    next(err);
  }
}

async function getReportById(req, res, next) {
  try {
    if (req.user.role === "student") {
      return errorResponse(res, "Forbidden: Students cannot access AI performance reports", 403);
    }

    const report = await sheetsService.getById("AI_Reports", "reportId", req.params.id);
    if (!report) {
      return errorResponse(res, "Report not found", 404);
    }

    if (req.user.role === "council_member") {
      if (report.userId !== req.user.userId || report.status !== "Approved") {
        return errorResponse(res, "Forbidden: You can only view your approved performance reports", 403);
      }
    }

    const user = await sheetsService.getById("Users", "userId", report.userId);
    const council = user?.councilId ? await sheetsService.getById("Councils", "councilId", user.councilId) : null;

    let strengths = [];
    let weaknesses = [];
    let recommendations = [];
    try { strengths = JSON.parse(report.strengths || "[]"); } catch (_) {}
    try { weaknesses = JSON.parse(report.weaknesses || "[]"); } catch (_) {}
    try { recommendations = JSON.parse(report.recommendations || "[]"); } catch (_) {}

    return successResponse(res, {
      ...report,
      userName: user?.name || "Council Member",
      councilName: council?.councilName || "General Council",
      strengths,
      weaknesses,
      recommendations,
    }, "Report details retrieved");
  } catch (err) {
    next(err);
  }
}

async function approveReport(req, res, next) {
  try {
    const { id } = req.params;
    const report = await sheetsService.getById("AI_Reports", "reportId", id);
    if (!report) {
      return errorResponse(res, "Report not found", 404);
    }

    const updated = await sheetsService.update("AI_Reports", "reportId", id, {
      status: "Approved",
    });

    // Notify Discord and Socket.io
    const user = await sheetsService.getById("Users", "userId", updated.userId);
    const council = user?.councilId ? await sheetsService.getById("Councils", "councilId", user.councilId) : null;

    discordService.notifyApprovedPerformance(updated, user?.name || "Council Member", council?.councilName || "Council")
      .catch((err) => console.error(err));

    emitSocketEvent("report:approved", { report: updated, user, council });

    return successResponse(res, updated, "Report approved successfully and made visible to member");
  } catch (err) {
    next(err);
  }
}

module.exports = {
  generateReport,
  getReports,
  getReportById,
  approveReport,
};
