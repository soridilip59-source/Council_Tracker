const sheetsService = require("./sheetsService");

class PerformanceService {
  /**
   * Calculate objective performance metrics based on user data for a specific month
   * @param {string} userId - ID of the council member
   * @param {string} month - Month in format YYYY-MM (e.g. "2026-11")
   */
  async computeMemberMetrics(userId, month) {
    const user = await sheetsService.getById("Users", "userId", userId);
    if (!user) throw new Error("User not found");

    const councilId = user.councilId;

    // 1. Fetch Goals for the month
    const allGoals = await sheetsService.getAll("Goals");
    const userGoals = allGoals.filter((g) => {
      const matchUser = g.userId === userId || (councilId && g.councilId === councilId);
      const matchMonth = (g.startDate && g.startDate.startsWith(month)) || (g.dueDate && g.dueDate.startsWith(month));
      return matchUser && matchMonth;
    });

    const totalGoals = userGoals.length;
    const completedGoals = userGoals.filter((g) => g.status === "Completed").length;
    const blockedGoals = userGoals.filter((g) => g.status === "Blocked").length;

    // Goal Achievement Score (35%)
    let goalScore = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 75; // baseline if no goals recorded

    // 2. Fetch Progress History
    const allProgress = await sheetsService.getAll("Progress");
    const userProgress = allProgress.filter((p) => p.userId === userId && p.updatedAt && p.updatedAt.startsWith(month));

    // Consistency Score (20%): based on active days and update frequency
    const uniqueUpdateDays = new Set(userProgress.map((p) => p.updatedAt.slice(0, 10))).size;
    let consistencyScore = Math.min(100, Math.max(40, uniqueUpdateDays * 15 + (totalGoals > 0 ? 30 : 10)));

    // 3. Fetch Reflections
    const allReflections = await sheetsService.getAll("Reflections");
    const userReflections = allReflections.filter((r) => r.userId === userId && r.submittedAt && r.submittedAt.startsWith(month));

    // Reflection Quality Score (15%)
    let reflectionScore = 0;
    if (userReflections.length === 0) {
      reflectionScore = 50; // flagged as minimal reflection submitted
    } else {
      let qualitySum = 0;
      for (const ref of userReflections) {
        let pts = 0;
        if (ref.achievements?.trim().length > 15) pts += 25;
        if (ref.challenges?.trim().length > 15) pts += 25;
        if (ref.learnings?.trim().length > 15) pts += 25;
        if (ref.nextSteps?.trim().length > 15) pts += 25;
        qualitySum += pts;
      }
      reflectionScore = Math.round(qualitySum / userReflections.length);
    }

    // 4. Student Feedback (20%)
    const allFeedback = await sheetsService.getAll("Student_Feedback");
    const councilFeedback = allFeedback.filter((f) => f.councilId === councilId && f.month === month);

    let feedbackScore = 75; // Baseline default if no student feedback submitted for this month
    let hasFeedbackEvidence = councilFeedback.length > 0;

    if (hasFeedbackEvidence) {
      const avgRating = councilFeedback.reduce((sum, f) => sum + Number(f.rating || 3), 0) / councilFeedback.length;
      feedbackScore = Math.round((avgRating / 5) * 100);
    }

    // 5. Improvement & Initiative (10%)
    let improvementScore = Math.min(100, Math.max(50, Math.round(goalScore * 0.5 + reflectionScore * 0.3 + (blockedGoals === 0 ? 20 : 0))));

    // Overall Score Calculation (Transparent Scoring Methodology)
    const overallScore = Math.round(
      goalScore * 0.35 +
      consistencyScore * 0.20 +
      reflectionScore * 0.15 +
      feedbackScore * 0.20 +
      improvementScore * 0.10
    );

    return {
      userId,
      user,
      month,
      totalGoals,
      completedGoals,
      blockedGoals,
      goalScore,
      consistencyScore,
      reflectionScore,
      feedbackScore,
      improvementScore,
      overallScore,
      hasFeedbackEvidence,
      feedbackCount: councilFeedback.length,
      reflectionsCount: userReflections.length,
      recentReflections: userReflections.slice(-3),
      recentFeedback: councilFeedback.slice(-3),
    };
  }
}

module.exports = new PerformanceService();
