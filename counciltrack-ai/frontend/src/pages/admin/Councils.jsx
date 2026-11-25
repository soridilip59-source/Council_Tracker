import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { councilApi, userApi } from "../../services/api";
import CouncilDirectoryTable from "../../components/common/CouncilDirectoryTable";
import {
  Building2,
  Plus,
  Users,
  Edit2,
  CheckCircle2,
  XCircle,
  X,
  AlertCircle,
  Target,
  ArrowRight,
} from "lucide-react";

export default function Councils() {
  const [councils, setCouncils] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCouncil, setEditingCouncil] = useState(null);
  const [viewingCouncilMembers, setViewingCouncilMembers] = useState(null);

  // Form State
  const [councilName, setCouncilName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try {
      const [cRes, mRes] = await Promise.all([councilApi.getAll(), userApi.getAll()]);
      setCouncils(cRes.data.data || []);
      setMembers(mRes.data.data || []);
    } catch (err) {
      console.error("Failed to load councils:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAdd = () => {
    setEditingCouncil(null);
    setCouncilName("");
    setDescription("");
    setStatus("ACTIVE");
    setError("");
    setShowAddModal(true);
  };

  const openEdit = (council) => {
    setEditingCouncil(council);
    setCouncilName(council.councilName);
    setDescription(council.description || "");
    setStatus((council.status || "ACTIVE").toUpperCase());
    setError("");
    setShowAddModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      if (editingCouncil) {
        await councilApi.update(editingCouncil.councilId, {
          councilName,
          description,
          status,
        });
      } else {
        await councilApi.create({
          councilName,
          description,
          status,
        });
      }
      setShowAddModal(false);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save council");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Council Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Create and maintain campus councils, oversee assigned members, and monitor activity.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition"
        >
          <Plus size={16} />
          <span>Add New Council</span>
        </button>
      </div>

      {/* Councils Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500">Loading councils...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {councils.map((c) => {
            const assigned = members.filter((m) => m.councilId === c.councilId);
            const activeCount = assigned.filter((m) => (m.status || "").toUpperCase() === "ACTIVE").length;
            const isActive = (c.status || "").toUpperCase() === "ACTIVE";

            return (
              <div
                key={c.councilId}
                className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs flex flex-col justify-between hover:shadow-sm transition group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                      <Building2 size={22} />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          isActive
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {isActive ? "Active" : "Inactive"}
                      </span>
                      <button
                        onClick={() => openEdit(c)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                        title="Edit Council"
                      >
                        <Edit2 size={14} />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition">
                    {c.councilName}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {c.description || "No description provided."}
                  </p>

                  {/* Assigned Members Summary */}
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
                      <span className="font-semibold flex items-center gap-1.5">
                        <Users size={14} className="text-indigo-500" />
                        <span>Assigned Members</span>
                      </span>
                      <span className="font-bold text-slate-900">
                        {activeCount} active / {assigned.length} total
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {assigned.slice(0, 3).map((m) => (
                        <div
                          key={m.userId}
                          className="flex items-center justify-between text-[11px] bg-slate-50 px-2.5 py-1.5 rounded-lg"
                        >
                          <span className="font-medium text-slate-800 truncate mr-2">{m.name}</span>
                          <span className="text-indigo-600 text-[10px] font-semibold truncate">
                            {m.position || "Member"}
                          </span>
                        </div>
                      ))}
                      {assigned.length > 3 && (
                        <button
                          onClick={() => setViewingCouncilMembers({ council: c, members: assigned })}
                          className="text-[11px] font-semibold text-indigo-600 hover:underline block pt-0.5"
                        >
                          + {assigned.length - 3} more members
                        </button>
                      )}
                      {assigned.length === 0 && (
                        <p className="text-[11px] text-slate-400 italic">No members assigned yet.</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => setViewingCouncilMembers({ council: c, members: assigned })}
                    className="text-xs font-semibold text-slate-600 hover:text-slate-900"
                  >
                    View Members ({assigned.length})
                  </button>
                  <Link
                    to={`/admin/goals?councilId=${c.councilId}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                  >
                    <span>Council Goals</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Official Directory Table */}
      <CouncilDirectoryTable title="Official 14 Councils & 25 Coordinators Roster" />

      {/* Add / Edit Council Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-6 relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X size={18} />
            </button>

            <h2 className="text-lg font-bold text-slate-900">
              {editingCouncil ? "Edit Council" : "Add New Council"}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Create a council to organize coordinators and student engagement activities.
            </p>

            {error && (
              <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Council Name *</label>
                <input
                  type="text"
                  required
                  value={councilName}
                  onChange={(e) => setCouncilName(e.target.value)}
                  placeholder="e.g. Health & Hygiene Council"
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Responsibilities, scope, and objectives of this council..."
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>

              <div className="mt-6 flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition disabled:opacity-50"
                >
                  {saving ? "Saving..." : editingCouncil ? "Save Changes" : "Create Council"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Viewing Council Members Modal */}
      {viewingCouncilMembers && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg p-6 relative">
            <button
              onClick={() => setViewingCouncilMembers(null)}
              className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X size={18} />
            </button>

            <h2 className="text-lg font-bold text-slate-900">
              {viewingCouncilMembers.council.councilName} • Assigned Members
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {viewingCouncilMembers.members.length} members assigned to this council.
            </p>

            <div className="mt-4 space-y-2 max-h-72 overflow-y-auto pr-1">
              {viewingCouncilMembers.members.map((m) => (
                <div
                  key={m.userId}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-semibold text-slate-800">{m.name}</p>
                    <p className="text-[11px] text-slate-500">{m.email}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-indigo-600 block">{m.position || "Member"}</span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full inline-block mt-1 ${
                        (m.status || "").toUpperCase() === "ACTIVE"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {m.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 text-right">
              <button
                type="button"
                onClick={() => setViewingCouncilMembers(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
