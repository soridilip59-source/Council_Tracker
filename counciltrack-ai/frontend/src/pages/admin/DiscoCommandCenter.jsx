import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { goalApi, councilApi, userApi, leaveApi, analyticsApi } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import {
  Crown,
  Target,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Calendar,
  Building2,
  Users,
  Plus,
  RefreshCw,
  AlertTriangle,
  History,
  X,
  Send,
  Layers,
  ChevronDown,
} from "lucide-react";

// ============================================================================
// 1. REUSABLE SUB-COMPONENTS (Company Standard & Modular)
// ============================================================================

/**
 * Reusable Metric KPI Card
 */
function MetricCard({ title, value, subtitle, icon: Icon, color, trend }) {
  const colorMap = {
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    rose: "bg-rose-50 text-rose-600 border-rose-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</span>
        <div className={`p-2.5 rounded-xl border ${colorMap[color] || colorMap.indigo}`}>
          <Icon size={18} />
        </div>
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-bold text-slate-900 tracking-tight">{value}</span>
        {trend && (
          <span className="text-xs font-medium text-emerald-600 flex items-center">
            {trend}
          </span>
        )}
      </div>
      {subtitle && <p className="text-[11px] text-slate-500 mt-1">{subtitle}</p>}
    </div>
  );
}

/**
 * Reusable Status Badge
 */
function StatusBadge({ status }) {
  const norm = (status || "").toUpperCase();
  if (norm === "COMPLETED") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
        <CheckCircle2 size={12} className="text-emerald-600" />
        Completed
      </span>
    );
  }
  if (norm === "INCOMPLETE") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200/80">
        <XCircle size={12} className="text-rose-600" />
        Incomplete
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/80">
      <Clock size={12} className="text-amber-600" />
      Pending
    </span>
  );
}

/**
 * Reusable Priority Badge
 */
function PriorityBadge({ priority }) {
  const norm = (priority || "").toUpperCase();
  if (norm === "HIGH") {
    return (
      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-800 tracking-wide uppercase">
        High
      </span>
    );
  }
  if (norm === "LOW") {
    return (
      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700 tracking-wide uppercase">
        Low
      </span>
    );
  }
  return (
    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-100 text-blue-800 tracking-wide uppercase">
      Medium
    </span>
  );
}

// ============================================================================
// 2. MAIN COMPONENT: DISCO COMMAND CENTER
// ============================================================================

