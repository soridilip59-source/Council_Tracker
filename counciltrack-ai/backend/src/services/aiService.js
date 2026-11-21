const { aiConfig } = require("../config/ai");
const { generateId } = require("../utils/generateId");
const performanceService = require("./performanceService");
const sheetsService = require("./sheetsService");

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
}

module.exports = new AIService();
