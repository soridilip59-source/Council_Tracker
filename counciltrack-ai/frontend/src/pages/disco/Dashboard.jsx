import { useState, useEffect } from "react";
import {
  councilApi,
  userApi,
  goalApi,
  reflectionApi,
  analyticsApi,
} from "../../services/api";
import {
  Shield,
  Target,
  Users,
  Building2,
  AlertTriangle,
  Moon,
  CheckCircle2,
  Clock,
  XCircle,
  Plus,
  Search,
  Filter,
  ArrowRight,
  ExternalLink,
  Sparkles,
  MessageSquare,
  HelpCircle,
  UserPlus,
  RefreshCw,
  X,
} from "lucide-react";

export default function DiscoDashboard() {
  const [activeTab, setActiveTab] = useState("goals"); // 'goals' | 'roster' | 'blockers' | 'reflections'
  const [loading, setLoading] = useState(true);

  // Core Data
  const [councils, setCouncils] = useState([]);
  const [members, setMembers] = useState([]);
  const [goals, setGoals] = useState([]);
  const [reflections, setReflections] = useState([]);
  const [summary, setSummary] = useState(null);

  // Filters
  const [goalFilterCouncil, setGoalFilterCouncil] = useState("");
  const [goalFilterStatus, setGoalFilterStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [showCreateCouncilModal, setShowCreateCouncilModal] = useState(false);
  const [showAssignMemberModal, setShowAssignMemberModal] = useState(false);

  // Form States
  const [newCouncilName, setNewCouncilName] = useState("");
  const [newCouncilDesc, setNewCouncilDesc] = useState("");
  const [assignUserId, setAssignUserId] = useState("");
  const [assignCouncilId, setAssignCouncilId] = useState("");
  const [assignPosition, setAssignPosition] = useState("");
  const [formSaving, setFormSaving] = useState(false);
  const [modalFeedback, setModalFeedback] = useState("");

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [cnlRes, memRes, goalRes, refRes, sumRes] = await Promise.all([
        councilApi.getAll(),
        userApi.getAll(),
        goalApi.getAll(),
        reflectionApi.getAll(),
        analyticsApi.getDashboard().catch(() => ({ data: { data: null } })),
      ]);

      setCouncils(cnlRes.data.data || []);
      setMembers(memRes.data.data || []);
      setGoals(goalRes.data.data || []);
      setReflections(refRes.data.data || []);
      setSummary(sumRes.data.data);

      if (memRes.data.data?.length > 0 && !assignUserId) {
        setAssignUserId(memRes.data.data[0].userId);
      }
      if (cnlRes.data.data?.length > 0 && !assignCouncilId) {
        setAssignCouncilId(cnlRes.data.data[0].councilId);
      }
    } catch (err) {
      console.error("DISCO dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Handlers for Council Creation & Roster Assignment
  const handleCreateCouncil = async (e) => {
    e.preventDefault();
    setFormSaving(true);
    setModalFeedback("");
    try {
      await councilApi.create({
        councilName: newCouncilName.trim(),
        description: newCouncilDesc.trim(),
      });
      setNewCouncilName("");
      setNewCouncilDesc("");
      setShowCreateCouncilModal(false);
      await loadAllData();
    } catch (err) {
      setModalFeedback(err.response?.data?.message || "Failed to create council");
    } finally {
      setFormSaving(false);
    }
  };

  const handleAssignMember = async (e) => {
    e.preventDefault();
    setFormSaving(true);
    setModalFeedback("");
    try {
      await userApi.update(assignUserId, {
        councilId: assignCouncilId,
        position: assignPosition.trim() || undefined,
      });
      setShowAssignMemberModal(false);
      await loadAllData();
    } catch (err) {
      setModalFeedback(err.response?.data?.message || "Failed to assign member");
    } finally {
      setFormSaving(false);
    }
  };

  // Metrics calculation
  const totalCouncilsCount = councils.length;
  const totalCoordinatorsCount = members.filter((m) => (m.status || "").toUpperCase() === "ACTIVE").length;
  const completedGoalsCount = goals.filter((g) => (g.status || "").toUpperCase() === "COMPLETED").length;
  const incompleteGoals = goals.filter((g) => (g.status || "").toUpperCase() === "INCOMPLETE");
  const pendingGoalsCount = goals.filter((g) => (g.status || "").toUpperCase() === "PENDING").length;
  const finalized = completedGoalsCount + incompleteGoals.length;
  const completionRate = finalized > 0 ? Math.round((completedGoalsCount / finalized) * 100) : "N/A";

  // Filtered Goals
  const filteredGoals = goals.filter((g) => {
    if (goalFilterCouncil && g.councilId !== goalFilterCouncil) return false;
    if (goalFilterStatus && (g.status || "").toUpperCase() !== goalFilterStatus.toUpperCase()) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        g.title?.toLowerCase().includes(q) ||
        g.description?.toLowerCase().includes(q) ||
        g.assignedToName?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-semibold mb-2">
            <Shield size={14} className="text-purple-600" />
            <span>DISCO Governance & Cross-Council Command Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Campus Discipline & Accountability Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Monitor self-set goals across all councils, assign council rosters, audit evening incomplete reasons, and resolve campus blockers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadAllData}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition shadow-2xs"
            title="Refresh Data"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={() => {
              setModalFeedback("");
              setShowCreateCouncilModal(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-xs transition"
          >
            <Plus size={15} />
            <span>New Council</span>
          </button>
          <button
            onClick={() => {
              setModalFeedback("");
              setShowAssignMemberModal(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition"
          >
            <UserPlus size={15} />
            <span>Assign Member</span>
          </button>
        </div>
      </div>

      {/* Top 4 Real-time Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Councils */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Councils</span>
            <Building2 size={18} className="text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{totalCouncilsCount}</div>
          <p className="text-[11px] text-slate-500 mt-1">Under DISCO oversight</p>
        </div>

        {/* Active Coordinators */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Coordinators</span>
            <Users size={18} className="text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{totalCoordinatorsCount}</div>
          <p className="text-[11px] text-slate-500 mt-1">Across 14 campus bodies</p>
        </div>

        {/* Daily Goals Completed */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Goals Finalized</span>
            <Target size={18} className="text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {completedGoalsCount}
            <span className="text-xs font-normal text-slate-500 ml-1.5">
              / {goals.length} total
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1 text-[11px]">
            <span className="text-emerald-700 font-semibold">{completedGoalsCount} done</span>
            <span className="text-slate-300">•</span>
            <span className="text-rose-700 font-semibold">{incompleteGoals.length} missed</span>
            <span className="text-slate-300">•</span>
            <span className="text-amber-700 font-semibold">{pendingGoalsCount} pending</span>
          </div>
        </div>

        {/* Overall Completion Rate */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Completion Rate</span>
            <Sparkles size={18} className="text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {completionRate !== "N/A" ? `${completionRate}%` : "N/A"}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Daily cross-campus accountability</p>
        </div>
      </div>

      {/* Navigation Tabs for the 4 Dedicated Governance Areas */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab("goals")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === "goals"
              ? "bg-purple-600 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Target size={15} />
          <span>Goals Monitoring Board</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
            {goals.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("roster")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === "roster"
              ? "bg-purple-600 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Building2 size={15} />
          <span>Council & Roster Manager</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
            {councils.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("blockers")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === "blockers"
              ? "bg-purple-600 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <AlertTriangle size={15} />
          <span>Blocker & Issue Triage</span>
          {incompleteGoals.length > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500 text-white font-bold">
              {incompleteGoals.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("reflections")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === "reflections"
              ? "bg-purple-600 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Moon size={15} />
          <span>Evening Reflections Audit</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
            {reflections.length}
          </span>
        </button>
      </div>

      {/* TAB 1: Goals Monitoring Board */}
      {activeTab === "goals" && (
        <div className="space-y-4">
          {/* Informational Governance Notice */}
          <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-100 text-xs text-purple-950 flex items-start gap-3">
            <Shield size={18} className="text-purple-600 mt-0.5 shrink-0" />
            <div>
              <span className="font-bold">Autonomous Council Goal Framework:</span> All councils set their own monthly, weekly, and daily goals. DISCO monitors cross-campus alignment, inspects progress bars, and assists coordinators in resolving hurdles without micro-dictating their tasks.
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search goals by title, coordinator..."
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <select
                value={goalFilterCouncil}
                onChange={(e) => setGoalFilterCouncil(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-purple-600"
              >
                <option value="">All Councils</option>
                {councils.map((c) => (
                  <option key={c.councilId} value={c.councilId}>
                    {c.councilName}
                  </option>
                ))}
              </select>

              <select
                value={goalFilterStatus}
                onChange={(e) => setGoalFilterStatus(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-purple-600"
              >
                <option value="">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="COMPLETED">Completed</option>
                <option value="INCOMPLETE">Incomplete</option>
              </select>

              {(searchQuery || goalFilterCouncil || goalFilterStatus) && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setGoalFilterCouncil("");
                    setGoalFilterStatus("");
                  }}
                  className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Goals Table */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3">Goal Title & Scope</th>
                    <th className="px-5 py-3">Council</th>
                    <th className="px-5 py-3">Coordinator</th>
                    <th className="px-5 py-3">Date</th>
                    <th className="px-5 py-3 text-center">Priority</th>
                    <th className="px-5 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center text-slate-500 text-xs">
                        Loading daily goals board...
                      </td>
                    </tr>
                  ) : filteredGoals.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center text-slate-500 text-xs">
                        No goals found matching the selected filters.
                      </td>
                    </tr>
                  ) : (
                    filteredGoals.map((g) => {
                      const council = councils.find((c) => c.councilId === g.councilId);
                      const isCompleted = (g.status || "").toUpperCase() === "COMPLETED";
                      const isIncomplete = (g.status || "").toUpperCase() === "INCOMPLETE";

                      return (
                        <tr key={g.goalId} className="hover:bg-slate-50/70 transition">
                          <td className="px-5 py-3.5 max-w-xs">
                            <div className="font-semibold text-slate-900 leading-snug">{g.title}</div>
                            {g.description && (
                              <div className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                                {g.description}
                              </div>
                            )}
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-medium border border-indigo-100">
                              <Building2 size={12} />
                              <span>{council?.councilName || g.councilId || "General"}</span>
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-xs text-slate-700">
                            <span className="font-medium text-slate-800">
                              {g.assignedToName || "Coordinator"}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-xs font-mono text-slate-500">
                            {g.goalDate}
                          </td>
                          <td className="px-5 py-3.5 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                (g.priority || "").toUpperCase() === "HIGH"
                                  ? "bg-rose-50 text-rose-700 border border-rose-200"
                                  : "bg-slate-100 text-slate-700"
                              }`}
                            >
                              {g.priority || "MEDIUM"}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-center">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                                isCompleted
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : isIncomplete
                                  ? "bg-rose-50 text-rose-700 border border-rose-200"
                                  : "bg-amber-50 text-amber-700 border border-amber-200"
                              }`}
                            >
                              {isCompleted ? (
                                <CheckCircle2 size={12} />
                              ) : isIncomplete ? (
                                <XCircle size={12} />
                              ) : (
                                <Clock size={12} />
                              )}
                              <span>{g.status}</span>
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Council & Roster Manager */}
      {activeTab === "roster" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2">
            <div>
              <h2 className="text-base font-bold text-slate-900">Active Campus Councils & Roster</h2>
              <p className="text-xs text-slate-500">
                DISCO manages council designations and coordinates team member assignments.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {councils.map((c) => {
              const assignedMembers = members.filter((m) => m.councilId === c.councilId);

              return (
                <div
                  key={c.councilId}
                  className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition space-y-3 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                        <Building2 size={20} />
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full font-mono">
                        {c.councilId}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-base mt-3">{c.councilName}</h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {c.description || "Active campus operational body."}
                    </p>
                  </div>

                  <div className="border-t border-slate-100 pt-3">
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                      Coordinators ({assignedMembers.length}):
                    </span>
                    {assignedMembers.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No members assigned yet.</p>
                    ) : (
                      <div className="space-y-1">
                        {assignedMembers.map((m) => (
                          <div
                            key={m.userId}
                            className="flex items-center justify-between text-xs p-1.5 bg-slate-50 rounded-lg"
                          >
                            <span className="font-semibold text-slate-800">{m.name}</span>
                            <span className="text-[11px] text-purple-700 font-medium truncate max-w-[140px]">
                              {m.position || "Member"}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: Blocker & Issue Triage */}
      {activeTab === "blockers" && (
        <div className="space-y-4">
          <div className="p-3.5 rounded-2xl bg-rose-50/80 border border-rose-200 text-xs text-rose-950 flex items-start gap-3">
            <AlertTriangle size={18} className="text-rose-600 mt-0.5 shrink-0" />
            <div>
              <span className="font-bold">Daily Blocker Triage Center:</span> When council members mark goals as INCOMPLETE or encounter campus impediments, they appear here so DISCO can intervene, organize a sync, or resolve equipment/resource hurdles.
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">
                Active Incomplete Goals & Hurdles ({incompleteGoals.length})
              </h3>
            </div>

            {incompleteGoals.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                <CheckCircle2 size={32} className="text-emerald-500 mx-auto mb-2" />
                <p className="font-semibold text-slate-800">No unresolved blockers!</p>
                <p className="text-slate-400 mt-1">All councils are progressing cleanly with no incomplete goals flagged.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {incompleteGoals.map((g) => {
                  const council = councils.find((c) => c.councilId === g.councilId);

                  return (
                    <div key={g.goalId} className="p-4 hover:bg-slate-50/70 transition space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-bold rounded-md">
                            INCOMPLETE
                          </span>
                          <span className="font-bold text-slate-900 text-sm">{g.title}</span>
                        </div>
                        <span className="text-xs font-mono text-slate-400">{g.goalDate}</span>
                      </div>

                      <div className="text-xs text-slate-600 pl-4 border-l-2 border-rose-300">
                        <strong>Reason Logged:</strong>{" "}
                        {g.incompleteReason || "Reason not detailed during reflection."}
                      </div>

                      <div className="flex items-center justify-between pt-1 text-xs text-slate-500">
                        <span>
                          Council: <strong className="text-slate-800">{council?.councilName}</strong> • Coordinator:{" "}
                          <strong className="text-slate-800">{g.assignedToName || "Coordinator"}</strong>
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-purple-700 font-semibold bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                            DISCO Review Active
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: Evening Reflections Audit */}
      {activeTab === "reflections" && (
        <div className="space-y-4">
          <div className="p-3.5 rounded-2xl bg-indigo-50/80 border border-indigo-200 text-xs text-indigo-950 flex items-start gap-3">
            <Moon size={18} className="text-indigo-600 mt-0.5 shrink-0" />
            <div>
              <span className="font-bold">Evening Reflection Self-Audits:</span> Real-time feed of end-of-day reports submitted by council coordinators capturing daily achievements, challenges faced, learnings, and areas for improvement.
            </div>
          </div>

          <div className="space-y-3">
            {reflections.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs italic">
                No evening reflections logged yet.
              </div>
            ) : (
              reflections.map((r) => {
                const author = members.find((m) => m.userId === r.userId);
                const council = councils.find((c) => c.councilId === author?.councilId);

                return (
                  <div
                    key={r.reflectionId}
                    className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center text-xs">
                          {author?.name?.slice(0, 2).toUpperCase() || "CN"}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 text-sm block">
                            {author?.name || "Council Member"}
                          </span>
                          <span className="text-[11px] text-indigo-600 font-medium">
                            {council?.councilName || "Council Lead"} • {author?.position || "Coordinator"}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-mono text-slate-400">{r.reflectionDate}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100">
                        <strong className="text-emerald-900 block mb-1">✓ Achievements:</strong>
                        <p className="text-slate-700">{r.achievements}</p>
                      </div>

                      {r.challenges && (
                        <div className="p-3 rounded-xl bg-rose-50/60 border border-rose-100">
                          <strong className="text-rose-900 block mb-1">✕ Challenges Faced:</strong>
                          <p className="text-slate-700">{r.challenges}</p>
                        </div>
                      )}

                      {r.learnings && (
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                          <strong className="text-slate-800 block mb-1">💡 Key Learnings:</strong>
                          <p className="text-slate-700">{r.learnings}</p>
                        </div>
                      )}

                      {r.improvements && (
                        <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-100">
                          <strong className="text-purple-900 block mb-1">🚀 Planned Improvements:</strong>
                          <p className="text-slate-700">{r.improvements}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Modal 1: Create New Council */}
      {showCreateCouncilModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-6 relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setShowCreateCouncilModal(false)}
              className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                <Building2 size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Create Campus Council</h2>
                <p className="text-xs text-purple-600 font-semibold">DISCO Governance Setup</p>
              </div>
            </div>

            {modalFeedback && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {modalFeedback}
              </div>
            )}

            <form onSubmit={handleCreateCouncil} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Council Name
                </label>
                <input
                  type="text"
                  required
                  value={newCouncilName}
                  onChange={(e) => setNewCouncilName(e.target.value)}
                  placeholder="e.g. Media & Photography Council"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description / Domain Scope
                </label>
                <textarea
                  rows={3}
                  value={newCouncilDesc}
                  onChange={(e) => setNewCouncilDesc(e.target.value)}
                  placeholder="Responsibilities, objectives, and campus duties..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateCouncilModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSaving}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-xs transition disabled:opacity-50"
                >
                  {formSaving ? "Creating..." : "Create Council"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Assign Member to Council */}
      {showAssignMemberModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-6 relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setShowAssignMemberModal(false)}
              className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                <UserPlus size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Assign Member to Council</h2>
                <p className="text-xs text-slate-500 font-semibold">Update Council Roster</p>
              </div>
            </div>

            {modalFeedback && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {modalFeedback}
              </div>
            )}

            <form onSubmit={handleAssignMember} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Member
                </label>
                <select
                  required
                  value={assignUserId}
                  onChange={(e) => setAssignUserId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                >
                  {members.map((m) => (
                    <option key={m.userId} value={m.userId}>
                      {m.name} ({m.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Assign to Council
                </label>
                <select
                  required
                  value={assignCouncilId}
                  onChange={(e) => setAssignCouncilId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                >
                  {councils.map((c) => (
                    <option key={c.councilId} value={c.councilId}>
                      {c.councilName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  New Designation (Optional)
                </label>
                <input
                  type="text"
                  value={assignPosition}
                  onChange={(e) => setAssignPosition(e.target.value)}
                  placeholder="e.g. Lead Coordinator, Assistant Coordinator"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAssignMemberModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSaving}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition disabled:opacity-50"
                >
                  {formSaving ? "Updating..." : "Update Assignment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}