import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { goalApi, reflectionApi } from "../../services/api";
import { ReflectionAiCard } from "../../components/ai/AiInsightCard";
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  AlertCircle,
  Calendar,
  Check,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export default function EveningReflection() {
  const todayStr = new Date().toISOString().split("T")[0];
  const [reflectionDate, setReflectionDate] = useState(todayStr);

  const [goals, setGoals] = useState([]);
  const [existingReflection, setExistingReflection] = useState(null);
  const [loading, setLoading] = useState(true);

  // Goal review state: Map goalId -> { status: 'COMPLETED' | 'INCOMPLETE', reason: '' }
  const [goalReviews, setGoalReviews] = useState({});

  // 4 Reflection Questions
  const [achievements, setAchievements] = useState("");
  const [challenges, setChallenges] = useState("");
  const [learnings, setLearnings] = useState("");
  const [improvements, setImprovements] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [error, setError] = useState("");
  const [aiAnalysis, setAiAnalysis] = useState(null);

  const loadDayData = async (date) => {
    setLoading(true);
    setError("");
    try {
      const [gRes, rRes] = await Promise.all([
        goalApi.getMy({ goalDate: date }),
        reflectionApi.getMy(),
      ]);

      const dayGoals = gRes.data.data || [];
      setGoals(dayGoals);

      // Prepopulate goal review states
      const reviews = {};
      for (const g of dayGoals) {
        const statusUpper = (g.status || "").toUpperCase();
        reviews[g.goalId] = {
          status: statusUpper === "PENDING" ? "COMPLETED" : statusUpper,
          reason: g.incompleteReason || "",
        };
      }
      setGoalReviews(reviews);

      // Check if reflection exists for this date
      const found = (rRes.data.data || []).find((r) => r.reflectionDate === date);
      if (found) {
        setExistingReflection(found);
        setAchievements(found.achievements || "");
        setChallenges(found.challenges || "");
        setLearnings(found.learnings || "");
        setImprovements(found.improvements || "");
      } else {
        setExistingReflection(null);
        setAchievements("");
        setChallenges("");
        setLearnings("");
        setImprovements("");
      }
    } catch (err) {
      console.error("Failed to load reflection data:", err);
      setError("Failed to load goals or reflections for this date.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDayData(reflectionDate);
  }, [reflectionDate]);

  const handleGoalStatusChange = (goalId, newStatus) => {
    setGoalReviews((prev) => ({
      ...prev,
      [goalId]: {
        ...prev[goalId],
        status: newStatus,
        reason: newStatus === "COMPLETED" ? "" : prev[goalId]?.reason || "",
      },
    }));
  };

  const handleReasonChange = (goalId, reason) => {
    setGoalReviews((prev) => ({
      ...prev,
      [goalId]: {
        ...prev[goalId],
        reason,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate that incomplete goals have a reason
    for (const g of goals) {
      const review = goalReviews[g.goalId];
      if (review?.status === "INCOMPLETE" && (!review.reason || !review.reason.trim())) {
        setError(`Please provide an explanation for incomplete goal: "${g.title}"`);
        return;
      }
    }

    if (!achievements.trim() || !challenges.trim() || !learnings.trim() || !improvements.trim()) {
      setError("Please answer all 4 reflection questions.");
      return;
    }

    // Build payload
    const goalStatuses = goals.map((g) => ({
      goalId: g.goalId,
      status: goalReviews[g.goalId]?.status || "COMPLETED",
      incompleteReason: goalReviews[g.goalId]?.reason || "",
    }));

    setSubmitting(true);
    try {
      const res = await reflectionApi.submit({
        reflectionDate,
        achievements,
        challenges,
        learnings,
        improvements,
        goalStatuses,
      });

      // Show AI analysis if returned
      if (res.data?.data?.aiAnalysis) {
        setAiAnalysis(res.data.data.aiAnalysis);
      }

      setSubmittedSuccess(true);
      await loadDayData(reflectionDate);
      setTimeout(() => setSubmittedSuccess(false), 4000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit reflection.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Sparkles className="text-amber-500" size={24} />
            <span>Evening Reflection</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Section 5.3 • Review daily goals, provide incomplete reasons, and reflect on accomplishments & learnings.
          </p>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
          <Calendar size={15} className="text-indigo-600" />
          <span>Date:</span>
          <input
            type="date"
            value={reflectionDate}
            onChange={(e) => setReflectionDate(e.target.value)}
            className="text-xs text-slate-900 focus:outline-none"
          />
        </div>
      </div>

      {existingReflection && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs text-emerald-800">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-emerald-600 flex-shrink-0" />
            <span>
              <strong>Reflection already submitted</strong> for {reflectionDate} at{" "}
              {new Date(existingReflection.submittedAt).toLocaleTimeString("en-IN")}. You may edit and update your responses below.
            </span>
          </div>
        </div>
      )}

      {submittedSuccess && (
        <div className="p-4 bg-emerald-100 border border-emerald-300 rounded-2xl text-emerald-900 text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 size={20} className="text-emerald-600" />
          <span>Evening Reflection submitted and goals finalized successfully!</span>
        </div>
      )}

      {/* AI Feedback after submission */}
      {aiAnalysis && (
        <ReflectionAiCard aiAnalysis={aiAnalysis} onClose={() => setAiAnalysis(null)} />
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs flex items-start gap-2">
          <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500">Loading reflection form...</div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Goal Status Review Checklist */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6">
            <div className="mb-4">
              <h2 className="text-base font-bold text-slate-900">Step 1: Review Today's Goals ({goals.length})</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Mark each goal as Completed (✓) or Incomplete (✕). Explanations are mandatory for incomplete goals.
              </p>
            </div>

            {goals.length === 0 ? (
              <div className="p-6 bg-slate-50 rounded-xl text-center text-xs text-slate-500">
                <span>No goals were created for {reflectionDate}. </span>
                <Link to="/council/goals" className="font-semibold text-indigo-600 hover:underline">
                  Add goals first
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {goals.map((g) => {
                  const currentStatus = goalReviews[g.goalId]?.status || "COMPLETED";
                  const currentReason = goalReviews[g.goalId]?.reason || "";

                  return (
                    <div
                      key={g.goalId}
                      className={`p-4 rounded-xl border transition ${
                        currentStatus === "COMPLETED"
                          ? "bg-emerald-50/40 border-emerald-200"
                          : "bg-rose-50/40 border-rose-200"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm font-bold text-slate-900">{g.title}</h3>
                            {g.assignedToName && (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                                👤 {g.assignedToName}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 mt-0.5">{g.description}</p>
                        </div>

                        {/* Status Toggle Buttons */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => handleGoalStatusChange(g.goalId, "COMPLETED")}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                              currentStatus === "COMPLETED"
                                ? "bg-emerald-600 text-white shadow-xs"
                                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                            }`}
                          >
                            <Check size={14} />
                            <span>Completed</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleGoalStatusChange(g.goalId, "INCOMPLETE")}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                              currentStatus === "INCOMPLETE"
                                ? "bg-rose-600 text-white shadow-xs"
                                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                            }`}
                          >
                            <XCircle size={14} />
                            <span>Incomplete</span>
                          </button>
                        </div>
                      </div>

                      {/* Required reason for Incomplete */}
                      {currentStatus === "INCOMPLETE" && (
                        <div className="mt-3 pt-3 border-t border-rose-200/80">
                          <label className="block text-xs font-bold text-rose-800 mb-1">
                            Why could you not complete this goal? <span className="text-rose-600">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={currentReason}
                            onChange={(e) => handleReasonChange(g.goalId, e.target.value)}
                            placeholder="e.g. Venue double-booked; postponed to tomorrow morning..."
                            className="w-full px-3 py-2 bg-white border border-rose-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Step 2: 4 Core Evening Reflection Questions */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-5">
            <div>
              <h2 className="text-base font-bold text-slate-900">Step 2: Evening Reflection Questions</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Reflect honestly on today's activities to foster continuous improvement.
              </p>
            </div>

            {/* Question 1: Achievements */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                1. What did you accomplish today? <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={achievements}
                onChange={(e) => setAchievements(e.target.value)}
                placeholder="Highlight your key achievements and outcomes achieved today..."
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 leading-relaxed"
              />
            </div>

            {/* Question 2: Challenges */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                2. What challenges did you face? <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={challenges}
                onChange={(e) => setChallenges(e.target.value)}
                placeholder="Describe any hurdles, coordination issues, or delays encountered..."
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 leading-relaxed"
              />
            </div>

            {/* Question 3: Learnings */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                3. What did you learn today? <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={learnings}
                onChange={(e) => setLearnings(e.target.value)}
                placeholder="Key takeaways, insights, or peer coordination experiences..."
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 leading-relaxed"
              />
            </div>

            {/* Question 4: Improvements */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                4. What will you improve tomorrow? <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={improvements}
                onChange={(e) => setImprovements(e.target.value)}
                placeholder="Concrete adjustments or plans for tomorrow's execution..."
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 leading-relaxed"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              to="/council/dashboard"
              className="px-5 py-2.5 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-sm transition disabled:opacity-50"
            >
              <Send size={15} />
              <span>{submitting ? "Submitting Reflection..." : "Submit Evening Reflection"}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
