const sheetsService = require("../services/sheetsService");
const aiService = require("../services/aiService");
const { successResponse, errorResponse } = require("../utils/response");

function getTodayDate() {
  const now = new Date();
  return now.toISOString().split("T")[0];
}

// Calculate completion rate based on PRD Section 4.3: Completed / (Completed + Incomplete) * 100
function calcCompletionRate(completed, incomplete) {
  const finalized = completed + incomplete;
  if (finalized === 0) return "N/A";
  return Math.round((completed / finalized) * 100);
}

// Helper to get Monday and Sunday of the current week (Asia/Kolkata)
function getCurrentWeekRange() {
  const now = new Date();
  const day = now.getDay(); // 0 is Sunday, 1 is Monday...
  const diffToMonday = day === 0 ? -6 : 1 - day;

  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return {
    startDate: monday.toISOString().split("T")[0],
    endDate: sunday.toISOString().split("T")[0],
  };
}

async function getDashboardSummary(req, res) {
  try {
    const today = getTodayDate();
    const users = await sheetsService.getAll("Users");
    const councils = await sheetsService.getAll("Councils");
    const goals = await sheetsService.getAll("Goals");
    const reflections = await sheetsService.getAll("Reflections");
    const feedback = await sheetsService.getAll("Student_Feedback");

    const councilMembers = users.filter((u) => (u.role || "").toUpperCase() === "COUNCIL");
    const activeMembers = councilMembers.filter((u) => (u.status || "").toUpperCase() === "ACTIVE");
    const inactiveMembers = councilMembers.filter((u) => (u.status || "").toUpperCase() === "INACTIVE");

    const todayGoals = goals.filter((g) => g.goalDate === today);
    const todayCompleted = todayGoals.filter((g) => (g.status || "").toUpperCase() === "COMPLETED").length;
    const todayIncomplete = todayGoals.filter((g) => (g.status || "").toUpperCase() === "INCOMPLETE").length;
    const todayPending = todayGoals.filter((g) => (g.status || "").toUpperCase() === "PENDING").length;

    // Active members who have NOT submitted a reflection for today
    const submittedReflectionsToday = new Set(
      reflections.filter((r) => r.reflectionDate === today).map((r) => r.userId)
    );
    const pendingReflections = activeMembers.filter((m) => !submittedReflectionsToday.has(m.userId)).length;

    // Feedback counters
    const newFeedback = feedback.filter((f) => (f.status || "").toUpperCase() === "NEW").length;
    const complaints = feedback.filter((f) => (f.feedbackType || "").toUpperCase() === "COMPLAINT").length;

    return successResponse(
      res,
      {
        totalCouncils: councils.length,
        totalMembers: councilMembers.length,
        activeMembers: activeMembers.length,
        inactiveMembers: inactiveMembers.length,
        todayTotalGoals: todayGoals.length,
        todayCompletedGoals: todayCompleted,
        todayIncompleteGoals: todayIncomplete,
        todayPendingGoals: todayPending,
        todayCompletionRate: calcCompletionRate(todayCompleted, todayIncomplete),
        pendingEveningReflections: pendingReflections,
        totalFeedback: feedback.length,
        newFeedback,
        totalComplaints: complaints,
      },
      "Dashboard summary retrieved"
    );
  } catch (err) {
    console.error("getDashboardSummary error:", err);
    return errorResponse(res, "Failed to calculate dashboard summary", 500);
  }
}

