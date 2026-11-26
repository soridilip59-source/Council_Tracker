import { useState, useEffect } from "react";
import { userApi, councilApi } from "../../services/api";
import {
  Users,
  UserPlus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Edit2,
  Shield,
  Eye,
  EyeOff,
  Key,
  X,
  AlertCircle,
  Building2,
  Lock,
} from "lucide-react";

export default function Members() {
  const [members, setMembers] = useState([]);
  const [councils, setCouncils] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedCouncil, setSelectedCouncil] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [viewingMember, setViewingMember] = useState(null);

  // Form State
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("Council@123");
  const [showPassword, setShowPassword] = useState(false);
  const [formCouncilId, setFormCouncilId] = useState("");
  const [formPosition, setFormPosition] = useState("");
  const [formStatus, setFormStatus] = useState("ACTIVE");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try {
      const [memRes, cnlRes] = await Promise.all([userApi.getAll(), councilApi.getAll()]);
      setMembers(memRes.data.data || []);
      setCouncils(cnlRes.data.data || []);
      if (cnlRes.data.data?.length > 0 && !formCouncilId) {
        setFormCouncilId(cnlRes.data.data[0].councilId);
      }
    } catch (err) {
      console.error("Failed to load members:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setEditingMember(null);
    setFormName("");
    setFormEmail("");
    setFormPassword("Council@123");
    setShowPassword(false);
    setFormCouncilId(councils[0]?.councilId || "");
    setFormPosition("");
    setFormStatus("ACTIVE");
    setFormError("");
    setShowAddModal(true);
  };

  const openEditModal = (member) => {
    setEditingMember(member);
    setFormName(member.name);
    setFormEmail(member.email);
    setFormPassword("");
    setShowPassword(false);
    setFormCouncilId(member.councilId || councils[0]?.councilId || "");
    setFormPosition(member.position || "");
    setFormStatus((member.status || "ACTIVE").toUpperCase());
    setFormError("");
    setShowAddModal(true);
  };

  const openViewModal = async (member) => {
    try {
      const res = await userApi.getById(member.userId);
      setViewingMember(res.data.data);
    } catch (err) {
      setViewingMember(member);
    }
  };

  const handleToggleStatus = async (member) => {
    const newStatus = (member.status || "").toUpperCase() === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      await userApi.updateStatus(member.userId, newStatus);
      await loadData();
    } catch (err) {
      alert("Failed to update member status: " + (err.response?.data?.message || err.message));
    }
  };

  const handleSaveMember = async (e) => {
    e.preventDefault();
    setFormError("");
    setSaving(true);

    try {
      if (editingMember) {
        // Update existing member (including email, council, role, and optional password reset)
        const payload = {
          name: formName,
          email: formEmail,
          councilId: formCouncilId,
          position: formPosition,
          status: formStatus,
        };
        if (formPassword && formPassword.trim().length > 0) {
          payload.password = formPassword.trim();
        }
        await userApi.update(editingMember.userId, payload);
      } else {
        // Create new member with initial password
        await userApi.create({
          name: formName,
          email: formEmail,
          password: formPassword,
          role: "COUNCIL",
          councilId: formCouncilId,
          position: formPosition,
        });
      }
      setShowAddModal(false);
      await loadData();
    } catch (err) {
      setFormError(
        err.response?.data?.message ||
          err.response?.data?.errors?.[0] ||
          "Failed to save member record"
      );
    } finally {
      setSaving(false);
    }
  };

  // Filtered members list
  const filtered = members
    .filter((m) => (m.role || "").toUpperCase() === "COUNCIL")
    .filter((m) => {
      if (selectedCouncil && m.councilId !== selectedCouncil) return false;
      if (selectedStatus && (m.status || "").toUpperCase() !== selectedStatus.toUpperCase()) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          m.name?.toLowerCase().includes(q) ||
          m.email?.toLowerCase().includes(q) ||
          m.position?.toLowerCase().includes(q) ||
          m.userId?.toLowerCase().includes(q)
        );
      }
      return true;
    });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Total Council Members</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage coordinators, assign multiple members to councils, update designations and account statuses.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition"
        >
          <UserPlus size={16} />
          <span>Add New Member</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or position..."
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex items-center gap-3 w-full md:w-auto">
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
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active Only</option>
            <option value="INACTIVE">Inactive Only</option>
          </select>

          {(search || selectedCouncil || selectedStatus) && (
            <button
              onClick={() => {
                setSearch("");
                setSelectedCouncil("");
                setSelectedStatus("");
              }}
              className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Members Table (PRD Section 4.1) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Member ID</th>
                <th className="px-5 py-3">Name & Email</th>
                <th className="px-5 py-3">Assigned Council</th>
                <th className="px-5 py-3">Position</th>
                <th className="px-5 py-3 text-center">Status</th>
                <th className="px-5 py-3 text-center">Today's Goals</th>
                <th className="px-5 py-3 text-center">Completion Rate</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-slate-500 text-xs">
                    Loading members directory...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-slate-500 text-xs">
                    No members match your search criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((m) => {
                  const stats = m.todayStats || {};
                  const isActive = (m.status || "").toUpperCase() === "ACTIVE";

                  return (
                    <tr key={m.userId} className="hover:bg-slate-50/70 transition">
                      <td className="px-5 py-3.5 text-xs font-mono font-medium text-slate-500">
                        {m.userId}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-slate-900">{m.name}</div>
                        <div className="text-xs text-slate-400">{m.email}</div>
                        {m.members && m.members.length > 0 && (
                          <div className="text-[11px] text-indigo-600 mt-0.5 font-medium">
                            👥 {m.members.map((x) => x.name).join(", ")}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-medium border border-indigo-100">
                          <Building2 size={12} />
                          <span>{m.councilName}</span>
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs font-medium text-slate-700">
                        {m.position || "Member"}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <button
                          onClick={() => handleToggleStatus(m)}
                          title={`Click to ${isActive ? "Deactivate" : "Activate"} account`}
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition ${
                            isActive
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                              : "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100"
                          }`}
                        >
                          {isActive ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                          <span>{isActive ? "Active" : "Inactive"}</span>
                        </button>
                      </td>
                      <td className="px-5 py-3.5 text-center text-xs">
                        <span className="font-bold text-slate-800">{stats.totalGoals || 0}</span>
                        <span className="text-slate-400 text-[11px] ml-1">
                          ({stats.completedGoals || 0}✓ / {stats.incompleteGoals || 0}✕)
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <span
                          className={`font-semibold text-xs px-2 py-0.5 rounded-md ${
                            stats.completionRate === "N/A"
                              ? "bg-slate-100 text-slate-500"
                              : Number(stats.completionRate) >= 70
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {stats.completionRate !== "N/A" ? `${stats.completionRate}%` : "N/A"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right space-x-2">
                        <button
                          onClick={() => openViewModal(m)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition"
                          title="View Details"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => openEditModal(m)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition"
                          title="Edit Member"
                        >
                          <Edit2 size={15} />
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

      {/* Add / Edit Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg p-6 relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X size={18} />
            </button>

            <h2 className="text-lg font-bold text-slate-900">
              {editingMember ? "Edit Council Member" : "Add New Council Member"}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Assign to a council with designated position. Multiple members per council supported.
            </p>

            {formError && (
              <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveMember} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Login Email *</label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="rahul@counciltrack.org"
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              {!editingMember ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Set Login Password *</label>
                  <div className="relative mt-1">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={4}
                      value={formPassword}
                      onChange={(e) => setFormPassword(e.target.value)}
                      placeholder="e.g. Council@123"
                      className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">Council member will use this password to log in.</p>
                </div>
              ) : (
                <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-indigo-950">
                      <Key size={13} className="text-indigo-600" />
                      <span>Reset / Change Password</span>
                    </label>
                    <span className="text-[10px] text-slate-400">Optional</span>
                  </div>
                  <div className="px-2.5 py-1.5 rounded-lg bg-white border border-indigo-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-medium">Current Password:</span>
                    <span className="font-mono font-bold text-slate-900">
                      {editingMember.currentPassword || "Not set"}
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formPassword}
                      onChange={(e) => setFormPassword(e.target.value)}
                      placeholder="Type new password to reset (min 4 characters)"
                      className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-xl text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Leave blank to keep existing password unchanged.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Assigned Council *</label>
                  <select
                    value={formCouncilId}
                    onChange={(e) => setFormCouncilId(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  >
                    {councils.map((c) => (
                      <option key={c.councilId} value={c.councilId}>
                        {c.councilName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Position / Designation *</label>
                  <input
                    type="text"
                    required
                    value={formPosition}
                    onChange={(e) => setFormPosition(e.target.value)}
                    placeholder="e.g. Culture Coordinator"
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
              </div>

              {editingMember && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Account Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
              )}

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
                  {saving ? "Saving..." : editingMember ? "Save Changes" : "Create Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Individual Member Profile Modal (PRD Section 4.1) */}
      {viewingMember && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 relative">
            <button
              onClick={() => setViewingMember(null)}
              className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-lg">
                {viewingMember.name?.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">{viewingMember.name}</h2>
                <p className="text-xs text-indigo-600 font-semibold">{viewingMember.position || "Council Member"}</p>
                <p className="text-xs text-slate-400">{viewingMember.email} • ID: {viewingMember.userId}</p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 block font-medium">Council</span>
                <span className="font-semibold text-slate-800">{viewingMember.councilName}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Account Status</span>
                <span
                  className={`inline-block font-semibold px-2 py-0.5 rounded-full text-[10px] ${
                    (viewingMember.status || "").toUpperCase() === "ACTIVE"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-rose-100 text-rose-800"
                  }`}
                >
                  {viewingMember.status}
                </span>
              </div>
            </div>

            {/* Recent Daily Goals */}
            <div className="mt-6">
              <h3 className="text-sm font-bold text-slate-900 mb-2">Recent Daily Goals</h3>
              {viewingMember.recentGoals?.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {viewingMember.recentGoals.map((g) => (
                    <div
                      key={g.goalId}
                      className="p-3 bg-white border border-slate-200 rounded-xl text-xs flex items-center justify-between"
                    >
                      <div>
                        <p className="font-semibold text-slate-800">{g.title}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{g.goalDate} • Priority: {g.priority}</p>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          (g.status || "").toUpperCase() === "COMPLETED"
                            ? "bg-emerald-50 text-emerald-700"
                            : (g.status || "").toUpperCase() === "INCOMPLETE"
                            ? "bg-rose-50 text-rose-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {g.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No recent goals recorded.</p>
              )}
            </div>

            {/* Recent Evening Reflections */}
            <div className="mt-6">
              <h3 className="text-sm font-bold text-slate-900 mb-2">Recent Evening Reflections</h3>
              {viewingMember.reflections?.length > 0 ? (
                <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                  {viewingMember.reflections.map((r) => (
                    <div key={r.reflectionId} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                      <div className="flex items-center justify-between font-semibold text-slate-700 mb-1">
                        <span>Date: {r.reflectionDate}</span>
                        <span className="text-[10px] text-slate-400">ID: {r.reflectionId}</span>
                      </div>
                      <p className="text-slate-700"><strong>Achievements:</strong> {r.achievements}</p>
                      {r.challenges && <p className="text-slate-600 mt-1"><strong>Challenges:</strong> {r.challenges}</p>}
                      {r.learnings && <p className="text-slate-600 mt-1"><strong>Learnings:</strong> {r.learnings}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No evening reflections recorded.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
