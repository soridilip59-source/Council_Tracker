import { useState, useEffect } from "react";
import { weeklyGoalApi } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { Calendar, Target, Edit2, Trash2, Plus, CheckCircle } from "lucide-react";

export default function WeeklyGoals() {
  const { user } = useAuth();
  const [weeklyGoal, setWeeklyGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
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
      await weeklyGoalApi.create({ title, description, weekStart, weekEnd, status: "ACTIVE" });
      await loadWeeklyGoal();
      setEditing(false);
    } catch (e) {
      setError("Failed to save weekly goal");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!weeklyGoal || !confirm("Delete this weekly goal?")) return;
    try {
      await weeklyGoalApi.delete(weeklyGoal.weeklyGoalId);
      setWeeklyGoal(null);
      setTitle("");
      setDescription("");
      setEditing(true);
    } catch (e) {
      setError("Failed to delete");
    }
  };

  const weekLabel = `${weekStart} to ${weekEnd}`;

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
        <div className="bg-white rounded-2xl border border-indigo-200 shadow-sm p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="text-emerald-500" size={20} />
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                This Week's Goal Set
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setEditing(true)}
                className="p-2 hover:bg-slate-100 rounded-lg transition"
              >
                <Edit2 size={16} className="text-slate-500" />
              </button>
              <button
                onClick={handleDelete}
                className="p-2 hover:bg-rose-50 rounded-lg transition"
              >
                <Trash2 size={16} className="text-rose-500" />
              </button>
            </div>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">{weeklyGoal.title}</h2>
          {weeklyGoal.description && (
            <p className="text-slate-600 text-sm leading-relaxed">{weeklyGoal.description}</p>
          )}
          <p className="text-xs text-slate-400 mt-4">Set by: {user?.name || user?.councilName}</p>
        </div>
      )}
    </div>
  );
}
