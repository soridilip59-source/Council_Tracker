const { aiConfig } = require("../config/ai");
const { generateId } = require("../utils/generateId");
const performanceService = require("./performanceService");
const sheetsService = require("./sheetsService");

// ─── Heuristic Helpers ────────────────────────────────────────────────────────

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getTodayIST() {
  return new Date().toLocaleString("sv-SE", { timeZone: "Asia/Kolkata" }).slice(0, 10);
}

class AIService {
  /**
   * Generates a monthly performance report for a council member
   */
  async generateMonthlyReport(userId, month) {
    const metrics = await performanceService.computeMemberMetrics(userId, month);

    let qualitativeAnalysis;
    if (aiConfig.provider === "gemini" && aiConfig.apiKey) {
      qualitativeAnalysis = await this.generateWithGemini(metrics);
    } else if (aiConfig.provider === "openai" && aiConfig.apiKey) {
      qualitativeAnalysis = await this.generateWithOpenAI(metrics);
    } else {
      qualitativeAnalysis = this.generateHeuristicAnalysis(metrics);
    }

    const report = {
      reportId: generateId("rep"),
      userId,
      month,
      overallScore: metrics.overallScore,
      goalScore: metrics.goalScore,
      consistencyScore: metrics.consistencyScore,
      reflectionScore: metrics.reflectionScore,
      feedbackScore: metrics.feedbackScore,
      improvementScore: metrics.improvementScore,
      strengths: JSON.stringify(qualitativeAnalysis.strengths || []),
      weaknesses: JSON.stringify(qualitativeAnalysis.improvements || qualitativeAnalysis.weaknesses || []),
      recommendations: JSON.stringify(qualitativeAnalysis.recommendations || []),
      status: "Pending", // Requires Admin/Super Admin approval before becoming final
      generatedAt: new Date().toISOString(),
    };

    // Save to AI_Reports worksheet
    await sheetsService.insert("AI_Reports", report);
    return report;
  }

  generateHeuristicAnalysis(metrics) {
    const strengths = [];
    const improvements = [];
    const recommendations = [];

    // Goal Evaluation
    if (metrics.goalScore >= 80) {
      strengths.push(`High goal achievement rate (${metrics.completedGoals}/${metrics.totalGoals} goals completed successfully).`);
    } else if (metrics.goalScore >= 60) {
      strengths.push("Steady execution of core council responsibilities.");
      improvements.push("A portion of targeted goals faced delays or remained incomplete by the month-end deadline.");
      recommendations.push("Break down multi-day goals into smaller daily checkpoints to avoid late-month backlog.");
    } else {
      improvements.push(`Low goal completion rate (${metrics.completedGoals}/${metrics.totalGoals} completed).`);
      recommendations.push("Review capacity constraints with council lead and set more realistic weekly milestones.");
    }

    // Consistency
    if (metrics.consistencyScore >= 80) {
      strengths.push("Highly consistent daily check-ins and disciplined progress tracking.");
    } else {
      improvements.push("Inconsistent daily progress logging across active weekdays.");
      recommendations.push("Establish a fixed 5-minute evening routine to log progress and flag impediments.");
    }

    // Reflections
    if (metrics.reflectionScore >= 80) {
      strengths.push("Thoughtful, detailed reflections highlighting concrete learnings and proactive next steps.");
    } else if (metrics.reflectionsCount === 0) {
      improvements.push("No daily or weekly reflections were recorded during this reporting cycle.");
      recommendations.push("Mandate weekly reflection submissions to identify bottlenecks and foster continuous growth.");
    } else {
      improvements.push("Reflections tend to be brief with limited challenge and learning analysis.");
      recommendations.push("Articulate specific root causes when describing operational challenges in reflections.");
    }

    // Student Feedback Evidence
    if (metrics.hasFeedbackEvidence) {
      if (metrics.feedbackScore >= 80) {
        strengths.push(`Strong student appreciation (rating: ${(metrics.feedbackScore / 20).toFixed(1)}/5.0 across student submissions).`);
      } else {
        improvements.push("Student feedback indicated room for improved accessibility and proactive communication.");
        recommendations.push("Host bi-weekly open student forums to resolve community concerns faster.");
      }
    } else {
      recommendations.push("Actively encourage student participation in the monthly feedback survey to gather richer performance evidence.");
    }

    // Fallbacks to ensure robust output
    if (strengths.length === 0) {
      strengths.push("Active participation in council mandate and ongoing initiatives.");
    }
    if (improvements.length === 0) {
      improvements.push("Maintain momentum and expand peer collaboration across other campus councils.");
    }
    if (recommendations.length === 0) {
      recommendations.push("Continue regular goal tracking and mentor junior council members.");
    }

    return { strengths, improvements, recommendations };
  }

