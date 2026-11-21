import { useState, useEffect } from "react";
import { userApi, councilApi, goalApi, reportApi } from "../services/api";
import { Users, Building2, Target, CheckCircle2, Award, FileText, Plus, ShieldCheck, UserPlus, Power } from "lucide-react";

export default function SuperAdminDashboard() {
  const [users, setUsers] = useState([]);
  const [councils, setCouncils] = useState([]);
  const [goals, setGoals] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // New User Form State
  const [showUserModal, setShowUserModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "User@123", role: "council_member", councilId: "" });

  // New Council Form State
  const [showCouncilModal, setShowCouncilModal] = useState(false);
  const [newCouncil, setNewCouncil] = useState({ councilName: "", description: "" });

  const loadData = async () => {
    try {
      setLoading(true);
      const [uRes, cRes, gRes, rRes] = await Promise.all([
        userApi.getAll(),
        councilApi.getAll(),
        goalApi.getAll(),
        reportApi.getAll(),
      ]);
      setUsers(uRes.data.data || []);
      setCouncils(cRes.data.data || []);
      setGoals(gRes.data.data || []);
      setReports(rRes.data.data || []);
    } catch (err) {
      console.error("Failed to load super admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await userApi.create(newUser);
      setShowUserModal(false);
      setNewUser({ name: "", email: "", password: "User@123", role: "council_member", councilId: "" });
      loadData();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to create user");
    }
  };

  const handleToggleStatus = async (user) => {
    const nextStatus = user.status === "active" ? "inactive" : "active";
    try {
      await userApi.updateStatus(user.userId, nextStatus);
      loadData();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to update status");
    }
  };

  const handleCreateCouncil = async (e) => {
    e.preventDefault();
    try {
      await councilApi.create(newCouncil);
      setShowCouncilModal(false);
      setNewCouncil({ councilName: "", description: "" });
      loadData();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to create council");
    }
  };

  const handleApproveReport = async (reportId) => {
    try {
      await reportApi.approve(reportId);
      loadData();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to approve report");
    }
  };

  const completedGoals = goals.filter((g) => g.status === "Completed").length;
  const pendingReports = reports.filter((r) => r.status === "Pending");

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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-purple-900 to-indigo-900 text-white p-6 rounded-2xl shadow-lg">
        <div>
          <div className="flex items-center gap-2 text-purple-200 text-sm font-semibold uppercase tracking-wider mb-1">
            <ShieldCheck size={18} /> Super Admin Control Console
          </div>
          <h1 className="text-3xl font-bold">Platform Overview & Governance</h1>
          <p className="text-purple-200 text-sm mt-1">Full administrative control across all councils, users, goals, and AI evaluations.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowUserModal(true)}
            className="bg-white text-purple-900 hover:bg-purple-50 font-semibold px-4 py-2.5 rounded-xl shadow flex items-center gap-2 text-sm transition"
          >
            <UserPlus size={16} /> Add User
          </button>
          <button
            onClick={() => setShowCouncilModal(true)}
            className="bg-purple-700 hover:bg-purple-800 text-white font-semibold px-4 py-2.5 rounded-xl shadow flex items-center gap-2 text-sm transition"
          >
            <Plus size={16} /> New Council
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Users size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase">Total Users</p>
            <h3 className="text-2xl font-bold text-gray-900">{users.length}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <Building2 size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase">Active Councils</p>
            <h3 className="text-2xl font-bold text-gray-900">{councils.length}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase">Completed Goals</p>
            <h3 className="text-2xl font-bold text-gray-900">{completedGoals} / {goals.length}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Award size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase">Pending AI Reports</p>
            <h3 className="text-2xl font-bold text-gray-900">{pendingReports.length}</h3>
          </div>
        </div>
      </div>

      {/* User Management Section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Users size={20} className="text-purple-600" /> Platform User Directory & RBAC
          </h2>
          <span className="text-xs text-gray-500">{users.length} registered accounts</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wider bg-gray-50/50">
                <th className="py-3 px-4">Name & Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Council</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => {
                const council = councils.find((c) => c.councilId === u.councilId);
                return (
                  <tr key={u.userId} className="hover:bg-gray-50/50 transition">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-gray-900">{u.name}</div>
                      <div className="text-xs text-gray-500">{u.email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        u.role === "super_admin" ? "bg-purple-100 text-purple-800" :
                        u.role === "admin" ? "bg-blue-100 text-blue-800" :
                        u.role === "council_member" ? "bg-emerald-100 text-emerald-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>
                        {u.role.replace("_", " ").toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {council ? council.councilName : "—"}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        u.status === "active" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {u.role !== "super_admin" && (
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className={`text-xs px-2.5 py-1 rounded font-medium transition inline-flex items-center gap-1 ${
                            u.status === "active" ? "text-red-700 hover:bg-red-50" : "text-green-700 hover:bg-green-50"
                          }`}
                        >
                          <Power size={13} /> {u.status === "active" ? "Deactivate" : "Activate"}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pending AI Reports Review Section */}
      {pendingReports.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-amber-900 mb-2 flex items-center gap-2">
            <Award size={20} className="text-amber-700" /> AI Performance Reports Awaiting Admin Approval
          </h2>
          <p className="text-sm text-amber-800 mb-4">Review transparent scoring breakdowns and qualitative insights before making them visible to members.</p>
          <div className="space-y-3">
            {pendingReports.map((r) => (
              <div key={r.reportId} className="bg-white p-4 rounded-xl border border-amber-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h4 className="font-bold text-gray-900">{r.userName} ({r.councilName})</h4>
                  <p className="text-xs text-gray-500">Month: {r.month} • Overall Score: <span className="font-bold text-purple-700">{r.overallScore} / 100</span></p>
                  <p className="text-xs text-gray-600 mt-1">Goal: {r.goalScore}% • Consistency: {r.consistencyScore}% • Reflection: {r.reflectionScore}% • Feedback: {r.feedbackScore}%</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApproveReport(r.reportId)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow transition"
                  >
                    ✓ Approve Report
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Create New Account</h3>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  placeholder="e.g. Ananya Rao"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  placeholder="ananya@counciltrack.org"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                >
                  <option value="student">Student</option>
                  <option value="council_member">Council Member</option>
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
              {newUser.role === "council_member" && (
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Assign to Council</label>
                  <select
                    value={newUser.councilId}
                    onChange={(e) => setNewUser({ ...newUser, councilId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  >
                    <option value="">-- Select Council --</option>
                    {councils.map((c) => (
                      <option key={c.councilId} value={c.councilId}>{c.councilName}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="px-4 py-2 border text-gray-600 rounded-lg text-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-700 text-white rounded-lg text-sm font-semibold hover:bg-purple-800"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Council Modal */}
      {showCouncilModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Register New Council</h3>
            <form onSubmit={handleCreateCouncil} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Council Name</label>
                <input
                  type="text"
                  required
                  value={newCouncil.councilName}
                  onChange={(e) => setNewCouncil({ ...newCouncil, councilName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  placeholder="e.g. Sports & Well-being Council"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={newCouncil.description}
                  onChange={(e) => setNewCouncil({ ...newCouncil, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  placeholder="Charter and responsibilities of this council..."
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCouncilModal(false)}
                  className="px-4 py-2 border text-gray-600 rounded-lg text-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-700 text-white rounded-lg text-sm font-semibold hover:bg-purple-800"
                >
                  Create Council
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
