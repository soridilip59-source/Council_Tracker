import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { councilApi, userApi } from "../../services/api";
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
  Search,
  KeyRound,
  Copy,
  Check,
  Eye,
  EyeOff,
  Lock,
} from "lucide-react";

export default function Councils() {
  const [councils, setCouncils] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState(null);
  const [visiblePasswords, setVisiblePasswords] = useState({});

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCouncil, setEditingCouncil] = useState(null);
  const [viewingCouncilMembers, setViewingCouncilMembers] = useState(null);
  const [councilToDelete, setCouncilToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [passwordModalCouncil, setPasswordModalCouncil] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSaving, setPwSaving] = useState(false);

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

  const handleCopyLogin = (id, text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const togglePasswordVisibility = (councilId) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [councilId]: !prev[councilId],
    }));
  };

  const openPasswordModal = (council) => {
    setPasswordModalCouncil(council);
    setNewPassword("");
    setConfirmPassword("");
    setShowNewPassword(false);
    setPwError("");
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!passwordModalCouncil) return;
    setPwError("");

    if (!newPassword.trim() || newPassword.trim().length < 4) {
      setPwError("New password must be at least 4 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError("New password and confirm password do not match.");
      return;
    }

    setPwSaving(true);
    try {
      await councilApi.resetPassword(passwordModalCouncil.councilId, newPassword.trim());
      setPasswordModalCouncil(null);
      await loadData();
    } catch (err) {
      setPwError(err.response?.data?.message || "Failed to update council password.");
    } finally {
      setPwSaving(false);
    }
  };

  const filteredCouncils = councils.filter((c) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    const memberNames = (c.members || []).map((m) => `${m.name} ${m.position || ""}`).join(" ").toLowerCase();
    return (
      (c.councilName || "").toLowerCase().includes(q) ||
      (c.loginEmail || "").toLowerCase().includes(q) ||
      (c.slug || "").toLowerCase().includes(q) ||
      memberNames.includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Council Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage all {councils.length} campus councils, shared login credentials, and assigned coordinators (max 3 per council).
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search council, coordinator, or login..."
              className="pl-8 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none w-full sm:w-64"
            />
          </div>
          <button
            onClick={openAdd}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs hover:shadow-md transition-all active:scale-95"
          >
            <Plus size={16} />
            <span>Add New Council</span>
          </button>
        </div>
      </div>

      {/* Councils Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500">Loading councils...</div>
      ) : filteredCouncils.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-500">
          No councils match "{searchQuery}".
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCouncils.map((c) => {
            const assigned = members.filter((m) => m.councilId === c.councilId);
            const coordinators = c.members && c.members.length > 0 ? c.members : assigned;
            const sharedLogin = c.loginEmail || assigned[0]?.email || `${c.slug || "council"}@counciltrack.org`;
            const sharedHandle = c.slug || sharedLogin.split("@")[0];
            const isActive = (c.status || "").toUpperCase() === "ACTIVE";

            return (
              <div
                key={c.councilId}
                className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col justify-between hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
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
                        title="Edit Council & Coordinators"
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

                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {c.councilName}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {c.description || "No description provided."}
                  </p>

                  {/* Shared Login Credential Box */}
                  <div className="mt-3 p-2.5 rounded-xl bg-indigo-50/70 border border-indigo-100 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-indigo-700 uppercase tracking-wider">
                          <KeyRound size={11} />
                          <span>Shared Login ID</span>
                          <span className="px-1.5 py-0.2 rounded bg-white text-indigo-600 border border-indigo-200 lowercase">
                            @{sharedHandle}
                          </span>
                        </div>
                        <p className="text-xs font-mono font-semibold text-slate-800 truncate mt-0.5">
                          {sharedLogin}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyLogin(c.councilId, sharedLogin)}
                        className="shrink-0 p-1.5 rounded-lg bg-white border border-indigo-200 text-indigo-600 hover:bg-indigo-100 transition"
                        title="Copy Shared Login Email"
                      >
                        {copiedId === c.councilId ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                      </button>
                    </div>

                    {/* Current Password & Admin Reset */}
                    <div className="pt-2 border-t border-indigo-200/60 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1 text-[10px] font-semibold text-indigo-700 uppercase tracking-wider">
                          <Lock size={10} />
                          <span>Password</span>
                        </div>
                        <p className="text-xs font-mono font-semibold text-slate-800 truncate mt-0.5">
                          {visiblePasswords[c.councilId]
                            ? c.currentPassword || "Not set (Reset to set)"
                            : "••••••••"}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility(c.councilId)}
                          className="p-1.5 rounded-lg bg-white border border-indigo-200 text-indigo-600 hover:bg-indigo-100 transition"
                          title={visiblePasswords[c.councilId] ? "Hide Password" : "Show Password"}
                        >
                          {visiblePasswords[c.councilId] ? <EyeOff size={13} /> : <Eye size={13} />}
                        </button>
                        {c.currentPassword && (
                          <button
                            type="button"
                            onClick={() => handleCopyLogin(`${c.councilId}-pw`, c.currentPassword)}
                            className="p-1.5 rounded-lg bg-white border border-indigo-200 text-indigo-600 hover:bg-indigo-100 transition"
                            title="Copy Current Password"
                          >
                            {copiedId === `${c.councilId}-pw` ? (
                              <Check size={13} className="text-emerald-600" />
                            ) : (
                              <Copy size={13} />
                            )}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => openPasswordModal(c)}
                          className="px-2 py-1 rounded-lg bg-indigo-600 text-white text-[10px] font-semibold hover:bg-indigo-700 transition"
                          title="Change / Reset Council Password"
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Assigned Coordinators Summary */}
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
                      <span className="font-semibold flex items-center gap-1.5">
                        <Users size={14} className="text-indigo-500" />
                        <span>Assigned Coordinators</span>
                      </span>
                      <span className="font-bold text-slate-900 text-[11px] bg-slate-100 px-2 py-0.5 rounded-full">
                        {coordinators.length} / 3 max
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {coordinators.slice(0, 3).map((m, idx) => (
                        <div
                          key={m.userId || `${c.councilId}-m-${idx}`}
                          className="flex items-center justify-between text-[11px] bg-slate-50 border border-slate-100 px-2.5 py-1.5 rounded-lg"
                        >
                          <span className="font-semibold text-slate-800 truncate mr-2">{m.name}</span>
                          <span className="text-indigo-600 text-[10px] font-semibold truncate shrink-0 max-w-[140px]">
                            {m.position || "Coordinator"}
                          </span>
                        </div>
                      ))}
                      {coordinators.length === 0 && (
                        <p className="text-[11px] text-slate-400 italic">No coordinators assigned yet.</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => setViewingCouncilMembers({ council: c, members: coordinators })}
                    className="text-xs font-semibold text-slate-600 hover:text-slate-900"
                  >
                    View Details ({coordinators.length})
                  </button>
                  <Link
                    to={`/admin/goals?councilId=${c.councilId}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                  >
                    <span>Council Goals</span>
                    <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

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
              {viewingCouncilMembers.members.map((m, idx) => (
                <div
                  key={m.userId || `modal-member-${idx}`}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-semibold text-slate-800">{m.name}</p>
                    <p className="text-[11px] text-slate-500">{m.email || viewingCouncilMembers.council.loginEmail}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-indigo-600 block">{m.position || "Coordinator"}</span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full inline-block mt-1 ${
                        (m.status || "ACTIVE").toUpperCase() === "ACTIVE"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {m.status || "ACTIVE"}
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

      {/* Reset / Change Council Password Modal */}
      {passwordModalCouncil && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-6 relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setPasswordModalCouncil(null)}
              className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
                <Lock size={18} />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Change Council Password</h2>
                <p className="text-xs text-slate-500">
                  {passwordModalCouncil.councilName} ({passwordModalCouncil.loginEmail})
                </p>
              </div>
            </div>

            {/* Current Password Display */}
            <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <span className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  Current Password
                </span>
                <span className="text-sm font-mono font-bold text-slate-900">
                  {passwordModalCouncil.currentPassword || "Not set"}
                </span>
              </div>
              {passwordModalCouncil.currentPassword && (
                <button
                  type="button"
                  onClick={() =>
                    handleCopyLogin(`${passwordModalCouncil.councilId}-modal-pw`, passwordModalCouncil.currentPassword)
                  }
                  className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 transition"
                  title="Copy Current Password"
                >
                  {copiedId === `${passwordModalCouncil.councilId}-modal-pw` ? (
                    <Check size={14} className="text-emerald-600" />
                  ) : (
                    <Copy size={14} />
                  )}
                </button>
              )}
            </div>

            {pwError && (
              <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                <span>{pwError}</span>
              </div>
            )}

            <form onSubmit={handleResetPassword} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  New Password *
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    required
                    minLength={4}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min 4 chars)"
                    className="w-full pl-3 pr-9 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    title={showNewPassword ? "Hide password" : "Show password"}
                  >
                    {showNewPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Confirm New Password *
                </label>
                <input
                  type={showNewPassword ? "text" : "password"}
                  required
                  minLength={4}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPasswordModalCouncil(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={pwSaving}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 disabled:opacity-50"
                >
                  {pwSaving ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
