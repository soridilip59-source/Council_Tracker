import { useState, useEffect } from "react";
import { feedbackApi } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import {
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Clock,
  Building,
  Search,
  Filter,
} from "lucide-react";

export default function CouncilFeedback() {
  const { user } = useAuth();
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadCouncilFeedback() {
      try {
        const res = await feedbackApi.getMyCouncil();
        setFeedbackList(res.data.data || []);
      } catch (err) {
        console.error("Failed to load council feedback:", err);
      } finally {
        setLoading(false);
      }
    }
    loadCouncilFeedback();
  }, []);

  const filtered = feedbackList.filter((item) => {
    if (typeFilter && (item.feedbackType || "").toUpperCase() !== typeFilter.toUpperCase()) return false;
    if (statusFilter && (item.status || "").toUpperCase() !== statusFilter.toUpperCase()) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        item.message?.toLowerCase().includes(q) ||
        item.studentName?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
            {user?.councilName || "Assigned Council"}
          </span>
          <span className="text-slate-300">•</span>
          <span className="text-xs text-slate-500">Student Voices</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Council Feedback & Suggestions</h1>
        <p className="text-xs text-slate-500 mt-1">
          Section 5.6 • Feedback, complaints, and suggestions submitted by campus students for your council.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search feedback message or student..."
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
          >
            <option value="">All Types</option>
            <option value="GENERAL">General Feedback</option>
            <option value="SUGGESTION">Suggestion</option>
            <option value="COMPLAINT">Complaint</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
          >
            <option value="">All Statuses</option>
            <option value="NEW">New</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>
      </div>

      {/* Feedback List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">Loading student feedback...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
            No student feedback or complaints found for your council.
          </div>
        ) : (
          filtered.map((item) => {
            const typeUpper = (item.feedbackType || "").toUpperCase();
            const statusUpper = (item.status || "").toUpperCase();

            return (
              <div
                key={item.feedbackId}
                className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        typeUpper === "COMPLAINT"
                          ? "bg-rose-50 text-rose-700 border border-rose-200"
                          : typeUpper === "SUGGESTION"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-indigo-50 text-indigo-700 border border-indigo-200"
                      }`}
                    >
                      {item.feedbackType}
                    </span>
                    <span className="text-xs font-semibold text-slate-800">
                      From: {item.studentName || "Anonymous Student"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        statusUpper === "RESOLVED"
                          ? "bg-emerald-100 text-emerald-800"
                          : statusUpper === "UNDER_REVIEW"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      Status: {statusUpper.replace("_", " ")}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(item.submittedAt).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed mt-2 whitespace-pre-wrap">
                  {item.message}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
