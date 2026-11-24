import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { goalApi, councilApi, userApi } from "../../services/api";
import {
  Target,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  Search,
  Building2,
  Calendar,
  History,
  X,
  AlertTriangle,
} from "lucide-react";

export default function CouncilGoals() {
  const [searchParams] = useSearchParams();
  const initialCouncil = searchParams.get("councilId") || "";
  const initialUser = searchParams.get("userId") || "";

  const [goals, setGoals] = useState([]);
  const [councils, setCouncils] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedCouncil, setSelectedCouncil] = useState(initialCouncil);
  const [selectedUser, setSelectedUser] = useState(initialUser);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [search, setSearch] = useState("");

  // Goal History Modal
  const [viewingGoal, setViewingGoal] = useState(null);

  const loadData = async () => {
    try {
      const [gRes, cRes, mRes] = await Promise.all([
        goalApi.getAll(),
        councilApi.getAll(),
        userApi.getAll(),
      ]);
      setGoals(gRes.data.data || []);
      setCouncils(cRes.data.data || []);
      setMembers(mRes.data.data || []);
    } catch (err) {
      console.error("Failed to load council goals:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openGoalDetails = async (goal) => {
    try {
      const res = await goalApi.getById(goal.goalId);
      setViewingGoal(res.data.data);
    } catch {
      setViewingGoal(goal);
    }
  };

  // Filter goals
  const filteredGoals = goals.filter((g) => {
    if (selectedCouncil && g.councilId !== selectedCouncil) return false;
    if (selectedUser && g.userId !== selectedUser) return false;
    if (selectedDate && g.goalDate !== selectedDate) return false;
    if (selectedStatus && (g.status || "").toUpperCase() !== selectedStatus.toUpperCase()) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        g.title?.toLowerCase().includes(q) ||
        g.description?.toLowerCase().includes(q) ||
        g.memberName?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Group filtered goals by Council
  const goalsByCouncil = councils.map((council) => {
    const councilGoals = filteredGoals.filter((g) => g.councilId === council.councilId);
    return {
      council,
      goals: councilGoals,
    };
  }).filter((group) => {
    // If a council filter is selected, only show that council; else show councils that match
    if (selectedCouncil) return group.council.councilId === selectedCouncil;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Council Goals Dashboard</h1>
          <p className="text-xs text-slate-500 mt-1">
            Section Two • Council-wise visibility into daily goals, completion statuses, and audit histories.
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search goal title, description, member..."
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600"
          />
        </div>

        {/* Council Filter */}
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

        {/* Member Filter */}
        <select
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
          className="px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
        >
          <option value="">All Members</option>
          {members
            .filter((m) => (m.role || "").toUpperCase() === "COUNCIL")
            .map((m) => (
              <option key={m.userId} value={m.userId}>
                {m.name} ({m.councilName})
              </option>
            ))}
        </select>

        {/* Date Filter */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-xl bg-white text-xs">
          <Calendar size={14} className="text-slate-400" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="text-xs text-slate-700 focus:outline-none"
          />
        </div>

        {/* Status Filter */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
        >
          <option value="">All Statuses</option>
          <option value="COMPLETED">Completed (✓)</option>
          <option value="INCOMPLETE">Incomplete (✕)</option>
          <option value="PENDING">Pending (●)</option>
        </select>

        {(selectedCouncil || selectedUser || selectedDate || selectedStatus || search) && (
          <button
            onClick={() => {
              setSelectedCouncil("");
              setSelectedUser("");
              setSelectedDate("");
              setSelectedStatus("");
              setSearch("");
            }}
            className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
          >
            Reset
          </button>
        )}
      </div>

      {/* Council-wise Goal Cards (PRD Section 4.2 Example) */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500">Loading goals...</div>
      ) : goalsByCouncil.length === 0 ? (
        <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
          No goals found matching your filters.
        </div>
      ) : (
        <div className="space-y-6">
          {goalsByCouncil.map(({ council, goals: cGoals }) => {
            const completedCount = cGoals.filter((g) => (g.status || "").toUpperCase() === "COMPLETED").length;
            const incompleteCount = cGoals.filter((g) => (g.status || "").toUpperCase() === "INCOMPLETE").length;
            const pendingCount = cGoals.filter((g) => (g.status || "").toUpperCase() === "PENDING").length;

            return (
              <div
                key={council.councilId}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden"
              >
                {/* Council Card Header */}
                <div className="p-5 bg-gradient-to-r from-slate-50 to-indigo-50/30 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                      <Building2 size={20} />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-slate-900">{council.councilName}</h2>
                      <p className="text-xs text-slate-500">{council.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                      ✓ {completedCount} Completed
                    </span>
                    <span className="font-semibold px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200">
                      ✕ {incompleteCount} Incomplete
                    </span>
                    <span className="font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
                      ● {pendingCount} Pending
                    </span>
                  </div>
                </div>

                {/* Goals Table for this council */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider font-semibold border-b border-slate-200">
                      <tr>
                        <th className="px-5 py-3">Member</th>
                        <th className="px-5 py-3">Goal Title & Description</th>
                        <th className="px-5 py-3 text-center">Date</th>
                        <th className="px-5 py-3 text-center">Priority</th>
                        <th className="px-5 py-3 text-center">Status</th>
                        <th className="px-5 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {cGoals.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-5 py-6 text-center text-slate-400 text-xs italic">
                            No goals found for this council under selected criteria.
                          </td>
                        </tr>
                      ) : (
                        cGoals.map((g) => {
                          const statusUpper = (g.status || "").toUpperCase();
                          return (
                            <tr key={g.goalId} className="hover:bg-slate-50/70 transition">
                              <td className="px-5 py-3.5 whitespace-nowrap">
                                <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                                  {g.isStudentDelegate ? (
                                    <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                                      Student
                                    </span>
                                  ) : null}
                                  <span>{g.assignedToName || g.memberName}</span>
                                </div>
                                {g.assignedByName && g.assignedByName !== (g.assignedToName || g.memberName) && (
                                  <div className="text-[10px] text-indigo-600 font-semibold mt-0.5">
                                    By: {g.assignedByName}
                                  </div>
                                )}
                                {g.isOnLeave && (
                                  <div className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 mt-1 inline-block">
                                    🏖️ On Leave: {g.leaveDays || "1"}d ({g.leaveStartDate && g.leaveEndDate ? `${g.leaveStartDate} to ${g.leaveEndDate}` : ""})
                                  </div>
                                )}
                                <div className="text-[10px] text-slate-400 mt-0.5">{g.userId}</div>
                              </td>
                              <td className="px-5 py-3.5 max-w-md">
                                <p className="font-semibold text-slate-900 leading-snug">{g.title}</p>
                                <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{g.description}</p>
                                {statusUpper === "INCOMPLETE" && g.incompleteReason && (
                                  <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 text-[11px] font-medium border border-rose-100">
                                    <AlertTriangle size={12} />
                                    <span>Reason: {g.incompleteReason}</span>
                                  </div>
                                )}
                              </td>
                              <td className="px-5 py-3.5 text-center text-xs text-slate-600 whitespace-nowrap">
                                {g.goalDate}
                              </td>
                              <td className="px-5 py-3.5 text-center whitespace-nowrap">
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                    (g.priority || "").toUpperCase() === "HIGH"
                                      ? "bg-rose-50 text-rose-700"
                                      : (g.priority || "").toUpperCase() === "MEDIUM"
                                      ? "bg-amber-50 text-amber-700"
                                      : "bg-slate-100 text-slate-700"
                                  }`}
                                >
                                  {g.priority}
                                </span>
                              </td>
                              <td className="px-5 py-3.5 text-center whitespace-nowrap">
                                {statusUpper === "COMPLETED" ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    <CheckCircle2 size={13} />
                                    <span>Completed</span>
                                  </span>
                                ) : statusUpper === "INCOMPLETE" ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                                    <XCircle size={13} />
                                    <span>Incomplete</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                                    <Clock size={13} />
                                    <span>Pending</span>
                                  </span>
                                )}
                              </td>
                              <td className="px-5 py-3.5 text-right whitespace-nowrap">
                                <button
                                  onClick={() => openGoalDetails(g)}
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 transition"
                                >
                                  <History size={14} />
                                  <span>History</span>
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
            );
          })}
        </div>
      )}

      {/* Goal Details & Status History Modal */}
      {viewingGoal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg p-6 relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setViewingGoal(null)}
              className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1 flex-wrap">
              <span>{viewingGoal.councilName}</span>
              <span>•</span>
              <span>Assigned to: {viewingGoal.assignedToName || viewingGoal.memberName}</span>
              {viewingGoal.assignedByName && (
                <>
                  <span>•</span>
                  <span>Assigned by: {viewingGoal.assignedByName}</span>
                </>
              )}
            </div>
            <h2 className="text-xl font-bold text-slate-900">{viewingGoal.title}</h2>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">{viewingGoal.description}</p>

            {viewingGoal.expectedOutcome && (
              <div className="mt-3 p-3 bg-indigo-50/60 rounded-xl text-xs text-slate-700">
                <span className="font-semibold block text-indigo-900">Expected Outcome:</span>
                <span>{viewingGoal.expectedOutcome}</span>
              </div>
            )}

            <div className="mt-4 grid grid-cols-3 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 block font-medium">Date</span>
                <span className="font-semibold text-slate-800">{viewingGoal.goalDate}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Priority</span>
                <span className="font-semibold text-slate-800">{viewingGoal.priority}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Status</span>
                <span className="font-bold text-slate-800">{viewingGoal.status}</span>
              </div>
            </div>

            {viewingGoal.incompleteReason && (
              <div className="mt-3 p-3 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-800">
                <span className="font-bold block">Incomplete Explanation:</span>
                <span>{viewingGoal.incompleteReason}</span>
              </div>
            )}

            {viewingGoal.isOnLeave && (
              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <span>🏖️ Council Member On Leave ({viewingGoal.leaveDays || "1"} Day(s))</span>
                </div>
                <p className="text-[11px] text-amber-800">
                  <strong>Duration:</strong> {viewingGoal.leaveStartDate || "N/A"} to {viewingGoal.leaveEndDate || "N/A"}
                </p>
                {viewingGoal.leaveReason && (
                  <p className="text-[11px] text-amber-800">
                    <strong>Reason:</strong> {viewingGoal.leaveReason}
                  </p>
                )}
                {viewingGoal.assignedToName && (
                  <p className="text-[11px] text-amber-800">
                    <strong>Handover to Student:</strong> {viewingGoal.assignedToName}
                  </p>
                )}
              </div>
            )}

            {/* Audit History Timeline */}
            <div className="mt-5 pt-4 border-t border-slate-200">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <History size={14} className="text-indigo-600" />
                <span>Goal Status Audit History</span>
              </h3>

              {viewingGoal.history?.length > 0 ? (
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {viewingGoal.history.map((h, i) => (
                    <div
                      key={h.historyId || i}
                      className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    >
                      <div className="flex items-center justify-between font-semibold text-slate-800">
                        <span>{h.oldStatus || "INITIAL"} → {h.newStatus}</span>
                        <span className="text-[10px] text-slate-400 font-normal">
                          {new Date(h.changedAt).toLocaleString("en-IN")}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{h.action}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No historical status modifications recorded.</p>
              )}
            </div>

            <div className="mt-6 text-right">
              <button
                type="button"
                onClick={() => setViewingGoal(null)}
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
