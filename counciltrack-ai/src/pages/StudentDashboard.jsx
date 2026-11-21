import { useState, useEffect } from "react";
import { councilApi, goalApi, meetingApi, feedbackApi } from "../services/api";
import { Building2, Target, Calendar, MessageSquare, Star, Send, CheckCircle2, Award, Clock } from "lucide-react";

const FEEDBACK_CATEGORIES = [
  "Communication",
  "Support",
  "Engagement",
  "Problem Resolution",
  "Overall Experience",
];

export default function StudentDashboard() {
  const [councils, setCouncils] = useState([]);
  const [goals, setGoals] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [myFeedback, setMyFeedback] = useState([]);
  const [loading, setLoading] = useState(true);

  // Feedback Submission Form State
  const [feedbackForm, setFeedbackForm] = useState({
    councilId: "",
    category: "Communication",
    rating: 5,
    comments: "",
    suggestions: "",
  });
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [cRes, gRes, mRes, fRes] = await Promise.all([
        councilApi.getAll(),
        goalApi.getAll(),
        meetingApi.getAll(),
        feedbackApi.getAll(),
      ]);
      setCouncils(cRes.data.data || []);
      setGoals(gRes.data.data || []);
      setMeetings(mRes.data.data || []);
      setMyFeedback(fRes.data.data || []);
      if (cRes.data.data?.length && !feedbackForm.councilId) {
        setFeedbackForm((prev) => ({ ...prev, councilId: cRes.data.data[0].councilId }));
      }
    } catch (err) {
      console.error("Failed to load student dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    try {
      await feedbackApi.submit(feedbackForm);
      setFeedbackSuccess(true);
      setFeedbackForm({
        councilId: councils[0]?.councilId || "",
        category: "Communication",
        rating: 5,
        comments: "",
        suggestions: "",
      });
      loadData();
      setTimeout(() => setFeedbackSuccess(false), 4000);
    } catch (err) {
      alert(err.response?.data?.error || "Failed to submit feedback");
    }
  };

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
      <div className="bg-gradient-to-r from-amber-700 via-orange-800 to-amber-900 text-white p-6 rounded-2xl shadow-lg">
        <div className="flex items-center gap-2 text-amber-200 text-sm font-semibold uppercase tracking-wider mb-1">
          🎓 Student Transparency Portal
        </div>
        <h1 className="text-3xl font-bold">Campus Councils & Public Goal Progress</h1>
        <p className="text-amber-100 text-sm mt-1">Explore council initiatives, track milestone achievements, and share your monthly feedback to shape campus leadership.</p>
      </div>

      {/* Campus Councils Grid */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Building2 size={22} className="text-amber-600" /> Active Student Councils
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {councils.map((c) => (
            <div key={c.councilId} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 bg-amber-50 text-amber-800 rounded-full">
                  Council
                </span>
                <span className="text-xs text-gray-500 font-medium">
                  {c.members?.length || 0} Members
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{c.councilName}</h3>
              <p className="text-xs text-gray-600 leading-relaxed mb-4">{c.description || "Active campus council."}</p>

              <div className="pt-3 border-t border-gray-100">
                <p className="text-[11px] font-bold uppercase text-gray-400 tracking-wider mb-1">Assigned Members</p>
                <div className="flex flex-wrap gap-1.5">
                  {c.members?.length ? (
                    c.members.map((m) => (
                      <span key={m.userId} className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full font-medium">
                        {m.name}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-gray-400">No members assigned yet</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Public Council Goals & Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Target size={20} className="text-emerald-600" /> Council Goals & Current Status
            </h2>
            <span className="text-xs text-gray-500 font-medium">{completedGoals.length} completed out of {goals.length}</span>
          </div>

          <div className="space-y-4">
            {goals.map((g) => (
              <div key={g.goalId} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-[11px] font-bold text-emerald-800 uppercase bg-emerald-50 px-2 py-0.5 rounded">
                      {g.councilName}
                    </span>
                    <h4 className="font-bold text-gray-900 mt-1">{g.title}</h4>
                    <p className="text-xs text-gray-500">{g.description}</p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                    g.status === "Completed" ? "bg-emerald-100 text-emerald-800" :
                    g.status === "In Progress" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-700"
                  }`}>
                    {g.status}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div className="bg-emerald-600 h-2 rounded-full" style={{ width: `${g.percentage || 0}%` }} />
                </div>
                <div className="flex justify-between items-center text-xs text-gray-500 mt-1.5">
                  <span>Progress: {g.percentage || 0}%</span>
                  <span className="flex items-center gap-1"><Clock size={11} /> Target: {g.dueDate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Public Meetings & Announcements */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar size={20} className="text-indigo-600" /> Public Meetings & Notices
          </h2>
          {meetings.length === 0 ? (
            <p className="text-xs text-gray-400 py-8 text-center">No meetings scheduled.</p>
          ) : (
            <div className="space-y-3">
              {meetings.map((m) => (
                <div key={m.meetingId} className="p-3.5 rounded-xl border border-indigo-100 bg-indigo-50/30">
                  <h4 className="font-bold text-sm text-gray-900">{m.title}</h4>
                  <p className="text-xs text-gray-500 mt-0.5">{m.description}</p>
                  <div className="text-xs text-indigo-700 font-semibold mt-2">
                    {m.meetingDate} at {m.meetingTime} • {m.councilName}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Monthly Student Feedback Section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-6">
            <div className="inline-flex p-3 bg-amber-50 text-amber-700 rounded-2xl mb-2">
              <MessageSquare size={28} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Submit Monthly Council Feedback</h2>
            <p className="text-xs text-gray-500 mt-1">
              Your voice is essential. Your feedback directly shapes monthly council evaluations and leadership development.
            </p>
          </div>

          {feedbackSuccess && (
            <div className="mb-4 p-3.5 bg-green-50 border border-green-200 text-green-800 text-sm rounded-xl text-center font-medium">
              🎉 Thank you! Your feedback has been recorded and submitted to the council.
            </div>
          )}

          <form onSubmit={handleSubmitFeedback} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Select Council</label>
                <select
                  value={feedbackForm.councilId}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, councilId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  required
                >
                  {councils.map((c) => (
                    <option key={c.councilId} value={c.councilId}>{c.councilName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Feedback Category</label>
                <select
                  value={feedbackForm.category}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, category: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                >
                  {FEEDBACK_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Rating (1 to 5 Stars)</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFeedbackForm({ ...feedbackForm, rating: star })}
                    className={`p-2.5 rounded-xl border flex items-center justify-center gap-1 text-sm font-bold transition ${
                      feedbackForm.rating >= star
                        ? "bg-amber-100 border-amber-300 text-amber-800"
                        : "bg-gray-50 border-gray-200 text-gray-400"
                    }`}
                  >
                    <Star size={16} className={feedbackForm.rating >= star ? "fill-amber-500 text-amber-500" : ""} />
                    {star}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Written Feedback & Experiences</label>
              <textarea
                rows={3}
                required
                value={feedbackForm.comments}
                onChange={(e) => setFeedbackForm({ ...feedbackForm, comments: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm"
                placeholder="Share your experience with this council's initiatives and support this month..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Suggestions for Improvement</label>
              <textarea
                rows={2}
                value={feedbackForm.suggestions}
                onChange={(e) => setFeedbackForm({ ...feedbackForm, suggestions: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm"
                placeholder="Specific ideas or changes you recommend..."
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-amber-700 hover:bg-amber-800 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition shadow"
            >
              <Send size={16} /> Submit Council Feedback
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
