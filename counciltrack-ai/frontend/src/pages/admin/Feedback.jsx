import { useState, useEffect } from "react";
import { feedbackApi, councilApi } from "../../services/api";
import {
  MessageSquareHeart,
  Copy,
  CheckCircle2,
  AlertCircle,
  Filter,
  Search,
  Lock,
  ExternalLink,
  X,
  Building2,
  Clock,
  ShieldCheck,
  Save,
} from "lucide-react";

export default function Feedback() {
  const [feedbackList, setFeedbackList] = useState([]);
  const [councils, setCouncils] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedCouncil, setSelectedCouncil] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [search, setSearch] = useState("");

  // Copy state
  const [copied, setCopied] = useState(false);

  // Detail Modal
  const [activeItem, setActiveItem] = useState(null);
  const [editStatus, setEditStatus] = useState("NEW");
  const [editNotes, setEditNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const loadData = async () => {
    try {
      const [fRes, cRes] = await Promise.all([feedbackApi.getAll(), councilApi.getAll()]);
      setFeedbackList(fRes.data.data || []);
      setCouncils(cRes.data.data || []);
    } catch (err) {
      console.error("Failed to load feedback:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const copyPublicLink = () => {
    const link = `${window.location.origin}/feedback`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const openDetail = (item) => {
    setActiveItem(item);
    setEditStatus((item.status || "NEW").toUpperCase());
    setEditNotes(item.adminNotes || "");
    setSaveSuccess(false);
  };

  const handleUpdateStatusAndNotes = async (e) => {
    e.preventDefault();
    if (!activeItem) return;

    setSavingNotes(true);
    try {
      await Promise.all([
        feedbackApi.updateStatus(activeItem.feedbackId, editStatus),
        feedbackApi.updateNotes(activeItem.feedbackId, editNotes),
      ]);
      setSaveSuccess(true);
      await loadData();
      // Update local item
      setActiveItem({
        ...activeItem,
        status: editStatus,
        adminNotes: editNotes,
      });
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      alert("Failed to update: " + (err.response?.data?.message || err.message));
    } finally {
      setSavingNotes(false);
    }
  };

  // Metrics
  const totalSubmissions = feedbackList.length;
  const generalCount = feedbackList.filter((f) => (f.feedbackType || "").toUpperCase() === "GENERAL").length;
  const suggestionCount = feedbackList.filter((f) => (f.feedbackType || "").toUpperCase() === "SUGGESTION").length;
  const complaintCount = feedbackList.filter((f) => (f.feedbackType || "").toUpperCase() === "COMPLAINT").length;

  // Filtered List
  const filtered = feedbackList.filter((f) => {
    if (selectedCouncil && f.councilId !== selectedCouncil) return false;
    if (selectedType && (f.feedbackType || "").toUpperCase() !== selectedType.toUpperCase()) return false;
    if (selectedStatus && (f.status || "").toUpperCase() !== selectedStatus.toUpperCase()) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        f.message?.toLowerCase().includes(q) ||
        f.studentName?.toLowerCase().includes(q) ||
        f.contact?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Student Feedback & Complaints</h1>
          <p className="text-xs text-slate-500 mt-1">
            Section Four • Review suggestions, resolve grievances, and maintain confidential administrative notes.
          </p>
        </div>

        {/* Copy Link Button */}
        <button
          onClick={copyPublicLink}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition"
        >
          {copied ? <CheckCircle2 size={16} className="text-emerald-300" /> : <Copy size={16} />}
          <span>{copied ? "Link Copied to Clipboard!" : "Copy Public Feedback Link"}</span>
        </button>
      </div>

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Feedback</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{totalSubmissions}</h3>
            <p className="text-[11px] text-slate-400 mt-1">Across all campus councils</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <MessageSquareHeart size={22} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">General Feedback</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{generalCount}</h3>
            <p className="text-[11px] text-slate-400 mt-1">Reflections on campus life</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Clock size={22} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Suggestions</p>
            <h3 className="text-2xl font-bold text-emerald-600 mt-1">{suggestionCount}</h3>
            <p className="text-[11px] text-slate-400 mt-1">Improvement ideas</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 size={22} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Complaints</p>
            <h3 className="text-2xl font-bold text-rose-600 mt-1">{complaintCount}</h3>
            <p className="text-[11px] text-slate-400 mt-1">Require prompt resolution</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertCircle size={22} />
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search feedback text, student name..."
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600"
          />
        </div>

        <select
          value={selectedCouncil}
          onChange={(e) => setSelectedCouncil(e.target.value)}
          className="px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
        >
          <option value="">All Councils</option>
          {councils.map((c) => (
            <option key={c.councilId} value={c.councilId}>
              {c.councilName}
            </option>
          ))}
        </select>

        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
        >
          <option value="">All Types</option>
          <option value="GENERAL">General Feedback</option>
          <option value="SUGGESTION">Suggestion</option>
          <option value="COMPLAINT">Complaint</option>
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
        >
          <option value="">All Statuses</option>
          <option value="NEW">New</option>
          <option value="UNDER_REVIEW">Under Review</option>
          <option value="RESOLVED">Resolved</option>
        </select>

        {(selectedCouncil || selectedType || selectedStatus || search) && (
          <button
            onClick={() => {
              setSelectedCouncil("");
              setSelectedType("");
              setSelectedStatus("");
              setSearch("");
            }}
            className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
          >
            Reset
          </button>
        )}
      </div>

      {/* Feedback Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Student</th>
                <th className="px-5 py-3">Council</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Message</th>
                <th className="px-5 py-3 text-center">Status</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-500 text-xs">
                    Loading feedback submissions...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-500 text-xs">
                    No student submissions found matching filters.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const typeUpper = (item.feedbackType || "").toUpperCase();
                  const statusUpper = (item.status || "").toUpperCase();

                  return (
                    <tr key={item.feedbackId} className="hover:bg-slate-50/70 transition">
                      <td className="px-5 py-3.5 whitespace-nowrap text-xs text-slate-500">
                        {new Date(item.submittedAt).toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="font-semibold text-slate-900 text-xs">
                          {item.studentName || "Anonymous"}
                        </div>
                        {item.contact && (
                          <div className="text-[10px] text-slate-400 truncate max-w-[120px]">{item.contact}</div>
                        )}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className="text-xs font-medium text-slate-800">{item.councilName}</span>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
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
                      </td>
                      <td className="px-5 py-3.5 max-w-sm">
                        <p className="text-xs text-slate-700 line-clamp-2 leading-relaxed">{item.message}</p>
                      </td>
                      <td className="px-5 py-3.5 text-center whitespace-nowrap">
                        <span
                          className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${
                            statusUpper === "RESOLVED"
                              ? "bg-emerald-100 text-emerald-800"
                              : statusUpper === "UNDER_REVIEW"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {statusUpper.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <button
                          onClick={() => openDetail(item)}
                          className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition"
                        >
                          Review & Notes
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Feedback Detail & Admin Notes Modal */}
      {activeItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg p-6 relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setActiveItem(null)}
              className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                {activeItem.councilName}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-500">
                {new Date(activeItem.submittedAt).toLocaleString("en-IN")}
              </span>
            </div>

            <h2 className="text-lg font-bold text-slate-900">
              {activeItem.feedbackType} from {activeItem.studentName || "Anonymous Student"}
            </h2>

            {activeItem.contact && (
              <p className="text-xs text-slate-500 mt-0.5">Contact: {activeItem.contact}</p>
            )}

            {/* Message Box */}
            <div className="mt-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
              {activeItem.message}
            </div>

            {/* Resolution Form */}
            <form onSubmit={handleUpdateStatusAndNotes} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Complaint / Feedback Status
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
                >
                  <option value="NEW">NEW</option>
                  <option value="UNDER_REVIEW">UNDER REVIEW</option>
                  <option value="RESOLVED">RESOLVED</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Lock size={12} className="text-amber-500" />
                    <span>Private Admin Notes</span>
                  </label>
                  <span className="text-[10px] text-amber-600 font-medium">Confidential (Hidden from council members)</span>
                </div>
                <textarea
                  rows={3}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Record investigation steps, council follow-ups, or resolution notes..."
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 leading-relaxed"
                />
              </div>

              {saveSuccess && (
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-1.5 font-medium">
                  <CheckCircle2 size={15} />
                  <span>Status and admin notes saved successfully!</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveItem(null)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 transition"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={savingNotes}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition disabled:opacity-50"
                >
                  <Save size={14} />
                  <span>{savingNotes ? "Saving..." : "Save Resolution"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
