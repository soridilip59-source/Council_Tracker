import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { councilApi, userApi } from "../../services/api";
import CouncilDirectoryTable from "../../components/common/CouncilDirectoryTable";
import {
  Building2,
  Plus,
  Users,
  Edit2,
  Trash2,
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
  const [councilToDelete, setCouncilToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Form State
  const [councilName, setCouncilName] = useState("");
  const [slug, setSlug] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [councilMembersList, setCouncilMembersList] = useState([]);
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
    setSlug("");
    setLoginEmail("");
    setDescription("");
    setStatus("ACTIVE");
    setCouncilMembersList([{ name: "", email: "", position: "" }]);
    setError("");
    setShowAddModal(true);
  };

  const openEdit = (council) => {
    setEditingCouncil(council);
    setCouncilName(council.councilName);
    setSlug(council.slug || "");
    setLoginEmail(council.loginEmail || "");
    setDescription(council.description || "");
    setStatus((council.status || "ACTIVE").toUpperCase());
    const existing = council.members && council.members.length > 0
      ? council.members.slice(0, 3)
      : [{ name: "", email: "", position: `${council.councilName} Coordinator` }];
    setCouncilMembersList(existing);
    setError("");
    setShowAddModal(true);
  };

  const handleAddMember = () => {
    if (councilMembersList.length >= 3) {
      setError("Ek council me maximum 3 members assign kar sakte hain.");
      return;
    }
    setError("");
    setCouncilMembersList([...councilMembersList, { name: "", email: "", position: "" }]);
  };

  const handleRemoveMember = (idx) => {
    const updated = councilMembersList.filter((_, i) => i !== idx);
    setCouncilMembersList(updated);
    setError("");
  };

  const handleMemberChange = (idx, field, val) => {
    const updated = [...councilMembersList];
    updated[idx] = { ...updated[idx], [field]: val };
    setCouncilMembersList(updated);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");

    // Validate max 3 members
    const cleanMembers = councilMembersList.filter((m) => m.name && m.name.trim().length > 0);
    if (cleanMembers.length > 3) {
      setError("Ek council me maximum 3 members hi ho sakte hain.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        councilName: councilName.trim(),
        slug: slug.trim() || councilName.toLowerCase().replace(/[^a-z0-9]/g, "-"),
        loginEmail: loginEmail.trim() || `${(slug.trim() || councilName.toLowerCase().replace(/[^a-z0-9]/g, "-"))}@counciltrack.org`,
        description: description.trim(),
        status,
        members: cleanMembers,
      };

      if (editingCouncil) {
        await councilApi.update(editingCouncil.councilId, payload);
      } else {
        await councilApi.create(payload);
      }
      setShowAddModal(false);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save council");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCouncil = async () => {
    if (!councilToDelete) return;
    setDeleting(true);
    try {
      await councilApi.delete(councilToDelete.councilId);
      setCouncilToDelete(null);
      await loadData();
    } catch (err) {
      alert("Failed to delete council: " + (err.response?.data?.message || err.message));
    } finally {
      setDeleting(false);
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
                      <button
                        onClick={() => setCouncilToDelete(c)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Delete Council (Admin Only)"
                      >
                        <Trash2 size={14} />
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
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg p-6 relative animate-in fade-in zoom-in-95 my-8">
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
              Configure council domain, shared login credentials, and assign up to 3 coordinators.
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
                  placeholder="e.g. Discipline Council"
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Login Handle / Slug *</label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="e.g. disco, english"
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">Short login handle</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Shared Login Email *</label>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="e.g. disco@counciltrack.org"
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">Single shared email for both</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Responsibilities, scope, and objectives of this council..."
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 leading-relaxed"
                />
              </div>

              {/* Coordinators Section - Maximum 3 */}
              <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/70 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-bold text-slate-800">
                      Assigned Coordinators ({councilMembersList.length}/3 Maximum)
                    </label>
                    <p className="text-[10px] text-slate-500">
                      Har council me maximum 3 members select / assign kar sakte hain.
                    </p>
                  </div>
                  {councilMembersList.length < 3 && (
                    <button
                      type="button"
                      onClick={handleAddMember}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg transition"
                    >
                      <Plus size={12} />
                      <span>Add Member</span>
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  {councilMembersList.map((m, idx) => (
                    <div key={idx} className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-700">Coordinator #{idx + 1}</span>
                        {councilMembersList.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveMember(idx)}
                            className="text-[10px] font-semibold text-rose-600 hover:text-rose-800"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input
                          type="text"
                          required
                          value={m.name || ""}
                          onChange={(e) => handleMemberChange(idx, "name", e.target.value)}
                          placeholder="Name (e.g. Mohan Kunjam)"
                          className="px-2 py-1.5 border border-slate-200 rounded-lg text-xs"
                        />
                        <input
                          type="email"
                          value={m.email || ""}
                          onChange={(e) => handleMemberChange(idx, "email", e.target.value)}
                          placeholder="Email"
                          className="px-2 py-1.5 border border-slate-200 rounded-lg text-xs font-mono"
                        />
                        <input
                          type="text"
                          value={m.position || ""}
                          onChange={(e) => handleMemberChange(idx, "position", e.target.value)}
                          placeholder="Post (e.g. Disco)"
                          className="px-2 py-1.5 border border-slate-200 rounded-lg text-xs"
                        />
                      </div>
                    </div>
                  ))}
                </div>
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

      {/* Delete Council Confirmation Modal */}
      {councilToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-6 relative animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} />
            </div>
            <h3 className="text-base font-bold text-slate-900 text-center">
              Delete Council: {councilToDelete.councilName}?
            </h3>
            <p className="text-xs text-slate-500 text-center mt-2 leading-relaxed">
              Are you sure you want to delete this council? Is council ka shared login account aur data system aur Google Sheets dono se permanently remove ho jayega.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setCouncilToDelete(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDeleteCouncil}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Yes, Delete Council"}
              </button>
            </div>
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
