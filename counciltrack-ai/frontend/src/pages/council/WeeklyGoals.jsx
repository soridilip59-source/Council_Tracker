import { useState, useEffect } from "react";
import { weeklyGoalApi, councilApi } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { Calendar, Target, Edit2, Trash2, Plus, CheckCircle, Users, CheckCircle2, Clock, Sparkles } from "lucide-react";

export default function WeeklyGoals() {
  const { user } = useAuth();
  const [weeklyGoal, setWeeklyGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [assignedToName, setAssignedToName] = useState("Joint / Both Coordinators");
  const [councilMembers, setCouncilMembers] = useState(user?.members || []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Calculate current week Monday-Sunday
  const getWeekRange = () => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now);
    monday.setDate(diff);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return {
      weekStart: monday.toISOString().split("T")[0],
      weekEnd: sunday.toISOString().split("T")[0],
    };
  };

  const { weekStart, weekEnd } = getWeekRange();

  useEffect(() => {
    loadWeeklyGoal();
    if (user?.councilId && (!councilMembers || councilMembers.length === 0)) {
      councilApi.getById(user.councilId).then((res) => {
        if (res.data?.data?.members) {
          setCouncilMembers(res.data.data.members);
        }
      }).catch(console.error);
    }
  }, []);

  const loadWeeklyGoal = async () => {
    setLoading(true);
    try {
      const res = await weeklyGoalApi.getMy({ weekStart });
      const goals = res.data.data || [];
      const current = goals.find((g) => g.weekStart === weekStart) || goals[0] || null;
      setWeeklyGoal(current);
      if (current) {
        setTitle(current.title);
        setDescription(current.description || "");
        setStatus(current.status || "ACTIVE");
        setAssignedToName(current.assignedToName || "Joint / Both Coordinators");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) { setError("Title is required"); return; }
    setError("");
    setSaving(true);
    try {
      await weeklyGoalApi.create({
        title,
        description,
        weekStart,
        weekEnd,
        status,
        assignedToName,
      });
      await loadWeeklyGoal();
      setEditing(false);
    } catch (e) {
      setError("Failed to save weekly goal");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!weeklyGoal) return;
    const newStatus = weeklyGoal.status === "COMPLETED" ? "ACTIVE" : "COMPLETED";
    try {
      await weeklyGoalApi.create({
        title: weeklyGoal.title,
        description: weeklyGoal.description,
        weekStart: weeklyGoal.weekStart,
        weekEnd: weeklyGoal.weekEnd,
        status: newStatus,
        assignedToName: weeklyGoal.assignedToName,
      });
      await loadWeeklyGoal();
    } catch (e) {
      console.error("Failed to toggle status:", e);
    }
  };

  const handleDelete = async () => {
    if (!weeklyGoal || !confirm("Delete this weekly goal?")) return;
    try {
      await weeklyGoalApi.delete(weeklyGoal.weeklyGoalId);
      setWeeklyGoal(null);
      setTitle("");
      setDescription("");
      setStatus("ACTIVE");
      setEditing(true);
    } catch (e) {
      setError("Failed to delete");
    }
  };

  const weekLabel = `${weekStart} to ${weekEnd}`;
  const members = councilMembers.length > 0 ? councilMembers : (user?.members || []);

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-purple-100 rounded-2xl text-purple-700">
          <Calendar size={28} />
        </div>
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-purple-50 border border-purple-200 text-purple-800 text-[11px] font-bold uppercase tracking-wider mb-1">
            <span>📅 Weekly Goals Section (Hafte me Ek Baar)</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Weekly Council Goals</h1>
          <p className="text-xs text-slate-500">
            Active Week: <strong className="text-purple-700">{weekLabel}</strong> • Hafte ka main focus set karein jo Discord par broadcast hoga.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading...</div>
      ) : !weeklyGoal && !editing ? (
        <div className="text-center py-16 bg-indigo-50 rounded-2xl border border-indigo-100">
          <Target size={48} className="mx-auto text-indigo-300 mb-4" />
          <h3 className="font-semibold text-slate-700 mb-2">No weekly goal set for this week</h3>
          <p className="text-sm text-slate-500 mb-6">Share your council's main focus for the week</p>
          <button
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition"
          >
            <Plus size={16} /> Set Weekly Goal
          </button>
        </div>
      ) : editing || !weeklyGoal ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h2 className="font-semibold text-slate-800">{weeklyGoal ? "Edit" : "Set"} Weekly Goal</h2>
          {error && <p className="text-rose-600 text-sm">{error}</p>}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
              Goal Title *
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Complete 3 vocabulary sessions this week"
              className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
              Description / Plan
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Describe what you plan to achieve or how..."
              className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
              Lead / Assigned Coordinator
            </label>
            <select
              value={assignedToName}
              onChange={(e) => setAssignedToName(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="Joint / Both Coordinators">👥 Joint / Both Coordinators</option>
              {members.map((m, i) => (
                <option key={i} value={m.name}>
                  👤 {m.name} {m.position ? `(${m.position})` : ""}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400 mt-1">
              Dono coordinators milkar ye weekly goal establish kar rahe hain.
            </p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="ACTIVE">⚡ ACTIVE (In Progress)</option>
              <option value="COMPLETED">✓ COMPLETED (Achieved)</option>
            </select>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Weekly Goal"}
            </button>
            {weeklyGoal && (
              <button
                onClick={() => setEditing(false)}
                className="px-4 py-2.5 border border-slate-300 rounded-xl text-slate-600 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-indigo-200/90 shadow-xs p-6 space-y-4 hover:shadow-md transition">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                weeklyGoal.status === "COMPLETED"
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                  : "bg-purple-50 text-purple-700 border border-purple-200"
              }`}>
                {weeklyGoal.status === "COMPLETED" ? <CheckCircle2 size={13} /> : <Clock size={13} />}
                <span>{weeklyGoal.status === "COMPLETED" ? "Completed Goal" : "Active Weekly Focus"}</span>
              </span>
              {weeklyGoal.assignedToName && (
                <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  <Users size={12} className="text-slate-500" />
                  <span>{weeklyGoal.assignedToName}</span>
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleToggleStatus}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  weeklyGoal.status === "COMPLETED"
                    ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white"
                }`}
                title="Toggle completion status"
              >
                {weeklyGoal.status === "COMPLETED" ? "Mark Incomplete" : "Mark as Completed"}
              </button>
              <button
                onClick={() => setEditing(true)}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-indigo-600 transition"
                title="Edit weekly goal"
              >
                <Edit2 size={15} />
              </button>
              <button
                onClick={handleDelete}
                className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-500 hover:text-rose-600 transition"
                title="Delete weekly goal"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>

          <h2 className="text-xl font-bold text-slate-900 leading-snug">{weeklyGoal.title}</h2>
          {weeklyGoal.description && (
            <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{weeklyGoal.description}</p>
          )}

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>🏛️ Council: <strong>{user?.councilName}</strong></span>
            <span>📅 Week: {weekLabel}</span>
          </div>
        </div>
      )}
    </div>
  );
}