  async generateWithGemini(metrics) {
    try {
      const prompt = `You are CouncilTrack AI's expert performance evaluator.
Evaluate this council member based on the following verified data:
- Member Name: ${metrics.user?.name || "Council Member"}
- Reporting Month: ${metrics.month}
- Total Goals: ${metrics.totalGoals}, Completed Goals: ${metrics.completedGoals}, Blocked Goals: ${metrics.blockedGoals}
- Goal Achievement Score: ${metrics.goalScore}%
- Consistency Score: ${metrics.consistencyScore}%
- Reflection Score: ${metrics.reflectionScore}% (${metrics.reflectionsCount} reflections submitted)
- Student Feedback Score: ${metrics.feedbackScore}% (${metrics.hasFeedbackEvidence ? `${metrics.feedbackCount} reviews` : "No student feedback logged yet"})

Provide evidence-grounded evaluation in valid JSON matching this schema:
{
  "strengths": ["string", "string"],
  "improvements": ["string", "string"],
  "recommendations": ["string", "string"]
}
Keep points professional, objective, actionable, and directly tied to the evidence provided.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${aiConfig.model}:generateContent?key=${aiConfig.apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" },
        }),
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      return JSON.parse(text);
    } catch (err) {
      console.warn("[AIService] Gemini call failed, falling back to heuristic engine:", err.message);
      return this.generateHeuristicAnalysis(metrics);
    }
  }

  async generateWithOpenAI(metrics) {
    // OpenAI implementation if configured
    return this.generateHeuristicAnalysis(metrics);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // NEW: suggestGoals — returns 3 smart goal suggestions based on past data
  // ─────────────────────────────────────────────────────────────────────────────
  async suggestGoals(userId) {
    const user = await sheetsService.getById("Users", "userId", userId);
    if (!user) return [];

    const today = getTodayIST();
    const allGoals = await sheetsService.find("Goals", (g) => g.userId === userId);

    // Build a set of titles already used today
    const todayTitles = new Set(
      allGoals.filter((g) => g.goalDate === today).map((g) => g.title.toLowerCase())
    );

    // Completion stats
    const completed = allGoals.filter((g) => (g.status || "").toUpperCase() === "COMPLETED").length;
    const incomplete = allGoals.filter((g) => (g.status || "").toUpperCase() === "INCOMPLETE").length;
    const completionRate = allGoals.length > 0
      ? Math.round((completed / allGoals.length) * 100)
      : 0;

    // Build suggestion pool based on position and performance
    const position = (user.position || "").toLowerCase();
    let pool = [
      "Attend morning assembly and record attendance",
      "Review weekly council meeting notes and share summary",
      "Collect student feedback forms from your batch",
      "Follow up on 2 pending student requests",
      "Update council notice board with this week's events",
      "Plan and schedule tomorrow's council activity",
      "Conduct peer review for 3 juniors",
      "Complete documentation for last week's initiative",
      "Host a 15-min check-in with 5 students",
      "Submit attendance report to council head",
    ];

    if (position.includes("president") || position.includes("lead")) {
      pool = [
        "Chair today's council meeting and document action items",
        "Review completion status of all member goals",
        "Send weekly summary report to Admin",
        "Coordinate with 2 council leads on cross-council initiative",
        "Approve pending member requests",
        ...pool,
      ];
    } else if (position.includes("secretary")) {
      pool = [
        "Prepare and circulate today's meeting agenda",
        "Update council minutes from yesterday's session",
        "Track attendance of council members",
        "File all pending documents and approvals",
        ...pool,
      ];
    }

    // If low completion — add motivational/recovery suggestions
    if (completionRate < 50 && allGoals.length > 3) {
      pool.unshift("Review and close 1 incomplete goal from last week");
      pool.unshift("Identify your top blocker and discuss with council lead");
    }

    // Filter out already-used titles today
    const filtered = pool.filter((s) => !todayTitles.has(s.toLowerCase()));

    // Pick 3 unique suggestions
    const suggestions = [];
    const shuffled = filtered.sort(() => Math.random() - 0.5);
    for (const s of shuffled) {
      if (suggestions.length >= 3) break;
      suggestions.push({
        title: s,
        priority: suggestions.length === 0 ? "HIGH" : "MEDIUM",
        description: `Suggested based on your role as ${user.position || "Council Member"}`,
      });
    }

    return suggestions;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // NEW: analyzeReflection — returns AI feedback on submitted reflection
  // ─────────────────────────────────────────────────────────────────────────────
  analyzeReflection({ achievements, challenges, learnings, improvements, goalStatuses = [] }) {
    const completed = goalStatuses.filter((g) => (g.status || "").toUpperCase() === "COMPLETED").length;
    const incomplete = goalStatuses.filter((g) => (g.status || "").toUpperCase() === "INCOMPLETE").length;
    const total = goalStatuses.length;
    const rate = total > 0 ? Math.round((completed / (completed + incomplete || 1)) * 100) : null;

    // Depth check
    const isDeep = (text) => text && text.trim().length > 30;
    const depthScore = [achievements, challenges, learnings, improvements].filter(isDeep).length;

    let tone = "neutral";
    let headline = "";
    let feedback = "";
    let tip = "";

    if (rate === null || total === 0) {
      // No goals submitted with reflection
      if (depthScore >= 3) {
        tone = "positive";
        headline = "Thoughtful Reflection! 🌟";
        feedback = "Aapki reflection bahut detailed hai. Challenges aur learnings clearly likhe hain — keep it up!";
        tip = "Kal ke goals pehle se plan karein taaki reflection aur meaningful bane.";
      } else {
        tone = "neutral";
        headline = "Reflection Submitted ✅";
        feedback = "Reflection submit ho gayi. Kal thoda aur detail mein likho — especially challenges aur learnings mein.";
        tip = "5-10 words nahi, 2-3 full sentences likhne ki koshish karo har section mein.";
      }
    } else if (rate >= 80) {
      tone = "excellent";
      headline = "Outstanding Performance! 🎉";
      feedback = `Aaj ka completion rate ${rate}% raha — khatarnak kaam! ${completed}/${total} goals complete kiye.`;
      tip = depthScore >= 3
        ? "Aise hi chalate raho — consistency hi asli success hai!"
        : "Goals toh excellent hain, reflection mein bhi thoda aur detail add karo.";
    } else if (rate >= 60) {
      tone = "good";
      headline = "Good Progress! 👍";
      feedback = `${rate}% completion rate — acha hai! ${incomplete > 0 ? `${incomplete} goals incomplete rahe.` : ""} Kal aur better kar sakte ho.`;
      tip = incomplete > 0
        ? "Incomplete goals ke reasons carefully likho — isse kal plan karna easy hoga."
        : "Consistency maintain karo, aur ek goal HIGH priority pe rakhna seekho.";
    } else if (rate >= 40) {
      tone = "warning";
      headline = "Needs Improvement ⚠️";
      feedback = `Sirf ${rate}% goals complete hue. Kya koi blocker tha? Challenges section mein clearly likho.`;
      tip = "Kal kam goals lo lekin unhe 100% complete karo — quality over quantity.";
    } else {
      tone = "critical";
      headline = "Attention Needed 🚨";
      feedback = `${rate}% completion — kaafi goals incomplete rahe. Council lead se baat karo agar koi problem hai.`;
      tip = "Kal sirf 2-3 goals lo jo definitely complete ho sakein. Chhote goals se confidence badhta hai.";
    }

    return { tone, headline, feedback, tip, completionRate: rate, depthScore };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // NEW: generateWeeklyInsight — returns a paragraph insight for weekly data
  // ─────────────────────────────────────────────────────────────────────────────
  generateWeeklyInsight({ totalGoals, completedGoals, incompleteGoals, pendingGoals, weeklyCompletionRate, dailyBreakdown = [] }) {
    if (totalGoals === 0) {
      return {
        summary: "Is hafte koi goals set nahi kiye gaye. Agli baar daily goals zaroor set karo — yeh aapki performance track karne ka sabse achha tarika hai.",
        highlight: null,
        suggestion: "Kal se daily 2-3 goals set karna start karo.",
        emoji: "📋",
      };
    }

    const rate = typeof weeklyCompletionRate === "number" ? weeklyCompletionRate : 0;

    // Find best and worst day
    const finalized = dailyBreakdown.filter((d) => d.total > 0);
    let bestDay = null, worstDay = null;
    if (finalized.length > 0) {
      bestDay = finalized.reduce((a, b) => {
        const rateA = a.completed + a.incomplete > 0 ? (a.completed / (a.completed + a.incomplete)) : 0;
        const rateB = b.completed + b.incomplete > 0 ? (b.completed / (b.completed + b.incomplete)) : 0;
        return rateB > rateA ? b : a;
      });
      worstDay = finalized.reduce((a, b) => {
        const rateA = a.completed + a.incomplete > 0 ? (a.completed / (a.completed + a.incomplete)) : 1;
        const rateB = b.completed + b.incomplete > 0 ? (b.completed / (b.completed + b.incomplete)) : 1;
        return rateB < rateA ? b : a;
      });
    }

    let summary, emoji, suggestion;

    if (rate >= 85) {
      emoji = "🏆";
      summary = `Shaandaar hafte raha! ${completedGoals} goals complete kiye — ${rate}% completion rate. Yeh performance is hafte ka highlight hai.`;
      suggestion = "Yeh momentum agle hafte bhi rakho. High-priority goals pe pehle focus karo.";
    } else if (rate >= 70) {
      emoji = "✅";
      summary = `Achha hafte raha overall — ${rate}% completion ke saath ${completedGoals} goals complete kiye. ${incompleteGoals > 0 ? `${incompleteGoals} goals incomplete rahe jisme improvement ki gunjaish hai.` : ""}`;
      suggestion = "Incomplete goals ke patterns dekho — kya wahi kaam baar baar ruk raha hai?";
    } else if (rate >= 50) {
      emoji = "📈";
      summary = `Is hafte ${rate}% goals complete hue. ${pendingGoals > 0 ? `${pendingGoals} goals abhi bhi pending hain.` : ""} Performance average ke kareeb hai — thoda aur push kar sakte ho.`;
      suggestion = "Roz subah goals review karo aur ek goal 'must-complete' mark karo.";
    } else if (rate > 0) {
      emoji = "⚠️";
      summary = `Is hafte struggle tha — sirf ${rate}% goals complete hue. ${incompleteGoals} goals incomplete rahe. Kya koi badi problem thi?`;
      suggestion = "Agar consistently low hai toh council lead se milkar plan review karo. Goals zyada realistic set karo.";
    } else {
      emoji = "📋";
      summary = `Is hafte koi goal final nahi hua — sab ya toh pending hain ya koi data nahi hai abhi.`;
      suggestion = "Evening reflection submit karo daily — isse goals automatically update hote hain.";
    }

    const highlight = bestDay
      ? `Best day: ${bestDay.dayName} (${bestDay.completed} goals complete)`
      : null;

    return { summary, highlight, suggestion, emoji, completionRate: rate };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // NEW: generateSmartAlerts — returns alerts for underperforming members (Admin)
  // ─────────────────────────────────────────────────────────────────────────────
  async generateSmartAlerts() {
    const users = await sheetsService.find("Users", (u) =>
      (u.role || "").toUpperCase() === "COUNCIL" && (u.status || "").toUpperCase() === "ACTIVE"
    );
    const allGoals = await sheetsService.getAll("Goals");
    const allReflections = await sheetsService.getAll("Reflections");

    const today = getTodayIST();
    const alerts = [];

    for (const user of users) {
      const userGoals = allGoals.filter((g) => g.userId === user.userId);

      // Last 7 days goals
      const last7 = [];
      for (let i = 1; i <= 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        last7.push(d.toISOString().split("T")[0]);
      }

      const recentGoals = userGoals.filter((g) => last7.includes(g.goalDate));
      const recentCompleted = recentGoals.filter((g) => (g.status || "").toUpperCase() === "COMPLETED").length;
      const recentIncomplete = recentGoals.filter((g) => (g.status || "").toUpperCase() === "INCOMPLETE").length;
      const recentPending = recentGoals.filter((g) => (g.status || "").toUpperCase() === "PENDING").length;

      // Check no goals set today
      const todayGoals = userGoals.filter((g) => g.goalDate === today);
      const reflectedToday = allReflections.some((r) => r.userId === user.userId && r.reflectionDate === today);

      // Consecutive no-activity days
      let noActivityDays = 0;
      for (const day of last7) {
        const dayGoals = userGoals.filter((g) => g.goalDate === day);
        if (dayGoals.length === 0) noActivityDays++;
        else break;
      }

      const recentRate = (recentCompleted + recentIncomplete) > 0
        ? Math.round((recentCompleted / (recentCompleted + recentIncomplete)) * 100)
        : null;

      // Alert conditions
      if (noActivityDays >= 3) {
        alerts.push({
          severity: "HIGH",
          userId: user.userId,
          memberName: user.name,
          position: user.position,
          message: `${user.name} ne ${noActivityDays} din se koi goal set nahi kiya. Immediately follow up karein.`,
          action: "Connect with member to understand reason for inactivity",
          emoji: "🚨",
        });
      } else if (recentRate !== null && recentRate < 40 && recentGoals.length >= 3) {
        alerts.push({
          severity: "MEDIUM",
          userId: user.userId,
          memberName: user.name,
          position: user.position,
          message: `${user.name} ka last 7 din ka completion rate sirf ${recentRate}% hai. Performance support zaruri hai.`,
          action: "Review incomplete goal reasons and schedule a 1:1 check-in",
          emoji: "⚠️",
        });
      } else if (todayGoals.length === 0 && !reflectedToday) {
        const hour = new Date().getHours();
        if (hour >= 14) {
          alerts.push({
            severity: "LOW",
            userId: user.userId,
            memberName: user.name,
            position: user.position,
            message: `${user.name} ne aaj abhi tak koi goal set nahi kiya aur reflection bhi submit nahi ki.`,
            action: "Send a reminder to set today's goals",
            emoji: "📋",
          });
        }
      } else if (recentPending >= 5) {
        alerts.push({
          severity: "LOW",
          userId: user.userId,
          memberName: user.name,
          position: user.position,
          message: `${user.name} ke ${recentPending} goals abhi pending hain — evening reflection missing ho sakti hai.`,
          action: "Remind member to submit evening reflection daily",
          emoji: "⏳",
        });
      }
    }

    // Sort: HIGH first, then MEDIUM, then LOW
    const order = { HIGH: 0, MEDIUM: 1, LOW: 2 };
    alerts.sort((a, b) => order[a.severity] - order[b.severity]);

    return alerts;
  }

  async generateWithOpenAI(metrics) {
    // OpenAI implementation if configured
    return this.generateHeuristicAnalysis(metrics);
  }
}

module.exports = new AIService();
