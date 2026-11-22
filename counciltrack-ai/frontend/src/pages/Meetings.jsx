import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { meetingApi, councilApi } from "../services/api";
import { Calendar, Plus, Clock, Building2, Trash2, CheckCircle2 } from "lucide-react";

export default function Meetings() {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState([]);
  const [councils, setCouncils] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    councilId: "",
    meetingDate: new Date().toISOString().slice(0, 10),
    meetingTime: "16:00",
  });

  const loadMeetings = async () => {
    try {
      setLoading(true);
      const [mRes, cRes] = await Promise.all([
        meetingApi.getAll(),
        councilApi.getAll(),
      ]);
      setMeetings(mRes.data.data || []);
      setCouncils(cRes.data.data || []);
    } catch (err) {
      console.error("Failed to load meetings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMeetings();
  }, []);

  const handleSchedule = async (e) => {
    e.preventDefault();
    try {
      await meetingApi.schedule(form);
      setShowModal(false);
      setForm({
        title: "",
        description: "",
        councilId: "",
        meetingDate: new Date().toISOString().slice(0, 10),
        meetingTime: "16:00",
      });
      loadMeetings();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to schedule meeting");
    }
  };

  const handleCancel = async (id) => {
    if (!confirm("Are you sure you want to cancel this meeting?")) return;
    try {
      await meetingApi.cancel(id);
      loadMeetings();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to cancel meeting");
    }
  };

  const canManageMeetings = ["super_admin", "admin"].includes(user?.role);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="text-indigo-600" /> Council Meetings & Coordination
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Automated schedules, Discord agenda broadcasting, and timely 1-hour notifications.
          </p>
        </div>
        {canManageMeetings && (
          <button
            onClick={() => setShowModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2.5 rounded-xl shadow flex items-center gap-2 text-sm transition"
          >
            <Plus size={16} /> Schedule Meeting
          </button>
        )}
      </div>

      {/* Meetings List */}
      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        </div>
      ) : meetings.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-gray-100 shadow-sm">
          <Calendar size={40} className="mx-auto text-gray-300 mb-2" />
          <h3 className="text-gray-700 font-bold">No scheduled meetings</h3>
          <p className="text-xs text-gray-400 mt-1">New coordination meetings will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {meetings.map((m) => (
            <div key={m.meetingId} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 bg-indigo-50 text-indigo-800 rounded-full">
                    {m.councilName}
                  </span>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                    m.discordStatus === "sent" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
                  }`}>
                    Discord: {m.discordStatus}
                  </span>
                </div>

                <h3 className="text-base font-bold text-gray-900 mb-1">{m.title}</h3>
                <p className="text-xs text-gray-500 mb-4">{m.description || "General coordination meeting."}</p>
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-between items-center text-xs">
                <div className="text-indigo-700 font-medium">
                  <span className="flex items-center gap-1"><Calendar size={12} /> {m.meetingDate}</span>
                  <span className="flex items-center gap-1"><Clock size={12} /> {m.meetingTime}</span>
                </div>

                {canManageMeetings && (
                  <button
                    onClick={() => handleCancel(m.meetingId)}
                    className="text-red-500 hover:text-red-700 p-1.5 rounded hover:bg-red-50"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Schedule Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Schedule Council Meeting</h3>
            <form onSubmit={handleSchedule} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Monthly Academic Review"
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Description / Agenda</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Meeting agenda items..."
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Council</label>
                <select
                  value={form.councilId}
                  onChange={(e) => setForm({ ...form, councilId: e.target.value })}
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
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Meeting Date</label>
                  <input
                    type="date"
                    required
                    value={form.meetingDate}
                    onChange={(e) => setForm({ ...form, meetingDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Meeting Time</label>
                  <input
                    type="time"
                    required
                    value={form.meetingTime}
                    onChange={(e) => setForm({ ...form, meetingTime: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
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
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700"
                >
                  Schedule & Broadcast
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