async function getWeeklyProgress(req, res) {
  try {
    let { startDate, endDate, councilId, userId } = req.query;

    // Role check: Council members can only query their own data
    if (req.user.role === "COUNCIL") {
      userId = req.user.userId;
      councilId = req.user.councilId;
    }

    if (!startDate || !endDate) {
      const currentWeek = getCurrentWeekRange();
      startDate = startDate || currentWeek.startDate;
      endDate = endDate || currentWeek.endDate;
    }

    let goals = await sheetsService.getAll("Goals");

    // Filter by date range
    goals = goals.filter((g) => g.goalDate >= startDate && g.goalDate <= endDate);

    if (userId) {
      goals = goals.filter((g) => g.userId === userId);
    } else if (councilId) {
      goals = goals.filter((g) => g.councilId === councilId);
    }

    const totalGoals = goals.length;
    const completedGoals = goals.filter((g) => (g.status || "").toUpperCase() === "COMPLETED").length;
    const incompleteGoals = goals.filter((g) => (g.status || "").toUpperCase() === "INCOMPLETE").length;
    const pendingGoals = goals.filter((g) => (g.status || "").toUpperCase() === "PENDING").length;

    // Generate daily breakdown between startDate and endDate
    const start = new Date(startDate);
    const end = new Date(endDate);
    const dailyBreakdown = [];
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split("T")[0];
      const dayGoals = goals.filter((g) => g.goalDate === dateStr);
      const dayCompleted = dayGoals.filter((g) => (g.status || "").toUpperCase() === "COMPLETED").length;
      const dayIncomplete = dayGoals.filter((g) => (g.status || "").toUpperCase() === "INCOMPLETE").length;
      const dayPending = dayGoals.filter((g) => (g.status || "").toUpperCase() === "PENDING").length;

      dailyBreakdown.push({
        date: dateStr,
        dayName: dayNames[d.getDay()],
        total: dayGoals.length,
        completed: dayCompleted,
        incomplete: dayIncomplete,
        pending: dayPending,
        completionRate: calcCompletionRate(dayCompleted, dayIncomplete),
      });
    }

    const weeklyData = {
      startDate,
      endDate,
      totalGoals,
      completedGoals,
      incompleteGoals,
      pendingGoals,
      weeklyCompletionRate: calcCompletionRate(completedGoals, incompleteGoals),
      dailyBreakdown,
    };

    // Add heuristic AI insight
    const aiInsight = aiService.generateWeeklyInsight({
      ...weeklyData,
      weeklyCompletionRate: typeof weeklyData.weeklyCompletionRate === "number" ? weeklyData.weeklyCompletionRate : 0,
    });

    return successResponse(res, { ...weeklyData, aiInsight }, "Weekly progress retrieved");
  } catch (err) {
    console.error("getWeeklyProgress error:", err);
    return errorResponse(res, "Failed to calculate weekly progress", 500);
  }
}

async function getMonthlyProgress(req, res) {
  try {
    let { year, month, councilId, userId } = req.query;

    if (req.user.role === "COUNCIL") {
      userId = req.user.userId;
      councilId = req.user.councilId;
    }

    const now = new Date();
    const targetYear = year ? parseInt(year, 10) : now.getFullYear();
    const targetMonth = month ? parseInt(month, 10) : now.getMonth() + 1;

    const monthStr = targetMonth < 10 ? `0${targetMonth}` : `${targetMonth}`;
    const startOfMonth = `${targetYear}-${monthStr}-01`;
    const lastDayNum = new Date(targetYear, targetMonth, 0).getDate();
    const endOfMonth = `${targetYear}-${monthStr}-${lastDayNum < 10 ? `0${lastDayNum}` : lastDayNum}`;

    let goals = await sheetsService.getAll("Goals");
    goals = goals.filter((g) => g.goalDate >= startOfMonth && g.goalDate <= endOfMonth);

    if (userId) {
      goals = goals.filter((g) => g.userId === userId);
    } else if (councilId) {
      goals = goals.filter((g) => g.councilId === councilId);
    }

    const totalGoals = goals.length;
    const completedGoals = goals.filter((g) => (g.status || "").toUpperCase() === "COMPLETED").length;
    const incompleteGoals = goals.filter((g) => (g.status || "").toUpperCase() === "INCOMPLETE").length;
    const pendingGoals = goals.filter((g) => (g.status || "").toUpperCase() === "PENDING").length;

    // Weekly comparison blocks within the month
    const weeklyComparison = [];
    let currentWeekStart = 1;
    let weekIndex = 1;

    while (currentWeekStart <= lastDayNum) {
      const currentWeekEnd = Math.min(currentWeekStart + 6, lastDayNum);
      const wStartStr = `${targetYear}-${monthStr}-${currentWeekStart < 10 ? `0${currentWeekStart}` : currentWeekStart}`;
      const wEndStr = `${targetYear}-${monthStr}-${currentWeekEnd < 10 ? `0${currentWeekEnd}` : currentWeekEnd}`;

      const wGoals = goals.filter((g) => g.goalDate >= wStartStr && g.goalDate <= wEndStr);
      const wComp = wGoals.filter((g) => (g.status || "").toUpperCase() === "COMPLETED").length;
      const wIncomp = wGoals.filter((g) => (g.status || "").toUpperCase() === "INCOMPLETE").length;
      const wPend = wGoals.filter((g) => (g.status || "").toUpperCase() === "PENDING").length;

      weeklyComparison.push({
        weekLabel: `Week ${weekIndex} (${wStartStr.slice(5)} to ${wEndStr.slice(5)})`,
        total: wGoals.length,
        completed: wComp,
        incomplete: wIncomp,
        pending: wPend,
        completionRate: calcCompletionRate(wComp, wIncomp),
      });

      currentWeekStart += 7;
      weekIndex += 1;
    }

    return successResponse(
      res,
      {
        year: targetYear,
        month: targetMonth,
        startDate: startOfMonth,
        endDate: endOfMonth,
        totalGoals,
        completedGoals,
        incompleteGoals,
        pendingGoals,
        monthlyCompletionRate: calcCompletionRate(completedGoals, incompleteGoals),
        weeklyComparison,
      },
      "Monthly progress retrieved"
    );
  } catch (err) {
    console.error("getMonthlyProgress error:", err);
    return errorResponse(res, "Failed to calculate monthly progress", 500);
  }
}