export default function DiscoCommandCenter() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Primary Data State (100% Dynamic, no mock arrays)
  const [goals, setGoals] = useState([]);
  const [councils, setCouncils] = useState([]);
  const [members, setMembers] = useState([]);
  const [activeLeaves, setActiveLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Active Filters
  const [selectedCouncil, setSelectedCouncil] = useState(searchParams.get("councilId") || "");
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get("status") || "");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("all"); // 'all', 'blockers', 'directives'

  // Modals State
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [historyGoal, setHistoryGoal] = useState(null);
  const [actionSuccess, setActionSuccess] = useState("");

  // Assign Goal Form State
  const [assignForm, setAssignForm] = useState({
    councilId: "",
    assignedTo: "",
    assignedToName: "",
    title: "",
    description: "",
    expectedOutcome: "",
    priority: "HIGH",
    goalDate: new Date().toISOString().slice(0, 10),
  });
  const [submittingGoal, setSubmittingGoal] = useState(false);
  const [formError, setFormError] = useState("");

  // Load all primary data from backend APIs
  const fetchData = async () => {
    try {
      const [goalsRes, councilsRes, usersRes, leavesRes] = await Promise.all([
        goalApi.getAll(),
        councilApi.getAll(),
        userApi.getAll(),
        leaveApi.getActive().catch(() => ({ data: { data: [] } })),
      ]);

      setGoals(goalsRes.data?.data || []);
      setCouncils(councilsRes.data?.data || []);
      setMembers(usersRes.data?.data || []);
      setActiveLeaves(leavesRes.data?.data || []);
    } catch (err) {
      console.error("[DISCO Portal] Data fetch failed:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // Helper maps for O(1) lookups
  const councilMap = useMemo(() => {
    return new Map(councils.map((c) => [c.councilId, c.councilName]));
  }, [councils]);

  const memberMap = useMemo(() => {
    return new Map(members.map((m) => [m.userId, m]));
  }, [members]);

  // Derived Filtered Goals
  const filteredGoals = useMemo(() => {
    return goals.filter((g) => {
      // Council filter
      if (selectedCouncil && g.councilId !== selectedCouncil) return false;
      // Status filter
      if (selectedStatus && (g.status || "").toUpperCase() !== selectedStatus.toUpperCase()) return false;
      // Date filter (if set)
      if (selectedDate && g.goalDate !== selectedDate) return false;
      // View Mode filter
      if (viewMode === "blockers" && (g.status || "").toUpperCase() !== "INCOMPLETE") return false;
      if (viewMode === "directives" && !g.assignedByName?.toLowerCase().includes("disco") && !g.title?.toLowerCase().includes("campus")) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = g.title?.toLowerCase().includes(q);
        const descMatch = g.description?.toLowerCase().includes(q);
        const nameMatch = g.assignedToName?.toLowerCase().includes(q) || g.memberName?.toLowerCase().includes(q);
        const councilNameMatch = councilMap.get(g.councilId)?.toLowerCase().includes(q);
        if (!titleMatch && !descMatch && !nameMatch && !councilNameMatch) return false;
      }
      return true;
    });
  }, [goals, selectedCouncil, selectedStatus, selectedDate, viewMode, searchQuery, councilMap]);

  // Dynamic KPI Calculations
  const metrics = useMemo(() => {
    const total = goals.length;
    const completed = goals.filter((g) => (g.status || "").toUpperCase() === "COMPLETED").length;
    const incomplete = goals.filter((g) => (g.status || "").toUpperCase() === "INCOMPLETE").length;
    const pending = goals.filter((g) => (g.status || "").toUpperCase() === "PENDING").length;
    const rate = completed + incomplete > 0 ? Math.round((completed / (completed + incomplete)) * 100) : 0;

    return {
      total,
      completed,
      incomplete,
      pending,
      rate,
      activeCouncils: councils.length,
      leavesCount: activeLeaves.length,
    };
  }, [goals, councils, activeLeaves]);

  // Handle Council change in Assign Modal
  const handleAssignCouncilChange = (cId) => {
    const firstMember = members.find((m) => m.councilId === cId && (m.role || "").toUpperCase() === "COUNCIL");
    setAssignForm((prev) => ({
      ...prev,
      councilId: cId,
      assignedTo: firstMember?.userId || "",
      assignedToName: firstMember?.name || "",
    }));
  };

  // Submit Direct Goal by DISCO
  const handleCreateAssignedGoal = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!assignForm.councilId) {
      setFormError("Please select a target council.");
      return;
    }
    if (!assignForm.title.trim()) {
      setFormError("Goal title is required.");
      return;
    }

    try {
      setSubmittingGoal(true);
      const payload = {
        ...assignForm,
        assignedByName: user?.name ? `${user.name} (DISCO Lead)` : "DISCO Lead",
        description: assignForm.description || assignForm.title,
      };

      const res = await goalApi.create(payload);
      if (res.data?.success || res.status === 201 || res.status === 200) {
        setIsAssignModalOpen(false);
        setActionSuccess("Goal successfully assigned to council coordinator!");
        setTimeout(() => setActionSuccess(""), 4000);
        // Reset form
        setAssignForm({
          councilId: "",
          assignedTo: "",
          assignedToName: "",
          title: "",
          description: "",
          expectedOutcome: "",
          priority: "HIGH",
          goalDate: new Date().toISOString().slice(0, 10),
        });
        fetchData();
      }
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || "Failed to assign goal");
    } finally {
      setSubmittingGoal(false);
    }
  };

  // View Goal Audit History
  const handleOpenHistory = async (goal) => {
    try {
      const res = await goalApi.getById(goal.goalId);
      setHistoryGoal(res.data?.data || goal);
    } catch {
      setHistoryGoal(goal);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-3 border-indigo-600 border-t-transparent" />
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Loading DISCO Command Center...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 1. EXECUTIVE HEADER & ACTIONS                                       */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold mb-3">
              <Crown size={14} className="text-amber-400" />
              Chief Discipline Coordinator (DISCO) Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              DISCO Command & Execution Center
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1.5 max-w-2xl leading-relaxed">
              Centralized oversight across all 14 NavGurukul Dantewada Councils. Triage blockers, assign daily directives, and enforce campus-wide accountability.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-all border border-white/10"
              title="Refresh Live Data"
            >
              <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
              {refreshing ? "Refreshing..." : "Sync Live"}
            </button>

            <button
              onClick={() => setIsAssignModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all"
            >
              <Plus size={16} />
              Assign Direct Goal
            </button>
          </div>
        </div>

        {/* Success Alert Banner */}
        {actionSuccess && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 2. REUSABLE METRICS GRID (Dynamic calculations)                    */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Active Councils"
          value={metrics.activeCouncils}
          subtitle="Monitored by DISCO"
          icon={Building2}
          color="indigo"
        />
        <MetricCard
          title="Total Goals Logged"
          value={metrics.total}
          subtitle={`${metrics.pending} pending execution`}
          icon={Target}
          color="amber"
        />
        <MetricCard
          title="Completion Rate"
          value={`${metrics.rate}%`}
          subtitle={`${metrics.completed} completed ✓`}
          icon={CheckCircle2}
          color="emerald"
          trend={metrics.rate >= 75 ? "Optimal" : "Needs Review"}
        />
        <MetricCard
          title="Blockers & Incomplete"
          value={metrics.incomplete}
          subtitle={`${metrics.leavesCount} members on leave`}
          icon={AlertTriangle}
          color={metrics.incomplete > 0 ? "rose" : "slate"}
        />
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 3. FILTER TOOLBAR & QUICK TABS                                      */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
        {/* View Mode Toggle Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === "all"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              All Goals ({goals.length})
            </button>
            <button
              onClick={() => setViewMode("blockers")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                viewMode === "blockers"
                  ? "bg-rose-600 text-white shadow-xs"
                  : "text-rose-700 bg-rose-50 hover:bg-rose-100"
              }`}
            >
              <AlertTriangle size={13} />
              Incomplete & Blockers ({metrics.incomplete})
            </button>
            <button
              onClick={() => setViewMode("directives")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                viewMode === "directives"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-indigo-700 bg-indigo-50 hover:bg-indigo-100"
              }`}
            >
              <Crown size={13} />
              DISCO Directives
            </button>
          </div>

          <span className="text-xs text-slate-500 font-medium">
            Showing <strong className="text-slate-900">{filteredGoals.length}</strong> matching goals
          </span>
        </div>

        {/* Detailed Controls Row */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[220px]">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search title, description, coordinator..."
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
            />
          </div>

          {/* Council Selector */}
          <div className="min-w-[180px]">
            <select
              value={selectedCouncil}
              onChange={(e) => setSelectedCouncil(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 font-medium"
            >
              <option value="">All 14 Councils</option>
              {councils.map((c) => (
                <option key={c.councilId} value={c.councilId}>
                  {c.councilName}
                </option>
              ))}
            </select>
          </div>

          {/* Status Selector */}
          <div className="min-w-[140px]">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 font-medium"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending Only</option>
              <option value="COMPLETED">Completed ✓</option>
              <option value="INCOMPLETE">Incomplete ✕</option>
            </select>
          </div>

          {/* Date Picker */}
          <div className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-xl bg-white text-xs">
            <Calendar size={14} className="text-slate-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border-none p-0 text-xs text-slate-800 focus:outline-none bg-transparent"
              title="Filter by Goal Date"
            />
            {selectedDate && (
              <button
                onClick={() => setSelectedDate("")}
                className="text-slate-400 hover:text-slate-600 ml-1"
                title="Clear date filter"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 4. GOALS MASTER FEED / CARDS                                       */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {filteredGoals.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Target size={24} />
          </div>
          <h3 className="text-sm font-bold text-slate-800">No goals found matching criteria</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your council filter, date range, or clear your search keyword to view more goals.
          </p>
          <button
            onClick={() => {
              setSelectedCouncil("");
              setSelectedStatus("");
              setSelectedDate("");
              setSearchQuery("");
              setViewMode("all");
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-indigo-50 text-indigo-600 text-xs font-semibold hover:bg-indigo-100 transition-all"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGoals.map((goal) => {
            const councilName = councilMap.get(goal.councilId) || "General Council";
            const isAssignedByDisco =
              goal.assignedByName?.toLowerCase().includes("disco") ||
              goal.assignedBy?.toLowerCase().includes("admin") ||
              goal.assignedBy === user?.userId;

            const isIncomplete = (goal.status || "").toUpperCase() === "INCOMPLETE";

            return (
              <div
                key={goal.goalId}
                className={`bg-white rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                  isIncomplete
                    ? "border-rose-300 shadow-xs hover:border-rose-400 hover:shadow-md"
                    : "border-slate-200/90 shadow-xs hover:border-indigo-200 hover:shadow-md"
                }`}
              >
                {/* Card Top */}
                <div className="p-5 space-y-3">
                  {/* Council Badge & Priority */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 text-slate-800 border border-slate-200/60 truncate max-w-[200px]">
                      <Building2 size={12} className="text-indigo-600 flex-shrink-0" />
                      {councilName}
                    </span>
                    <PriorityBadge priority={goal.priority} />
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug tracking-tight">
                      {goal.title}
                    </h3>
                    {goal.description && (
                      <p className="text-xs text-slate-600 mt-1.5 line-clamp-2 leading-relaxed">
                        {goal.description}
                      </p>
                    )}
                  </div>

                  {/* Incomplete Reason Warning Callout */}
                  {isIncomplete && goal.incompleteReason && (
                    <div className="p-3 rounded-xl bg-rose-50/90 border border-rose-200/80 text-rose-800 text-xs space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-[11px] text-rose-900">
                        <AlertTriangle size={13} className="text-rose-600" />
                        Incomplete Reason (Reported by Member):
                      </div>
                      <p className="text-rose-700 leading-relaxed italic">
                        "{goal.incompleteReason}"
                      </p>
                    </div>
                  )}

                  {/* Expected Outcome */}
                  {goal.expectedOutcome && (
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-[11px] text-slate-600">
                      <span className="font-semibold text-slate-700 block text-[10px] uppercase tracking-wider mb-0.5">
                        Expected Outcome:
                      </span>
                      {goal.expectedOutcome}
                    </div>
                  )}
                </div>

                {/* Card Footer */}
                <div className="px-5 py-3.5 bg-slate-50/80 border-t border-slate-100 rounded-b-2xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-[10px] flex-shrink-0">
                      {(goal.assignedToName || goal.memberName || "U")[0]}
                    </div>
                    <div className="truncate">
                      <p className="font-semibold text-slate-800 text-[11px] truncate">
                        {goal.assignedToName || goal.memberName || "Unassigned"}
                      </p>
                      {isAssignedByDisco && (
                        <span className="text-[9px] font-bold text-indigo-600 block uppercase tracking-wider">
                          ★ DISCO Directive
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <StatusBadge status={goal.status} />
                    <button
                      onClick={() => handleOpenHistory(goal)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-all"
                      title="View Status History"
                    >
                      <History size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 5. MODAL: ASSIGN DIRECT GOAL BY DISCO                               */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-400/20 text-amber-300">
                  <Crown size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Assign Direct Council Goal</h3>
                  <p className="text-indigo-300 text-xs">Pushed from DISCO to Council Coordinator</p>
                </div>
              </div>
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateAssignedGoal} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertTriangle size={14} className="flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Council Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Target Council *
                </label>
                <select
                  value={assignForm.councilId}
                  onChange={(e) => handleAssignCouncilChange(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 font-medium"
                >
                  <option value="">Select Target Council...</option>
                  {councils.map((c) => (
                    <option key={c.councilId} value={c.councilId}>
                      {c.councilName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Coordinator Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Assigned Coordinator *
                </label>
                <select
                  value={assignForm.assignedTo}
                  onChange={(e) => {
                    const m = memberMap.get(e.target.value);
                    setAssignForm((prev) => ({
                      ...prev,
                      assignedTo: e.target.value,
                      assignedToName: m?.name || "",
                    }));
                  }}
                  required
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 font-medium"
                >
                  <option value="">Select Coordinator...</option>
                  {members
                    .filter((m) => !assignForm.councilId || m.councilId === assignForm.councilId)
                    .map((m) => (
                      <option key={m.userId} value={m.userId}>
                        {m.name} ({m.position || "Coordinator"})
                      </option>
                    ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Goal Title / Action Directive *
                </label>
                <input
                  type="text"
                  value={assignForm.title}
                  onChange={(e) => setAssignForm((p) => ({ ...p, title: e.target.value }))}
                  required
                  placeholder="e.g. Replace lab switches before 12:00 PM assembly"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              {/* Description & Expected Outcome */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Priority
                  </label>
                  <select
                    value={assignForm.priority}
                    onChange={(e) => setAssignForm((p) => ({ ...p, priority: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  >
                    <option value="HIGH">High Priority (P0)</option>
                    <option value="MEDIUM">Medium Priority (P1)</option>
                    <option value="LOW">Low Priority (P2)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Target Execution Date
                  </label>
                  <input
                    type="date"
                    value={assignForm.goalDate}
                    onChange={(e) => setAssignForm((p) => ({ ...p, goalDate: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Expected Outcome (Measurable Definition of Done)
                </label>
                <input
                  type="text"
                  value={assignForm.expectedOutcome}
                  onChange={(e) => setAssignForm((p) => ({ ...p, expectedOutcome: e.target.value }))}
                  placeholder="e.g. 15 LAN ports active; zero ping drops"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingGoal}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition-all flex items-center gap-2"
                >
                  {submittingGoal ? (
                    <>
                      <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Assigning...
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      Push Goal to Coordinator
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 6. MODAL: STATUS AUDIT HISTORY                                      */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {historyGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History size={16} className="text-indigo-400" />
                <h3 className="font-bold text-sm text-white">Goal Audit History</h3>
              </div>
              <button
                onClick={() => setHistoryGoal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Goal Title</span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{historyGoal.title}</p>
                <p className="text-xs text-slate-500 mt-1">{historyGoal.description}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Current Status:</span>
                  <StatusBadge status={historyGoal.status} />
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Assigned By:</span>
                  <span className="font-semibold text-slate-800">{historyGoal.assignedByName || "Self"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Target Date:</span>
                  <span className="font-semibold text-slate-800">{historyGoal.goalDate}</span>
                </div>
                {historyGoal.incompleteReason && (
                  <div className="pt-2 border-t border-slate-200">
                    <span className="text-rose-700 font-semibold block">Incomplete Reason:</span>
                    <p className="text-slate-700 italic mt-0.5">"{historyGoal.incompleteReason}"</p>
                  </div>
                )}
              </div>

              <button
                onClick={() => setHistoryGoal(null)}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold"
              >
                Close Audit View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
