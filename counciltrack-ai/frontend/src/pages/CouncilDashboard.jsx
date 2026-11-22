import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { goalApi, progressApi, reflectionApi, feedbackApi, reportApi } from "../services/api";
import { Target, CheckCircle2, TrendingUp, Sparkles, MessageSquare, Plus, ArrowRight, ShieldCheck, Clock } from "lucide-react";

export default function CouncilDashboard() {
  const { user } = useAuth();
  const [goals, setGoals] = useState([]);
  const [reflections, setReflections] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // Goal Creation State
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: "", description: "", goalType: "daily", priority: "Medium", dueDate: new Date().toISOString().slice(0, 10) });

  // Progress Update State
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [progressForm, setProgressForm] = useState({ percentage: 50, updateNote: "" });

  // Reflection Submission State
  const [showReflectionModal, setShowReflectionModal] = useState(false);
  const [reflectionForm, setReflectionForm] = useState({
    periodType: "daily",
    achievements: "",
    challenges: "",
    learnings: "",
    nextSteps: "",
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [gRes, rRes, fRes, repRes] = await Promise.all([
        goalApi.getAll(),
        reflectionApi.getAll(),
        feedbackApi.getAll(),
        reportApi.getAll(),
      ]);
      setGoals(gRes.data.data || []);
      setReflections(rRes.data.data || []);
      setFeedback(fRes.data.data || []);
      setReports(repRes.data.data || []);
    } catch (err) {
      console.error("Failed to load council dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    try {
      await goalApi.create(newGoal);
      setShowGoalModal(false);
      setNewGoal({ title: "", description: "", goalType: "daily", priority: "Medium", dueDate: new Date().toISOString().slice(0, 10) });
      loadData();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to create goal");
    }
  };

  const handleSaveProgress = async (e) => {
    e.preventDefault();
    try {
      await progressApi.add({
        goalId: selectedGoal.goalId,
        percentage: Number(progressForm.percentage),
        updateNote: progressForm.updateNote,
      });
      setSelectedGoal(null);
      setProgressForm({ percentage: 50, updateNote: "" });
      loadData();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to update progress");
    }
  };

  const handleSubmitReflection = async (e) => {
    e.preventDefault();
    try {
      await reflectionApi.submit(reflectionForm);
      setShowReflectionModal(false);
      setReflectionForm({
        periodType: "daily",
        achievements: "",
        challenges: "",
        learnings: "",
        nextSteps: "",
      });
      loadData();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to submit reflection");
    }
  };

  const dailyGoals = goals.filter((g) => g.goalType === "daily");
  const weeklyGoals = goals.filter((g) => g.goalType === "weekly");
  const completedGoals = goals.filter((g) => g.status === "Completed");

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-6 rounded-2xl shadow-lg">
        <div>
          <div className="flex items-center gap-2 text-emerald-200 text-sm font-semibold uppercase tracking-wider mb-1">
            🎯 Council Member Dashboard
          </div>
          <h1 className="text-3xl font-bold">Welcome, {user?.name}</h1>
          <p className="text-emerald-200 text-sm mt-1">Track daily & weekly goals, document reflections, and review your AI performance evaluation.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowGoalModal(true)}
            className="bg-white text-emerald-900 hover:bg-emerald-50 font-semibold px-4 py-2.5 rounded-xl shadow flex items-center gap-2 text-sm transition"
          >
            <Plus size={16} /> Set New Goal
          </button>
          <button
            onClick={() => setShowReflectionModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2.5 rounded-xl shadow flex items-center gap-2 text-sm transition"
          >
            <Sparkles size={16} /> Submit Reflection
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Target size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase">Daily Goals</p>
            <h3 className="text-2xl font-bold text-gray-900">{dailyGoals.length}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase">Weekly Goals</p>
            <h3 className="text-2xl font-bold text-gray-900">{weeklyGoals.length}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase">Completed</p>
            <h3 className="text-2xl font-bold text-gray-900">{completedGoals.length} / {goals.length}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Sparkles size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase">Reflections</p>
            <h3 className="text-2xl font-bold text-gray-900">{reflections.length}</h3>
          </div>
        </div>
      </div>

      {/* Goals Section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Target size={20} className="text-emerald-600" /> My Active Goals & Progress Updates
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((goal) => (
            <div key={goal.goalId} className="p-5 rounded-xl border border-gray-200/80 hover:border-emerald-500 transition shadow-sm bg-white">
              <div className="flex justify-between items-start mb-2">
                <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  goal.goalType === "daily" ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"
                }`}>
                  {goal.goalType} Goal
                </span>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                  goal.status === "Completed" ? "bg-emerald-100 text-emerald-800" :
                  goal.status === "In Progress" ? "bg-blue-100 text-blue-800" :
                  goal.status === "Blocked" ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"
                }`}>
                  {goal.status}
                </span>
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-1">{goal.title}</h3>
              <p className="text-xs text-gray-500 mb-4 line-clamp-2">{goal.description || "No description provided."}</p>

              {/* Progress Bar */}
              <div className="space-y-1 mb-4">
                <div className="flex justify-between text-xs text-gray-600 font-medium">
                  <span>Progress</span>
                  <span className="font-bold text-emerald-700">{goal.percentage || 0}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-emerald-600 h-2 rounded-full transition-all duration-300" style={{ width: `${goal.percentage || 0}%` }} />
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-gray-100 text-xs">
                <span className="text-gray-400 flex items-center gap-1">
                  <Clock size={12} /> Due: {goal.dueDate}
                </span>
                <button
                  onClick={() => {
                    setSelectedGoal(goal);
                    setProgressForm({ percentage: goal.percentage || 50, updateNote: "" });
                  }}
                  className="text-emerald-700 font-bold hover:text-emerald-900 flex items-center gap-1"
                >
                  Update Progress <ArrowRight size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Approved AI Performance Evaluation Report Card */}
      {reports.length > 0 && (
        <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-white rounded-2xl border border-emerald-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm uppercase tracking-wider mb-2">
            <Sparkles size={18} className="text-emerald-600" /> AI Monthly Performance Evaluation
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-4">
            Overall Score: <span className="text-emerald-700">{reports[0].overallScore} / 100</span> ({reports[0].month})
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6 text-center text-xs">
            <div className="bg-white p-3 rounded-xl border border-emerald-100">
              <span className="text-gray-500 block">Goal (35%)</span>
              <span className="text-lg font-bold text-emerald-800">{reports[0].goalScore}%</span>
            </div>
            <div className="bg-white p-3 rounded-xl border border-emerald-100">
              <span className="text-gray-500 block">Consistency (20%)</span>
              <span className="text-lg font-bold text-emerald-800">{reports[0].consistencyScore}%</span>
            </div>
            <div className="bg-white p-3 rounded-xl border border-emerald-100">
              <span className="text-gray-500 block">Reflection (15%)</span>
              <span className="text-lg font-bold text-emerald-800">{reports[0].reflectionScore}%</span>
            </div>
            <div className="bg-white p-3 rounded-xl border border-emerald-100">
              <span className="text-gray-500 block">Feedback (20%)</span>
              <span className="text-lg font-bold text-emerald-800">{reports[0].feedbackScore}%</span>
            </div>
            <div className="bg-white p-3 rounded-xl border border-emerald-100">
              <span className="text-gray-500 block">Improvement (10%)</span>
              <span className="text-lg font-bold text-emerald-800">{reports[0].improvementScore}%</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-white p-4 rounded-xl border border-emerald-100">
              <h4 className="font-bold text-emerald-900 mb-2">💪 Core Strengths</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                {reports[0].strengths?.map((s, idx) => <li key={idx}>{s}</li>)}
              </ul>
            </div>
            <div className="bg-white p-4 rounded-xl border border-amber-100">
              <h4 className="font-bold text-amber-900 mb-2">📈 Growth Opportunities</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                {reports[0].weaknesses?.map((w, idx) => <li key={idx}>{w}</li>)}
              </ul>
            </div>
            <div className="bg-white p-4 rounded-xl border border-blue-100">
              <h4 className="font-bold text-blue-900 mb-2">💡 Recommended Actions</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                {reports[0].recommendations?.map((r, idx) => <li key={idx}>{r}</li>)}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Progress Update Modal */}
      {selectedGoal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-1">Update Progress</h3>
            <p className="text-xs text-gray-500 mb-4">{selectedGoal.title}</p>

            <form onSubmit={handleSaveProgress} className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold text-gray-700 mb-1">
                  <span>Completion Percentage</span>
                  <span className="text-emerald-700 font-bold">{progressForm.percentage}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={progressForm.percentage}
                  onChange={(e) => setProgressForm({ ...progressForm, percentage: e.target.value })}
                  className="w-full accent-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Progress Notes / Achievements</label>
                <textarea
                  rows={3}
                  required
                  value={progressForm.updateNote}
                  onChange={(e) => setProgressForm({ ...progressForm, updateNote: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  placeholder="Detail what was accomplished, any blockers resolved, or next steps..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setSelectedGoal(null)}
                  className="px-4 py-2 border text-gray-600 rounded-lg text-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 text-white rounded-lg text-sm font-semibold hover:bg-emerald-800"
                >
                  Record Progress
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reflection Modal */}
      {showReflectionModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-1">Submit Council Reflection</h3>
            <p className="text-xs text-gray-500 mb-4">Reflections are private and visible only to you and authorized council admins.</p>

            <form onSubmit={handleSubmitReflection} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Reflection Period</label>
                <select
                  value={reflectionForm.periodType}
                  onChange={(e) => setReflectionForm({ ...reflectionForm, periodType: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                >
                  <option value="daily">Daily Evening Reflection</option>
                  <option value="weekly">Weekly Reflection</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">1. What did you accomplish? (Key Achievements)</label>
                <textarea
                  rows={2}
                  required
                  value={reflectionForm.achievements}
                  onChange={(e) => setReflectionForm({ ...reflectionForm, achievements: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  placeholder="List specific milestones completed..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">2. What challenges or blockers did you face?</label>
                <textarea
                  rows={2}
                  value={reflectionForm.challenges}
                  onChange={(e) => setReflectionForm({ ...reflectionForm, challenges: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  placeholder="Describe operational hurdles or delays..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">3. What did you learn or improve?</label>
                <textarea
                  rows={2}
                  value={reflectionForm.learnings}
                  onChange={(e) => setReflectionForm({ ...reflectionForm, learnings: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  placeholder="Key takeaways or skills exercised..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">4. What is your immediate next step?</label>
                <textarea
                  rows={2}
                  value={reflectionForm.nextSteps}
                  onChange={(e) => setReflectionForm({ ...reflectionForm, nextSteps: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  placeholder="Goals for tomorrow or upcoming week..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowReflectionModal(false)}
                  className="px-4 py-2 border text-gray-600 rounded-lg text-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 text-white rounded-lg text-sm font-semibold hover:bg-emerald-800"
                >
                  Submit Reflection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Set Goal Modal */}
      {showGoalModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Set New Goal</h3>
            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Goal Type</label>
                <select
                  value={newGoal.goalType}
                  onChange={(e) => setNewGoal({ ...newGoal, goalType: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                >
                  <option value="daily">Daily Goal</option>
                  <option value="weekly">Weekly Goal</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Goal Title</label>
                <input
                  type="text"
                  required
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  placeholder="e.g. Conduct daily campus assembly"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Description / Expected Outcome</label>
                <textarea
                  rows={2}
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  placeholder="Detail deliverables and success criteria..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Priority</label>
                  <select
                    value={newGoal.priority}
                    onChange={(e) => setNewGoal({ ...newGoal, priority: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={newGoal.dueDate}
                    onChange={(e) => setNewGoal({ ...newGoal, dueDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowGoalModal(false)}
                  className="px-4 py-2 border text-gray-600 rounded-lg text-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 text-white rounded-lg text-sm font-semibold hover:bg-emerald-800"
                >
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
