import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { feedbackApi, councilApi } from "../../services/api";
import ScrollReveal from "../../components/ui/ScrollReveal";
import {
  MessageSquareHeart,
  Send,
  CheckCircle2,
  AlertCircle,
  Building2,
  Sparkles,
  ShieldAlert,
  ArrowLeft,
} from "lucide-react";

export default function FeedbackForm() {
  const [councils, setCouncils] = useState([]);
  const [loadingCouncils, setLoadingCouncils] = useState(true);

  const [studentName, setStudentName] = useState("");
  const [councilId, setCouncilId] = useState("");
  const [feedbackType, setFeedbackType] = useState("GENERAL");
  const [message, setMessage] = useState("");
  const [contact, setContact] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCouncils() {
      try {
        const res = await councilApi.getAll();
        setCouncils(res.data.data || []);
        if (res.data.data?.length > 0) {
          setCouncilId(res.data.data[0].councilId);
        }
      } catch (err) {
        // Fallback default councils if API unavailable
        setCouncils([
          { councilId: "CNL_001", councilName: "Culture Council" },
          { councilId: "CNL_002", councilName: "Academic Council" },
          { councilId: "CNL_003", councilName: "Planning Council" },
        ]);
        setCouncilId("CNL_001");
      } finally {
        setLoadingCouncils(false);
      }
    }
    loadCouncils();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!councilId) {
      setError("Please select a council");
      return;
    }
    if (!message || message.trim().length < 5) {
      setError("Please enter a feedback message with at least 5 characters");
      return;
    }

    setSubmitting(true);
    try {
      await feedbackApi.submitPublic({
        studentName,
        councilId,
        feedbackType,
        message,
        contact,
      });
      setSubmitted(true);
      // Reset form fields
      setMessage("");
      setStudentName("");
      setContact("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.errors?.[0] ||
          "Failed to submit feedback. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/50 via-slate-50 to-white py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <ScrollReveal direction="down" duration={500}>
          <div className="text-center mb-8">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-4 transition hover-underline-link"
            >
              <ArrowLeft size={14} />
              <span>NavGurukul Dantewada • Council Portal</span>
            </Link>
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500 text-white shadow-lg shadow-amber-500/25 mb-3 hover:scale-105 transition-transform">
              <MessageSquareHeart size={28} />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight heading-accent-underline">
              Student Feedback & Complaints
            </h1>
            <p className="mt-3 text-sm text-slate-600">
              Share suggestions, constructive thoughts, or complaints with your campus councils. No login required.
            </p>
          </div>
        </ScrollReveal>

        {/* Card */}
        <ScrollReveal direction="up" delay={150}>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 card-hover-amber">
          {submitted ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={36} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Thank you!</h2>
              <p className="mt-2 text-sm text-slate-600 max-w-sm mx-auto">
                Your feedback has been submitted successfully and routed to the relevant council and administration.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition"
                >
                  Submit Another Feedback
                </button>
                <Link
                  to="/"
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium transition"
                >
                  Back to Home
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-2">
                  <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Student Name (Optional) */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold uppercase text-slate-700 tracking-wider">
                    Your Name
                  </label>
                  <span className="text-[11px] text-slate-400 font-medium">Optional (Leave blank to remain anonymous)</span>
                </div>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="e.g. Aakash Verma"
                  className="mt-1 block w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 text-sm"
                />
              </div>

              {/* Council Selection (Required) */}
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 tracking-wider">
                  Select Council <span className="text-rose-500">*</span>
                </label>
                <div className="mt-1 relative">
                  <select
                    required
                    value={councilId}
                    onChange={(e) => setCouncilId(e.target.value)}
                    disabled={loadingCouncils}
                    className="block w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 text-sm"
                  >
                    {councils.map((c) => (
                      <option key={c.councilId} value={c.councilId}>
                        {c.councilName}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  Select the council responsible for your suggestion or complaint.
                </p>
              </div>

              {/* Feedback Type (Required) */}
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 tracking-wider">
                  Feedback Type <span className="text-rose-500">*</span>
                </label>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {[
                    { key: "GENERAL", label: "General Feedback", color: "indigo" },
                    { key: "SUGGESTION", label: "Suggestion", color: "emerald" },
                    { key: "COMPLAINT", label: "Complaint", color: "rose" },
                  ].map((t) => (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => setFeedbackType(t.key)}
                      className={`py-2 px-2 text-xs font-semibold rounded-xl border text-center transition ${
                        feedbackType === t.key
                          ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                          : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Feedback Message (Required) */}
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 tracking-wider">
                  Your Message <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Please describe your experience, suggestion, or complaint in detail..."
                  className="mt-1 block w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 text-sm leading-relaxed"
                />
              </div>

              {/* Contact Information (Optional) */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold uppercase text-slate-700 tracking-wider">
                    Contact Information
                  </label>
                  <span className="text-[11px] text-slate-400 font-medium">Optional</span>
                </div>
                <input
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="Email or phone (if you would like council leads to follow up)"
                  className="mt-1 block w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 text-sm"
                />
              </div>

              {/* Notice */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2">
                <ShieldAlert size={16} className="text-indigo-600 flex-shrink-0 mt-0.5" />
                <span>
                  Your feedback is stored securely and directly accessible by council coordinators and campus administrators.
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm shadow-sm transition disabled:opacity-50"
              >
                <Send size={16} />
                <span>{submitting ? "Submitting..." : "Submit Feedback"}</span>
              </button>
            </form>
          )}
        </div>
        </ScrollReveal>

        {/* Footer info */}
        <div className="mt-8 text-center text-xs text-slate-500">
          <span>Council Member or Admin? </span>
          <Link to="/council/login" className="text-indigo-600 font-medium hover:underline">
            Log in to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
