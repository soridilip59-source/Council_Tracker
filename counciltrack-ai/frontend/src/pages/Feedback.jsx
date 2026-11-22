import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { feedbackApi, councilApi } from "../services/api";
import { MessageSquare, Star, Send, Building2, Filter, Award } from "lucide-react";

const CATEGORIES = [
  "Communication",
  "Support",
  "Engagement",
  "Problem Resolution",
  "Overall Experience",
];

export default function Feedback() {
  const { user } = useAuth();
  const [feedbackList, setFeedbackList] = useState([]);
  const [councils, setCouncils] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [form, setForm] = useState({
    councilId: "",
    category: "Communication",
    rating: 5,
    comments: "",
    suggestions: "",
  });
  const [success, setSuccess] = useState(false);

  const loadFeedback = async () => {
    try {
      setLoading(true);
      const [fRes, cRes] = await Promise.all([
        feedbackApi.getAll(),
        councilApi.getAll(),
      ]);
      setFeedbackList(fRes.data.data || []);
      setCouncils(cRes.data.data || []);
      if (cRes.data.data?.length && !form.councilId) {
        setForm((prev) => ({ ...prev, councilId: cRes.data.data[0].councilId }));
      }
    } catch (err) {
      console.error("Failed to load feedback:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeedback();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await feedbackApi.submit(form);
      setSuccess(true);
      setForm({
        councilId: councils[0]?.councilId || "",
        category: "Communication",
        rating: 5,
        comments: "",
        suggestions: "",
      });
      loadFeedback();
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      alert(err.response?.data?.error || "Failed to submit feedback");
    }
  };

  const isStudent = user?.role === "student";

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="text-green-700" /> Student Feedback & Council Reviews
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Monthly student feedback provides direct evidence for council evaluation, accountability, and AI performance analysis.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Feedback Submission Form (Visible to Students & Admins) */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2 text-green-800 font-bold text-sm uppercase tracking-wider mb-2">
            <Send size={16} /> Submit Monthly Feedback
          </div>

          {success && (
            <div className="p-3 bg-green-50 border border-green-200 text-green-800 text-xs rounded-xl font-medium">
              🎉 Thank you! Your feedback has been securely stored.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Target Council</label>
              <select
                value={form.councilId}
                onChange={(e) => setForm({ ...form, councilId: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                required
              >
                {councils.map((c) => (
                  <option key={c.councilId} value={c.councilId}>{c.councilName}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Rating</label>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setForm({ ...form, rating: star })}
                    className={`flex-1 py-2 rounded-lg border text-xs font-bold transition flex items-center justify-center gap-1 ${
                      form.rating >= star
                        ? "bg-amber-100 border-amber-300 text-amber-800"
                        : "bg-gray-50 border-gray-200 text-gray-400"
                    }`}
                  >
                    <Star size={14} className={form.rating >= star ? "fill-amber-500 text-amber-500" : ""} />
                    {star}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Comments & Observations</label>
              <textarea
                rows={3}
                required
                value={form.comments}
                onChange={(e) => setForm({ ...form, comments: e.target.value })}
                placeholder="Share your positive or constructive experience..."
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Suggestions</label>
              <textarea
                rows={2}
                value={form.suggestions}
                onChange={(e) => setForm({ ...form, suggestions: e.target.value })}
                placeholder="Concrete improvements you'd like to see..."
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-green-700 hover:bg-green-800 text-white font-semibold rounded-xl text-sm transition shadow"
            >
              Submit Feedback
            </button>
          </form>
        </div>

        {/* Right Column: Submitted Feedback Feed */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Award size={20} className="text-amber-600" />
              {isStudent ? "My Submitted Feedback" : "Council Feedback Repository"}
            </h2>
            <span className="text-xs text-gray-500">{feedbackList.length} submissions</span>
          </div>

          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-600 border-t-transparent" />
            </div>
          ) : feedbackList.length === 0 ? (
            <p className="text-xs text-gray-400 py-12 text-center">No feedback submitted for this filter.</p>
          ) : (
            <div className="space-y-4">
              {feedbackList.map((f) => (
                <div key={f.feedbackId} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-bold text-green-800 bg-green-100/70 px-2 py-0.5 rounded">
                        {f.councilName}
                      </span>
                      <span className="text-xs text-gray-500 ml-2 font-medium">Category: {f.category}</span>
                    </div>
                    <div className="flex items-center gap-1 text-amber-600 font-bold text-xs bg-amber-50 px-2 py-0.5 rounded-full">
                      <Star size={12} className="fill-amber-500" /> {f.rating} / 5
                    </div>
                  </div>

                  <p className="text-xs text-gray-700 leading-relaxed">{f.comments}</p>

                  {f.suggestions && (
                    <div className="bg-white p-2.5 rounded-lg border border-gray-100 text-xs text-gray-600">
                      <strong className="text-gray-800">Suggestion:</strong> {f.suggestions}
                    </div>
                  )}

                  <div className="text-[11px] text-gray-400 text-right">
                    Submitted: {new Date(f.submittedAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
