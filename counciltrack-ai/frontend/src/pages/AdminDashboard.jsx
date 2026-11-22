import { useState, useEffect } from "react";
import { councilApi, goalApi, reflectionApi, feedbackApi, meetingApi, reportApi } from "../services/api";
import { Building2, Target, CheckCircle2, MessageSquare, Calendar, Award, Plus, Clock } from "lucide-react";

export default function AdminDashboard() {
  const [councils, setCouncils] = useState([]);
  const [goals, setGoals] = useState([]);
  const [reflections, setReflections] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // Meeting Schedule Modal
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [newMeeting, setNewMeeting] = useState({ title: "", description: "", councilId: "", meetingDate: "", meetingTime: "16:00" });

  const loadData = async () => {
    try {
      setLoading(true);
      const [cRes, gRes, rRes, fRes, mRes, repRes] = await Promise.all([
        councilApi.getAll(),
        goalApi.getAll(),
        reflectionApi.getAll(),
        feedbackApi.getAll(),
        meetingApi.getAll(),
        reportApi.getAll(),
      ]);
      setCouncils(cRes.data.data || []);
      setGoals(gRes.data.data || []);
      setReflections(rRes.data.data || []);
      setFeedback(fRes.data.data || []);
      setMeetings(mRes.data.data || []);
      setReports(repRes.data.data || []);
    } catch (err) {
      console.error("Failed to load admin dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleScheduleMeeting = async (e) => {
    e.preventDefault();
    try {
      await meetingApi.schedule(newMeeting);
      setShowMeetingModal(false);
      setNewMeeting({ title: "", description: "", councilId: "", meetingDate: "", meetingTime: "16:00" });
      loadData();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to schedule meeting");
    }
  };

  const handleApproveReport = async (reportId) => {
    try {
      await reportApi.approve(reportId);
      loadData();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to approve report");
    }
  };

  const completedGoals = goals.filter((g) => g.status === "Completed").length;
  const inProgressGoals = goals.filter((g) => g.status === "In Progress").length;
  const pendingReports = reports.filter((r) => r.status === "Pending");
  const avgRating = feedback.length ? (feedback.reduce((sum, f) => sum + Number(f.rating), 0) / feedback.length).toFixed(1) : "N/A";

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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-blue-900 to-indigo-800 text-white p-6 rounded-2xl shadow-lg">
        <div>
          <div className="flex items-center gap-2 text-blue-200 text-sm font-semibold uppercase tracking-wider mb-1">
            🛡️ Administrative Operations Hub
          </div>
          <h1 className="text-3xl font-bold">Council Operations & Progress</h1>
          <p className="text-blue-200 text-sm mt-1">Monitor council goals, review student feedback, schedule meetings, and validate AI evaluations.</p>
        </div>
        <button
          onClick={() => setShowMeetingModal(true)}
          className="bg-white text-blue-900 hover:bg-blue-50 font-semibold px-4 py-2.5 rounded-xl shadow flex items-center gap-2 text-sm transition"
        >
          <Calendar size={16} /> Schedule Meeting
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Target size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase">Active Goals</p>
            <h3 className="text-2xl font-bold text-gray-900">{inProgressGoals} <span className="text-xs text-gray-400 font-normal">({completedGoals} completed)</span></h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <Award size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase">Reflections Logged</p>
            <h3 className="text-2xl font-bold text-gray-900">{reflections.length}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <MessageSquare size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase">Student Feedback</p>
            <h3 className="text-2xl font-bold text-gray-900">{feedback.length} <span className="text-xs text-emerald-600 font-medium">({avgRating} ★)</span></h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Calendar size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase">Upcoming Meetings</p>
            <h3 className="text-2xl font-bold text-gray-900">{meetings.length}</h3>
          </div>
        </div>
      </div>

      {/* Councils & Active Goals Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Councils Overview */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Building2 size={20} className="text-blue-600" /> Councils & Membership
          </h2>
          <div className="space-y-3">
            {councils.map((c) => {
              const councilGoals = goals.filter((g) => g.councilId === c.councilId);
              const councilCompleted = councilGoals.filter((g) => g.status === "Completed").length;
              const pct = councilGoals.length ? Math.round((councilCompleted / councilGoals.length) * 100) : 0;

              return (
                <div key={c.councilId} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-bold text-gray-900">{c.councilName}</h4>
                      <p className="text-xs text-gray-500">{c.description}</p>
                    </div>
                    <span className="text-xs font-bold px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                      {pct}% Completed
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                    <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex justify-between items-center text-xs text-gray-500 mt-2">
                    <span>{c.members?.length || 0} active members</span>
                    <span>{councilCompleted} / {councilGoals.length} goals done</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Meetings List */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Calendar size={20} className="text-indigo-600" /> Scheduled Meetings & Reminders
            </h2>
          </div>
          {meetings.length === 0 ? (
            <p className="text-sm text-gray-400 py-8 text-center">No upcoming meetings scheduled.</p>
          ) : (
            <div className="space-y-3">
              {meetings.map((m) => (
                <div key={m.meetingId} className="p-4 rounded-xl border border-gray-100 bg-indigo-50/30 flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-gray-900">{m.title}</h4>
                    <p className="text-xs text-gray-500">{m.description || "Council coordination session"}</p>
                    <div className="flex items-center gap-3 text-xs text-indigo-700 font-medium mt-1">
                      <span className="flex items-center gap-1"><Calendar size={12} /> {m.meetingDate}</span>
                      <span className="flex items-center gap-1"><Clock size={12} /> {m.meetingTime}</span>
                      <span>Target: {m.councilName}</span>
                    </div>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                    m.discordStatus === "sent" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
                  }`}>
                    Discord: {m.discordStatus}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Pending Reports Approval Module */}
      {pendingReports.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-amber-900 mb-2 flex items-center gap-2">
            <Award size={20} className="text-amber-700" /> AI Performance Reports Awaiting Your Approval
          </h2>
          <div className="space-y-3">
            {pendingReports.map((r) => (
              <div key={r.reportId} className="bg-white p-4 rounded-xl border border-amber-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h4 className="font-bold text-gray-900">{r.userName} ({r.councilName})</h4>
                  <p className="text-xs text-gray-500">Month: {r.month} • Overall Calculated Score: <span className="font-bold text-blue-700">{r.overallScore} / 100</span></p>
                  <p className="text-xs text-gray-600 mt-1">Goal Score (35%): {r.goalScore}% • Consistency (20%): {r.consistencyScore}% • Reflection (15%): {r.reflectionScore}% • Student Feedback (20%): {r.feedbackScore}%</p>
                </div>
                <button
                  onClick={() => handleApproveReport(r.reportId)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow transition"
                >
                  ✓ Approve Report
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Schedule Meeting Modal */}
      {showMeetingModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Schedule Council Meeting</h3>
            <form onSubmit={handleScheduleMeeting} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Meeting Title</label>
                <input
                  type="text"
                  required
                  value={newMeeting.title}
                  onChange={(e) => setNewMeeting({ ...newMeeting, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  placeholder="e.g. Weekly Coordination & Review"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Agenda / Description</label>
                <textarea
                  rows={2}
                  value={newMeeting.description}
                  onChange={(e) => setNewMeeting({ ...newMeeting, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  placeholder="Key topics to discuss..."
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Relevant Council</label>
                <select
                  value={newMeeting.councilId}
                  onChange={(e) => setNewMeeting({ ...newMeeting, councilId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                >
                  <option value="">All Councils</option>
                  {councils.map((c) => (
                    <option key={c.councilId} value={c.councilId}>{c.councilName}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={newMeeting.meetingDate}
                    onChange={(e) => setNewMeeting({ ...newMeeting, meetingDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Time</label>
                  <input
                    type="time"
                    required
                    value={newMeeting.meetingTime}
                    onChange={(e) => setNewMeeting({ ...newMeeting, meetingTime: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowMeetingModal(false)}
                  className="px-4 py-2 border text-gray-600 rounded-lg text-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-700 text-white rounded-lg text-sm font-semibold hover:bg-blue-800"
                >
                  Schedule & Notify Discord
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
