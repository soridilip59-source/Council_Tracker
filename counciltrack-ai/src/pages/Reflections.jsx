import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { reflectionApi } from "../services/api";
import { Sparkles, Plus, Calendar, ShieldCheck, Lock, AlertCircle, FileText } from "lucide-react";

export default function Reflections() {
  const { user } = useAuth();
  const [reflections, setReflections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [periodFilter, setPeriodFilter] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    periodType: "daily",
    periodStart: new Date().toISOString().slice(0, 10),
    periodEnd: new Date().toISOString().slice(0, 10),
    achievements: "",
    challenges: "",
    learnings: "",
    nextSteps: "",
  });

  const loadReflections = async () => {
    try {
      setLoading(true);
      const res = await reflectionApi.getAll();
      setReflections(res.data.data || []);
    } catch (err) {
      console.error("Failed to load reflections:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReflections();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await reflectionApi.submit(form);
      setShowModal(false);
      setForm({
        periodType: "daily",
        periodStart: new Date().toISOString().slice(0, 10),
        periodEnd: new Date().toISOString().slice(0, 10),
        achievements: "",
        challenges: "",
        learnings: "",
        nextSteps: "",
      });
      loadReflections();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to submit reflection");
    }
  };

  if (user?.role === "student") {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-red-50 border border-red-200 rounded-2xl text-center">
        <Lock size={40} className="mx-auto text-red-600 mb-3" />
        <h2 className="text-xl font-bold text-red-900 mb-1">Access Restricted</h2>
        <p className="text-xs text-red-700">Reflections are private council evaluations and cannot be viewed by students.</p>
      </div>
    );
  }

  const filteredReflections = reflections.filter((r) => {
    if (periodFilter !== "all" && r.periodType !== periodFilter) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-green-700 mb-1">
            <Lock size={13} /> Strictly Confidential & Private
          </div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="text-amber-500" /> Council Reflections Journal
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Document daily evening progress, weekly learning reviews, and personal improvement targets.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-green-700 hover:bg-green-800 text-white font-semibold px-4 py-2.5 rounded-xl shadow flex items-center gap-2 text-sm transition"
        >
          <Plus size={16} /> New Reflection
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setPeriodFilter("all")}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition ${
            periodFilter === "all" ? "bg-green-700 text-white" : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
          }`}
        >
          All Reflections ({reflections.length})
        </button>
        <button
          onClick={() => setPeriodFilter("daily")}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition ${
            periodFilter === "daily" ? "bg-green-700 text-white" : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
          }`}
        >
          Daily Reflections ({reflections.filter((r) => r.periodType === "daily").length})
        </button>
        <button
          onClick={() => setPeriodFilter("weekly")}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition ${
            periodFilter === "weekly" ? "bg-green-700 text-white" : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
          }`}
        >
          Weekly Reflections ({reflections.filter((r) => r.periodType === "weekly").length})
        </button>
      </div>

      {/* Reflections Feed */}
      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-600 border-t-transparent" />
        </div>
      ) : filteredReflections.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-gray-100 shadow-sm">
          <FileText size={40} className="mx-auto text-gray-300 mb-2" />
          <h3 className="text-gray-700 font-bold">No reflections submitted yet</h3>
          <p className="text-xs text-gray-400 mt-1">Submit your daily evening or weekly reflection above.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReflections.map((r) => (
            <div key={r.reflectionId} className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-start border-b border-gray-100 pb-3">
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                    r.periodType === "daily" ? "bg-amber-100 text-amber-800" : "bg-purple-100 text-purple-800"
                  }`}>
                    {r.periodType} Reflection
                  </span>
                  <span className="text-xs text-gray-500 font-medium">
                    By <strong>{r.authorName}</strong> • Submitted: {new Date(r.submittedAt).toLocaleDateString()}
                  </span>
                </div>
                <span className="text-xs text-gray-400">Period: {r.periodStart} to {r.periodEnd}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-green-50/50 p-3.5 rounded-xl border border-green-100">
                  <span className="font-bold text-green-900 block mb-1">🎯 Accomplishments & Goals Completed</span>
                  <p className="text-gray-700 leading-relaxed">{r.achievements}</p>
                </div>

                <div className="bg-amber-50/50 p-3.5 rounded-xl border border-amber-100">
                  <span className="font-bold text-amber-900 block mb-1">⚠️ Challenges & Blockers Encountered</span>
                  <p className="text-gray-700 leading-relaxed">{r.challenges || "None noted."}</p>
                </div>

                <div className="bg-blue-50/50 p-3.5 rounded-xl border border-blue-100">
                  <span className="font-bold text-blue-900 block mb-1">💡 Key Learnings & Improvements</span>
                  <p className="text-gray-700 leading-relaxed">{r.learnings || "Continuous execution."}</p>
                </div>

                <div className="bg-purple-50/50 p-3.5 rounded-xl border border-purple-100">
                  <span className="font-bold text-purple-900 block mb-1">🚀 Immediate Next Steps</span>
                  <p className="text-gray-700 leading-relaxed">{r.nextSteps || "Scheduled next phase."}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Submit Reflection Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-1">Submit Reflection</h3>
            <p className="text-xs text-gray-500 mb-4">Input honest reflections. AI evaluation analyzes qualitative depth and learnings.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Reflection Period</label>
                <select
                  value={form.periodType}
                  onChange={(e) => setForm({ ...form, periodType: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                >
                  <option value="daily">Daily Reflection</option>
                  <option value="weekly">Weekly Reflection</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  {form.periodType === "daily" ? "What did you accomplish today? Which goals completed?" : "What were your key weekly achievements?"}
                </label>
                <textarea
                  rows={2}
                  required
                  value={form.achievements}
                  onChange={(e) => setForm({ ...form, achievements: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  placeholder="Detail completed milestones..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  What challenges or impediments affected your performance?
                </label>
                <textarea
                  rows={2}
                  value={form.challenges}
                  onChange={(e) => setForm({ ...form, challenges: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  placeholder="Explain any blockers or schedule conflicts..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  What did you learn? What will you improve?
                </label>
                <textarea
                  rows={2}
                  value={form.learnings}
                  onChange={(e) => setForm({ ...form, learnings: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  placeholder="Personal takeaways or improved processes..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  What is your immediate next step?
                </label>
                <textarea
                  rows={2}
                  value={form.nextSteps}
                  onChange={(e) => setForm({ ...form, nextSteps: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  placeholder="Action items for the upcoming period..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border text-gray-600 rounded-lg text-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-700 text-white rounded-lg text-sm font-semibold hover:bg-green-800"
                >
                  Save Reflection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
