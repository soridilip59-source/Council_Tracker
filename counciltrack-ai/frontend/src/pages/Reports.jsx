import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { reportApi, userApi } from "../services/api";
import { Award, Sparkles, CheckCircle2, Clock, Lock, Plus, ArrowRight, TrendingUp } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";

export default function Reports() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [councilMembers, setCouncilMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Generate Report Modal
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generateForm, setGenerateForm] = useState({
    userId: "",
    month: new Date().toISOString().slice(0, 7), // "YYYY-MM"
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const loadReports = async () => {
    try {
      setLoading(true);
      const res = await reportApi.getAll();
      setReports(res.data.data || []);

      if (["super_admin", "admin"].includes(user?.role)) {
        const uRes = await userApi.getAll({ role: "council_member" });
        setCouncilMembers(uRes.data.data || []);
        if (uRes.data.data?.length && !generateForm.userId) {
          setGenerateForm((prev) => ({ ...prev, userId: uRes.data.data[0].userId }));
        }
      }
    } catch (err) {
      console.error("Failed to load reports:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      await reportApi.generate(generateForm);
      setShowGenerateModal(false);
      loadReports();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to generate AI report");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await reportApi.approve(id);
      loadReports();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to approve report");
    }
  };

  if (user?.role === "student") {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-red-50 border border-red-200 rounded-2xl text-center">
        <Lock size={40} className="mx-auto text-red-600 mb-3" />
        <h2 className="text-xl font-bold text-red-900 mb-1">Access Restricted</h2>
        <p className="text-xs text-red-700">Confidential AI performance reports are restricted to council members and administrators.</p>
      </div>
    );
  }

  const canGenerate = ["super_admin", "admin"].includes(user?.role);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-indigo-950 text-white p-6 rounded-2xl shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-300 text-sm font-semibold uppercase tracking-wider mb-1">
            <Sparkles size={16} /> Evidence-Based Performance Intelligence
          </div>
          <h1 className="text-3xl font-bold">Monthly Council Performance Reports</h1>
          <p className="text-emerald-100 text-sm mt-1">
            AI-synthesized evaluations combining goals (35%), consistency (20%), reflection depth (15%), and student feedback (20%).
          </p>
        </div>
        {canGenerate && (
          <button
            onClick={() => setShowGenerateModal(true)}
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-4 py-2.5 rounded-xl shadow flex items-center gap-2 text-sm transition"
          >
            <Plus size={16} /> Run Monthly Evaluation
          </button>
        )}
      </div>

      {/* Reports Feed */}
      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-gray-100 shadow-sm">
          <Award size={40} className="mx-auto text-gray-300 mb-2" />
          <h3 className="text-gray-700 font-bold">No AI performance reports available</h3>
          <p className="text-xs text-gray-400 mt-1">Evaluations will appear once generated or approved by admins.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {reports.map((r) => {
            const chartData = [
              { name: "Goals", score: r.goalScore, weight: "35%" },
              { name: "Consistency", score: r.consistencyScore, weight: "20%" },
              { name: "Reflection", score: r.reflectionScore, weight: "15%" },
              { name: "Feedback", score: r.feedbackScore, weight: "20%" },
              { name: "Improvement", score: r.improvementScore, weight: "10%" },
            ];

            return (
              <div key={r.reportId} className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6 space-y-6">
                {/* Header of Report */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-gray-100 pb-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                      {r.councilName}
                    </span>
                    <h3 className="text-xl font-bold text-gray-900 mt-1">{r.userName}</h3>
                    <p className="text-xs text-gray-500">Evaluation Month: {r.month} • Generated: {new Date(r.generatedAt).toLocaleDateString()}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-xs text-gray-400 uppercase font-semibold">Overall Performance</span>
                      <div className="text-3xl font-black text-emerald-700">{r.overallScore} <span className="text-sm font-normal text-gray-500">/ 100</span></div>
                    </div>

                    <span className={`text-xs px-3 py-1 rounded-full font-bold ${
                      r.status === "Approved" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
                    }`}>
                      {r.status}
                    </span>

                    {r.status === "Pending" && canGenerate && (
                      <button
                        onClick={() => handleApprove(r.reportId)}
                        className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow transition"
                      >
                        ✓ Approve Report
                      </button>
                    )}
                  </div>
                </div>

                {/* Score Breakdown Chart & Badges */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <div className="h-44">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Bar dataKey="score" fill="#059669" radius={[4, 4, 0, 0]}>
                          {chartData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={["#059669", "#2563eb", "#7c3aed", "#d97706", "#0284c7"][index % 5]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                      <span className="text-gray-500 block">Goal Achievement (35%)</span>
                      <span className="text-base font-bold text-gray-900">{r.goalScore}%</span>
                    </div>
                    <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                      <span className="text-gray-500 block">Consistency (20%)</span>
                      <span className="text-base font-bold text-gray-900">{r.consistencyScore}%</span>
                    </div>
                    <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                      <span className="text-gray-500 block">Reflection Depth (15%)</span>
                      <span className="text-base font-bold text-gray-900">{r.reflectionScore}%</span>
                    </div>
                    <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                      <span className="text-gray-500 block">Student Feedback (20%)</span>
                      <span className="text-base font-bold text-gray-900">{r.feedbackScore}%</span>
                    </div>
                    <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100 col-span-2">
                      <span className="text-gray-500 block">Improvement & Initiative (10%)</span>
                      <span className="text-base font-bold text-gray-900">{r.improvementScore}%</span>
                    </div>
                  </div>
                </div>

                {/* Qualitative Insights */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-4 border-t border-gray-100">
                  <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-100">
                    <h4 className="font-bold text-emerald-950 mb-2">💪 Demonstrated Strengths</h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      {r.strengths?.map((s, idx) => <li key={idx}>{s}</li>)}
                    </ul>
                  </div>

                  <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-100">
                    <h4 className="font-bold text-amber-950 mb-2">📈 Improvement Areas</h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      {r.weaknesses?.map((w, idx) => <li key={idx}>{w}</li>)}
                    </ul>
                  </div>

                  <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-100">
                    <h4 className="font-bold text-blue-950 mb-2">💡 Actionable Recommendations</h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      {r.recommendations?.map((rec, idx) => <li key={idx}>{rec}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Generate AI Report Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-1">Generate Monthly AI Evaluation</h3>
            <p className="text-xs text-gray-500 mb-4">Calculates 5-factor scoring and synthesizes qualitative feedback.</p>

            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Select Council Member</label>
                <select
                  value={generateForm.userId}
                  onChange={(e) => setGenerateForm({ ...generateForm, userId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                  required
                >
                  {councilMembers.map((m) => (
                    <option key={m.userId} value={m.userId}>{m.name} ({m.email})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Evaluation Month</label>
                <input
                  type="month"
                  required
                  value={generateForm.month}
                  onChange={(e) => setGenerateForm({ ...generateForm, month: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  className="px-4 py-2 border text-gray-600 rounded-lg text-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="px-4 py-2 bg-emerald-700 text-white rounded-lg text-sm font-semibold hover:bg-emerald-800 disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isGenerating ? "Analyzing..." : "Generate Evaluation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
