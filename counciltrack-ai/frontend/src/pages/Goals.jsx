import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { goalApi, progressApi, councilApi } from "../services/api";
import { Target, Plus, CheckCircle2, Clock, AlertTriangle, ArrowRight, X, Calendar, Filter } from "lucide-react";

export default function Goals() {
  const { user } = useAuth();
  const [goals, setGoals] = useState([]);
  const [councils, setCouncils] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [councilFilter, setCouncilFilter] = useState("all");

  // Create Goal Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    goalType: "daily",
    priority: "Medium",
    startDate: new Date().toISOString().slice(0, 10),
    dueDate: new Date().toISOString().slice(0, 10),
    councilId: user?.councilId || "",
  });

  // Progress Update Modal
  const [activeGoal, setActiveGoal] = useState(null);
  const [progressHistory, setProgressHistory] = useState([]);
  const [progressForm, setProgressForm] = useState({ percentage: 50, updateNote: "" });

  const loadGoals = async () => {
    try {
      setLoading(true);
      const [gRes, cRes] = await Promise.all([
        goalApi.getAll(),
        councilApi.getAll(),
      ]);
      setGoals(gRes.data.data || []);
      setCouncils(cRes.data.data || []);
    } catch (err) {
      console.error("Failed to load goals:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGoals();
  }, []);

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    try {
      await goalApi.create(newGoal);
      setShowCreateModal(false);
      setNewGoal({
        title: "",
        description: "",
        goalType: "daily",
        priority: "Medium",
        startDate: new Date().toISOString().slice(0, 10),
        dueDate: new Date().toISOString().slice(0, 10),
        councilId: user?.councilId || "",
      });
      loadGoals();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to create goal");
    }
  };

  const openProgressModal = async (goal) => {
    setActiveGoal(goal);
    setProgressForm({ percentage: goal.percentage || 50, updateNote: "" });
    try {
      const res = await progressApi.getHistory(goal.goalId);
      setProgressHistory(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveProgress = async (e) => {
    e.preventDefault();
    try {
      await progressApi.add({
        goalId: activeGoal.goalId,
        percentage: Number(progressForm.percentage),
        updateNote: progressForm.updateNote,
      });
      // Refresh history
      const res = await progressApi.getHistory(activeGoal.goalId);
      setProgressHistory(res.data.data || []);
      setProgressForm({ percentage: Number(progressForm.percentage), updateNote: "" });
      loadGoals();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to add progress");
    }
  };

  const canCreateGoal = ["super_admin", "admin", "council_member"].includes(user?.role);

  const filteredGoals = goals.filter((g) => {
    if (typeFilter !== "all" && g.goalType !== typeFilter) return false;
    if (statusFilter !== "all" && g.status !== statusFilter) return false;
    if (councilFilter !== "all" && g.councilId !== councilFilter) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Target className="text-green-700" /> Council Goals & Action Plan
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage daily objectives and strategic weekly milestones with immutable progress tracking.</p>
        </div>
        {canCreateGoal && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-green-700 hover:bg-green-800 text-white font-semibold px-4 py-2.5 rounded-xl shadow flex items-center gap-2 text-sm transition"
          >
            <Plus size={16} /> New Goal
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          <Filter size={14} /> Filter By:
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="text-xs px-3 py-2 border rounded-lg bg-gray-50 text-gray-700"
        >
          <option value="all">All Goal Types</option>
          <option value="daily">Daily Goals Only</option>
          <option value="weekly">Weekly Goals Only</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-xs px-3 py-2 border rounded-lg bg-gray-50 text-gray-700"
        >
          <option value="all">All Statuses</option>
          <option value="Not Started">Not Started</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
          <option value="Blocked">Blocked</option>
        </select>

        <select
          value={councilFilter}
          onChange={(e) => setCouncilFilter(e.target.value)}
          className="text-xs px-3 py-2 border rounded-lg bg-gray-50 text-gray-700"
        >
          <option value="all">All Councils</option>
          {councils.map((c) => (
            <option key={c.councilId} value={c.councilId}>{c.councilName}</option>
          ))}
        </select>
      </div>

      {/* Goals Grid */}
      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-600 border-t-transparent" />
        </div>
      ) : filteredGoals.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-gray-100 shadow-sm">
          <Target size={40} className="mx-auto text-gray-300 mb-2" />
          <h3 className="text-gray-700 font-bold">No goals found</h3>
          <p className="text-xs text-gray-400 mt-1">Adjust filters or create a new daily/weekly goal.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredGoals.map((g) => (
            <div key={g.goalId} className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    g.goalType === "daily" ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"
                  }`}>
                    {g.goalType} Goal
                  </span>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                    g.status === "Completed" ? "bg-emerald-100 text-emerald-800" :
                    g.status === "In Progress" ? "bg-blue-100 text-blue-800" :
                    g.status === "Blocked" ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"
                  }`}>
                    {g.status}
                  </span>
                </div>

                <span className="text-[11px] text-gray-500 font-medium block mb-1">
                  {g.councilName} • Owner: {g.ownerName}
                </span>

                <h3 className="text-base font-bold text-gray-900 mb-1">{g.title}</h3>
                <p className="text-xs text-gray-500 mb-4 line-clamp-2">{g.description || "No description provided."}</p>
              </div>

              <div>
                {/* Progress Bar */}
                <div className="space-y-1 mb-3">
                  <div className="flex justify-between text-xs text-gray-600 font-medium">
                    <span>Progress</span>
                    <span className="font-bold text-green-700">{g.percentage || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full transition-all duration-300" style={{ width: `${g.percentage || 0}%` }} />
                  </div>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-gray-100 text-xs">
                  <span className="text-gray-400 flex items-center gap-1">
                    <Clock size={12} /> Due: {g.dueDate}
                  </span>
                  <button
                    onClick={() => openProgressModal(g)}
                    className="text-green-700 font-bold hover:text-green-900 flex items-center gap-1"
                  >
                    View History & Updates <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Progress History & Update Drawer Modal */}
      {activeGoal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="text-[11px] font-bold text-green-800 uppercase bg-green-50 px-2 py-0.5 rounded">
                  {activeGoal.councilName}
                </span>
                <h3 className="text-lg font-bold text-gray-900 mt-1">{activeGoal.title}</h3>
                <p className="text-xs text-gray-500">Current Progress: <strong className="text-green-700">{activeGoal.percentage}%</strong> • Status: {activeGoal.status}</p>
              </div>
              <button onClick={() => setActiveGoal(null)} className="p-1 hover:bg-gray-100 rounded-lg text-gray-400">
                <X size={20} />
              </button>
            </div>

            {/* Add New Progress Form (if authorized) */}
            {canCreateGoal && (
              <form onSubmit={handleSaveProgress} className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-4 space-y-3">
                <div className="flex justify-between text-xs font-semibold text-gray-700">
                  <span>Log Incremental Progress</span>
                  <span className="text-green-700 font-bold">{progressForm.percentage}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={progressForm.percentage}
                  onChange={(e) => setProgressForm({ ...progressForm, percentage: e.target.value })}
                  className="w-full accent-green-600"
                />
                <textarea
                  rows={2}
                  required
                  value={progressForm.updateNote}
                  onChange={(e) => setProgressForm({ ...progressForm, updateNote: e.target.value })}
                  placeholder="Note what was accomplished in this update..."
                  className="w-full px-3 py-1.5 border rounded-lg text-xs bg-white"
                />
                <button
                  type="submit"
                  className="w-full py-2 bg-green-700 hover:bg-green-800 text-white rounded-lg text-xs font-semibold transition"
                >
                  Append Progress Entry
                </button>
              </form>
            )}

            {/* Progress History List (Immutable Audit Log) */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Immutable Progress History</h4>
              {progressHistory.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4">No progress records logged yet.</p>
              ) : (
                progressHistory.map((p) => (
                  <div key={p.progressId} className="p-3 bg-white border border-gray-100 rounded-xl text-xs space-y-1 shadow-2xs">
                    <div className="flex justify-between items-center text-gray-500">
                      <span className="font-semibold text-gray-800">{p.percentage}% Completion</span>
                      <span>{new Date(p.updatedAt).toLocaleString()}</span>
                    </div>
                    <p className="text-gray-700">{p.updateNote || "Progress checkpoint."}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Goal Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Create Council Goal</h3>
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
                <label className="block text-xs font-semibold text-gray-600 mb-1">Target Council</label>
                <select
                  value={newGoal.councilId}
                  onChange={(e) => setNewGoal({ ...newGoal, councilId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                >
                  <option value="">General Council</option>
                  {councils.map((c) => (
                    <option key={c.councilId} value={c.councilId}>{c.councilName}</option>
                  ))}
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
                  placeholder="e.g. Conduct daily campus attendance check"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Description / Expected Outcome</label>
                <textarea
                  rows={2}
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  placeholder="Key deliverables..."
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
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border text-gray-600 rounded-lg text-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-700 text-white rounded-lg text-sm font-semibold hover:bg-green-800"
                >
                  Create Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