async function getCouncilsComparison(req, res) {
  try {
    const { startDate, endDate } = req.query;
    const councils = await sheetsService.getAll("Councils");
    let goals = await sheetsService.getAll("Goals");
    const users = await sheetsService.getAll("Users");

    if (startDate && endDate) {
      goals = goals.filter((g) => g.goalDate >= startDate && g.goalDate <= endDate);
    }

    const comparison = councils.map((c) => {
      const cMembers = users.filter((u) => u.councilId === c.councilId);
      const cGoals = goals.filter((g) => g.councilId === c.councilId);
      const completed = cGoals.filter((g) => (g.status || "").toUpperCase() === "COMPLETED").length;
      const incomplete = cGoals.filter((g) => (g.status || "").toUpperCase() === "INCOMPLETE").length;
      const pending = cGoals.filter((g) => (g.status || "").toUpperCase() === "PENDING").length;

      return {
        councilId: c.councilId,
        councilName: c.councilName,
        totalMembers: cMembers.length,
        totalGoals: cGoals.length,
        completedGoals: completed,
        incompleteGoals: incomplete,
        pendingGoals: pending,
        completionRate: calcCompletionRate(completed, incomplete),
      };
    });

    return successResponse(res, comparison, "Council comparison retrieved");
  } catch (err) {
    return errorResponse(res, "Failed to compare councils", 500);
  }
}

async function getMemberAnalytics(req, res) {
  try {
    const { id } = req.params;

    if (req.user.role !== "ADMIN" && req.user.userId !== id) {
      return errorResponse(res, "Access denied", 403);
    }

    const user = await sheetsService.getById("Users", "userId", id);
    if (!user) {
      return errorResponse(res, "Member not found", 404);
    }

    const goals = await sheetsService.find("Goals", (g) => g.userId === id);
    const reflections = await sheetsService.find("Reflections", (r) => r.userId === id);

    const completed = goals.filter((g) => (g.status || "").toUpperCase() === "COMPLETED").length;
    const incomplete = goals.filter((g) => (g.status || "").toUpperCase() === "INCOMPLETE").length;
    const pending = goals.filter((g) => (g.status || "").toUpperCase() === "PENDING").length;

    return successResponse(
      res,
      {
        userId: user.userId,
        name: user.name,
        position: user.position,
        totalGoals: goals.length,
        completedGoals: completed,
        incompleteGoals: incomplete,
        pendingGoals: pending,
        completionRate: calcCompletionRate(completed, incomplete),
        totalReflections: reflections.length,
        recentGoals: goals.slice(-15).reverse(),
      },
      "Member analytics retrieved"
    );
  } catch (err) {
    return errorResponse(res, "Failed to retrieve member analytics", 500);
  }
}

async function getSmartAlerts(req, res) {
  try {
    const alerts = await aiService.generateSmartAlerts();
    return successResponse(res, alerts, `${alerts.length} smart alert(s) generated`);
  } catch (err) {
    console.error("getSmartAlerts error:", err);
    return errorResponse(res, "Failed to generate smart alerts", 500);
  }
}

module.exports = {
  getDashboardSummary,
  getWeeklyProgress,
  getMonthlyProgress,
  getCouncilsComparison,
  getMemberAnalytics,
  getSmartAlerts,
};
