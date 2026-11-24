import { useState, useEffect } from "react";
import { goalApi, councilApi } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { GoalSuggestionCard } from "../../components/ai/AiInsightCard";
import {
  Target,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  Edit2,
  X,
  AlertCircle,
  Filter,
  Sparkles,
  UserCheck,
  Send,
} from "lucide-react";

export default function DailyGoals() {
  const { user } = useAuth();
  const [goals, setGoals] = useState([]);
  const [councilPeers, setCouncilPeers] = useState([]);
  const [loading, setLoading] = useState(true);

  const todayStr = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [statusFilter, setStatusFilter] = useState("");
  const [scopeFilter, setScopeFilter] = useState("all");

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [expectedOutcome, setExpectedOutcome] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [goalDate, setGoalDate] = useState(todayStr);
  const [assignedTo, setAssignedTo] = useState("");
  const [assignMode, setAssignMode] = useState("SELF"); // "SELF" | "COUNCIL" | "STUDENT"
  const [studentName, setStudentName] = useState("");
  const [isOnLeave, setIsOnLeave] = useState(false);
  const [leaveStartDate, setLeaveStartDate] = useState(todayStr);
  const [leaveEndDate, setLeaveEndDate] = useState(todayStr);
  const [leaveDays, setLeaveDays] = useState(1);
  const [leaveReason, setLeaveReason] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // Status Change Modal (for quick status update with reason if incomplete)
  const [statusGoal, setStatusGoal] = useState(null);
  const [targetStatus, setTargetStatus] = useState("COMPLETED");
  const [incompleteReason, setIncompleteReason] = useState("");

  // AI Suggestions state
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const updateLeaveDuration = (start, end) => {
    if (start && end) {
      const d1 = new Date(start);
      const d2 = new Date(end);
      const diffTime = d2.getTime() - d1.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 3600 * 24)) + 1;
      setLeaveDays(diffDays > 0 ? diffDays : 1);
    }
  };

  // Fetch peers in same council
  useEffect(() => {
    async function fetchCouncilPeers() {
      if (user?.councilId) {
        try {
          const cRes = await councilApi.getById(user.councilId);
          setCouncilPeers(cRes.data.data?.members || []);
        } catch (e) {
          console.error("Failed to fetch council peers:", e);
        }
      }
    }
    fetchCouncilPeers();
  }, [user?.councilId]);

  const loadGoals = async () => {
    try {
      const res = await goalApi.getMy({
        goalDate: selectedDate,
        status: statusFilter,
        scope: scopeFilter !== "all" ? scopeFilter : undefined,
      });
      setGoals(res.data.data || []);
    } catch (err) {
      console.error("Failed to load goals:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGoals();
  }, [selectedDate, statusFilter, scopeFilter]);

  const openAdd = () => {
    setEditingGoal(null);
    setTitle("");
    setDescription("");
    setExpectedOutcome("");
    setPriority("MEDIUM");
    setGoalDate(selectedDate || todayStr);
    setAssignMode("SELF");
    setAssignedTo(user?.userId || "");
    setStudentName("");
    setIsOnLeave(false);
    setLeaveStartDate(selectedDate || todayStr);
    setLeaveEndDate(selectedDate || todayStr);
    setLeaveDays(1);
    setLeaveReason("");
    setError("");
    setShowAddModal(true);
  };

  const openEdit = (g) => {
    setEditingGoal(g);
    setTitle(g.title);
    setDescription(g.description);
    setExpectedOutcome(g.expectedOutcome || "");
    setPriority(g.priority || "MEDIUM");
    setGoalDate(g.goalDate);
    if (g.isStudentDelegate) {
      setAssignMode("STUDENT");
      setStudentName(g.assignedToName || "");
      setAssignedTo(user?.userId || "");
    } else if (g.assignedTo && g.assignedTo !== user?.userId) {
      setAssignMode("COUNCIL");
      setAssignedTo(g.assignedTo);
      setStudentName("");
    } else {
      setAssignMode("SELF");
      setAssignedTo(user?.userId || "");
      setStudentName("");
    }
    setIsOnLeave(Boolean(g.isOnLeave));
    setLeaveStartDate(g.leaveStartDate || g.goalDate || todayStr);
    setLeaveEndDate(g.leaveEndDate || g.goalDate || todayStr);
    setLeaveDays(g.leaveDays ? parseInt(g.leaveDays, 10) || 1 : 1);
    setLeaveReason(g.leaveReason || "");
    setError("");
    setShowAddModal(true);
  };

  const handleSaveGoal = async (e) => {
    e.preventDefault();
    setError("");

    if (assignMode === "STUDENT" && !studentName.trim()) {
      setError("Please write the student's name to assign this goal.");
      return;
    }

    if (isOnLeave && !leaveReason.trim()) {
      setError("Please specify the reason for council member leave.");
      return;
    }

    setSaving(true);

    try {
      let finalAssignedTo = user?.userId;
      let finalAssignedToName = user?.name || "Self";

      if (assignMode === "STUDENT") {
        finalAssignedToName = studentName.trim();
        finalAssignedTo = user?.userId;
      } else if (assignMode === "COUNCIL" && assignedTo) {
        const peer = councilPeers.find((p) => p.userId === assignedTo);
        finalAssignedToName = peer?.name || "Council Member";
        finalAssignedTo = assignedTo;
      }

      const payload = {
        title,
        description,
        expectedOutcome,
        priority,
        goalDate,
        assignedTo: finalAssignedTo,
        assignedToName: finalAssignedToName,
        isOnLeave,
        leaveStartDate: isOnLeave ? leaveStartDate : "",
        leaveEndDate: isOnLeave ? leaveEndDate : "",
        leaveDays: isOnLeave ? leaveDays : "",
        leaveReason: isOnLeave ? leaveReason.trim() : "",
      };

      if (editingGoal) {
        await goalApi.update(editingGoal.goalId, payload);
      } else {
        await goalApi.create(payload);
      }
      setShowAddModal(false);
      await loadGoals();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save goal");
    } finally {
      setSaving(false);
    }
  };

  const openQuickStatus = (goal, newStatus) => {
    setStatusGoal(goal);
    setTargetStatus(newStatus);
    setIncompleteReason(goal.incompleteReason || "");
  };

  const handleConfirmStatus = async (e) => {
    e.preventDefault();
    if (!statusGoal) return;
    if (targetStatus === "INCOMPLETE" && !incompleteReason.trim()) {
      alert("Please provide a reason why this goal was incomplete.");
      return;
    }

    setUpdatingStatus(true);
    try {
      await goalApi.updateStatus(statusGoal.goalId, {
        status: targetStatus,
        incompleteReason: targetStatus === "INCOMPLETE" ? incompleteReason.trim() : "",
      });
      setStatusGoal(null);
      await loadGoals();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Daily Goals</h1>
          <p className="text-xs text-slate-500 mt-1">
            Create daily goals, set priorities, and update task statuses before evening reflection.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition"
        >
          <Plus size={16} />
          <span>Add New Goal</span>
        </button>
      </div>

      {/* Date & Status Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
            <Calendar size={15} className="text-indigo-600" />
            <span>Select Date:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
          </div>

          <button
            onClick={() => setSelectedDate(todayStr)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition ${
              selectedDate === todayStr
                ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Today
          </button>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={scopeFilter}
            onChange={(e) => setScopeFilter(e.target.value)}
            className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 font-medium"
          >
            <option value="all">All Goals (Mine + Assigned)</option>
            <option value="assigned_to_me">Assigned to Me</option>
            <option value="assigned_by_me">Assigned by Me to Others</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending (●)</option>
            <option value="COMPLETED">Completed (✓)</option>
            <option value="INCOMPLETE">Incomplete (✕)</option>
          </select>
        </div>
      </div>

      {/* AI Goal Suggestions */}
      <div className="flex justify-end">
        <button
          onClick={async () => {
            if (showSuggestions) { setShowSuggestions(false); return; }
            setShowSuggestions(true);
            setLoadingSuggestions(true);
            try {
              const res = await goalApi.getSuggestions();
              setAiSuggestions(res.data.data || []);
            } catch (e) {
              setAiSuggestions([]);
            } finally {
              setLoadingSuggestions(false);
            }
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-xs transition"
        >
          <Sparkles size={14} />
          <span>{showSuggestions ? "Hide" : "✨ AI Suggest Goals"}</span>
        </button>
      </div>

      {showSuggestions && (
        <GoalSuggestionCard
          suggestions={aiSuggestions}
          loading={loadingSuggestions}
          onSelect={(s) => {
            setTitle(s.title);
            setPriority(s.priority);
            setDescription(s.description);
            setShowAddModal(true);
            setShowSuggestions(false);
          }}
        />
      )}

      {/* Goals List (PRD Section 5.2 Table) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-500">Loading your goals...</div>
          ) : goals.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-sm font-semibold text-slate-800">No goals found for {selectedDate}</p>
              <p className="text-xs text-slate-500 mt-1">Start by adding your planned commitments for the day.</p>
              <button
                onClick={openAdd}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition"
              >
                <Plus size={15} />
                <span>Add Goal for {selectedDate}</span>
              </button>
            </div>
          ) : (
            goals.map((g) => {
              const statusUpper = (g.status || "").toUpperCase();
              return (
                <div key={g.goalId} className="p-5 hover:bg-slate-50/70 transition">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            (g.priority || "").toUpperCase() === "HIGH"
                              ? "bg-rose-50 text-rose-700"
                              : (g.priority || "").toUpperCase() === "MEDIUM"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {g.priority} PRIORITY
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-xs text-slate-400">{g.goalDate}</span>

                        {/* Assignment Details */}
                        {g.isStudentDelegate ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                            🎓 Student: {g.assignedToName}
                          </span>
                        ) : g.isAssignedByMe ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                            <Send size={11} />
                            <span>Assigned to: {g.assignedToName}</span>
                          </span>
                        ) : g.assignedByName && g.assignedByName !== (user?.name || "Self") && g.assignedByName !== g.assignedToName ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                            <UserCheck size={11} />
                            <span>Assigned by: {g.assignedByName}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-50 text-slate-600 border border-slate-200">
                            <span>Self-Assigned</span>
                          </span>
                        )}

                        {/* Leave Info */}
                        {g.isOnLeave && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300">
                            🏖️ On Leave: {g.leaveDays || "1"} day(s) {g.leaveStartDate && g.leaveEndDate ? `(${g.leaveStartDate} to ${g.leaveEndDate})` : ""} {g.leaveReason ? `• ${g.leaveReason}` : ""}
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-slate-900 leading-snug">{g.title}</h3>
                      <p className="text-xs text-slate-600 leading-relaxed">{g.description}</p>

                      {g.expectedOutcome && (
                        <p className="text-xs text-indigo-700 bg-indigo-50/70 p-2 rounded-lg inline-block">
                          <strong className="text-indigo-900">Outcome:</strong> {g.expectedOutcome}
                        </p>
                      )}

                      {statusUpper === "INCOMPLETE" && g.incompleteReason && (
                        <div className="p-2 rounded-lg bg-rose-50 border border-rose-100 text-xs text-rose-700">
                          <strong>Reason for Incomplete:</strong> {g.incompleteReason}
                        </div>
                      )}
                    </div>

                    {/* Status & Actions */}
                    <div className="flex flex-col items-end gap-3 flex-shrink-0">
                      <div className="flex items-center gap-2">
                        {statusUpper === "COMPLETED" ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 size={14} />
                            <span>Completed</span>
                          </span>
                        ) : statusUpper === "INCOMPLETE" ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            <XCircle size={14} />
                            <span>Incomplete</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                            <Clock size={14} />
                            <span>Pending</span>
                          </span>
                        )}

                        <button
                          onClick={() => openEdit(g)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                          title="Edit Goal"
                        >
                          <Edit2 size={15} />
                        </button>
                      </div>

                      {/* Quick Status Buttons */}
                      <div className="flex items-center gap-1.5 text-xs">
                        <button
                          onClick={() => openQuickStatus(g, "COMPLETED")}
                          disabled={statusUpper === "COMPLETED"}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium transition disabled:opacity-40"
                        >
                          Mark Completed
                        </button>
                        <button
                          onClick={() => openQuickStatus(g, "INCOMPLETE")}
                          disabled={statusUpper === "INCOMPLETE"}
                          className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-medium transition disabled:opacity-40"
                        >
                          Mark Incomplete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Add / Edit Goal Modal */}
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
              {editingGoal ? "Edit Daily Goal" : "Create Daily Goal"}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Add your planned commitment. Version 2.0 strictly supports daily goals.
            </p>

            {error && (
              <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSaveGoal} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Goal Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Conduct morning circle and house alignment"
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Description *</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What specific tasks are required to accomplish this goal?"
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Expected Outcome (Optional)</label>
                <input
                  type="text"
                  value={expectedOutcome}
                  onChange={(e) => setExpectedOutcome(e.target.value)}
                  placeholder="e.g. Clean timeline sheet approved by lead"
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Priority *</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  >
                    <option value="HIGH">High Priority</option>
                    <option value="MEDIUM">Medium Priority</option>
                    <option value="LOW">Low Priority</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Goal Date *</label>
                  <input
                    type="date"
                    required
                    value={goalDate}
                    onChange={(e) => setGoalDate(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
              </div>

              {/* Assignment Mode: Self, Council Member, Any Student */}
              <div className="space-y-2 pt-1 border-t border-slate-100">
                <label className="block text-xs font-semibold text-slate-700">Assign / Delegate Goal To</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => { setAssignMode("SELF"); setStudentName(""); setAssignedTo(user?.userId || ""); }}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border transition text-center ${
                      assignMode === "SELF"
                        ? "bg-indigo-50 border-indigo-300 text-indigo-700 shadow-xs"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    👤 Myself
                  </button>
                  <button
                    type="button"
                    onClick={() => { setAssignMode("COUNCIL"); setStudentName(""); }}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border transition text-center ${
                      assignMode === "COUNCIL"
                        ? "bg-indigo-50 border-indigo-300 text-indigo-700 shadow-xs"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    🏛️ Council Peer
                  </button>
                  <button
                    type="button"
                    onClick={() => { setAssignMode("STUDENT"); setAssignedTo(""); }}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border transition text-center ${
                      assignMode === "STUDENT"
                        ? "bg-purple-50 border-purple-300 text-purple-700 shadow-xs"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    🎓 Any Student
                  </button>
                </div>

                {/* If Council Member */}
                {assignMode === "COUNCIL" && (
                  <div className="mt-2">
                    <select
                      value={assignedTo}
                      onChange={(e) => setAssignedTo(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 font-medium"
                    >
                      <option value="">Select Council Member...</option>
                      {councilPeers
                        .filter((p) => p.userId !== user?.userId)
                        .map((p) => (
                          <option key={p.userId} value={p.userId}>
                            {p.name} ({p.position || "Member"})
                          </option>
                        ))}
                    </select>
                  </div>
                )}

                {/* If Any Student - Write Name */}
                {assignMode === "STUDENT" && (
                  <div className="mt-2 space-y-1">
                    <input
                      type="text"
                      required
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder="Student ka naam likhein (e.g. Amit Kumar, Suman Sahu)"
                      className="w-full px-3 py-2 border border-purple-300 rounded-xl text-xs text-slate-900 bg-purple-50/30 focus:outline-none focus:ring-2 focus:ring-purple-600 font-medium"
                    />
                    <p className="text-[11px] text-purple-600">
                      Koi bhi student ho sakta hai — uska naam likh kar assign kar dein.
                    </p>
                  </div>
                )}
              </div>

              {/* Council Member Leave Section */}
              <div className="p-3.5 bg-amber-50/70 border border-amber-200/90 rounded-xl space-y-3">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isOnLeave}
                    onChange={(e) => setIsOnLeave(e.target.checked)}
                    className="w-4 h-4 text-amber-600 rounded-md focus:ring-amber-500 border-amber-300"
                  />
                  <span className="text-xs font-bold text-amber-900">
                    🏖️ Council Member Going on Leave (Kitne Din Ke Liye Jaa Rahe Hain)
                  </span>
                </label>

                {isOnLeave && (
                  <div className="space-y-3 pt-2 border-t border-amber-200/60 animate-in fade-in">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-amber-900">Leave From Date *</label>
                        <input
                          type="date"
                          value={leaveStartDate}
                          onChange={(e) => {
                            setLeaveStartDate(e.target.value);
                            updateLeaveDuration(e.target.value, leaveEndDate);
                          }}
                          className="mt-1 block w-full px-2.5 py-1.5 border border-amber-300 rounded-lg text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-amber-900">Leave To Date *</label>
                        <input
                          type="date"
                          value={leaveEndDate}
                          onChange={(e) => {
                            setLeaveEndDate(e.target.value);
                            updateLeaveDuration(leaveStartDate, e.target.value);
                          }}
                          className="mt-1 block w-full px-2.5 py-1.5 border border-amber-300 rounded-lg text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between bg-white/80 p-2.5 rounded-lg border border-amber-200">
                      <span className="text-xs font-semibold text-amber-900">Kitne din ke liye jaa rahe hain:</span>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-900">
                        {leaveDays} Day(s) Leave
                      </span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-amber-900">Reason for Leave *</label>
                      <input
                        type="text"
                        value={leaveReason}
                        onChange={(e) => setLeaveReason(e.target.value)}
                        placeholder="e.g. Home Visit, Exam Preparation, Medical Emergency"
                        className="mt-1 block w-full px-2.5 py-1.5 border border-amber-300 rounded-lg text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>
                )}
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
                  {saving ? "Saving..." : editingGoal ? "Save Changes" : "Save Goal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Status Modal (reason requirement for Incomplete) */}
      {statusGoal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-6 relative">
            <button
              onClick={() => setStatusGoal(null)}
              className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X size={18} />
            </button>

            <h2 className="text-base font-bold text-slate-900">
              Update Goal Status: <span className="text-indigo-600">{targetStatus}</span>
            </h2>
            <p className="text-xs text-slate-600 mt-1">Goal: {statusGoal.title}</p>

            <form onSubmit={handleConfirmStatus} className="mt-4 space-y-4">
              {targetStatus === "INCOMPLETE" && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Why could you not complete this goal? <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={incompleteReason}
                    onChange={(e) => setIncompleteReason(e.target.value)}
                    placeholder="Provide a clear explanation for incomplete status..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    PRD Requirement: Incomplete goals require an explanation.
                  </p>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStatusGoal(null)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingStatus}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition disabled:opacity-50"
                >
                  {updatingStatus ? "Updating..." : "Confirm Status"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
