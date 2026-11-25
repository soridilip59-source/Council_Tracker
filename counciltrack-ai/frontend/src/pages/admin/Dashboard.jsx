import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { analyticsApi, userApi, leaveApi } from "../../services/api";
import { SmartAlertCard } from "../../components/ai/AiInsightCard";
import ScrollReveal from "../../components/ui/ScrollReveal";
import CouncilDirectoryTable from "../../components/common/CouncilDirectoryTable";
import {
  Building2,
  Users,
  Target,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [members, setMembers] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [sumRes, memRes, alertRes, leaveRes] = await Promise.all([
        analyticsApi.getDashboard(),
        userApi.getAll(),
        analyticsApi.getSmartAlerts().catch(() => ({ data: { data: [] } })),
        leaveApi.getActive().catch(() => ({ data: { data: [] } })),
      ]);
      setSummary(sumRes.data.data);
      setMembers(memRes.data.data || []);
      setAlerts(alertRes.data.data || []);
      setLeaves(leaveRes.data.data || []);
    } catch (err) {
      console.error("Failed to load admin dashboard data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="text-xs text-slate-500 font-medium">Loading CouncilTrack AI Summary...</p>
        </div>
      </div>
    );
  }

  const councilMembers = members.filter((m) => (m.role || "").toUpperCase() === "COUNCIL");

  return (
    <div className="space-y-6">
      {/* Top Welcome Bar */}
      <ScrollReveal direction="down" duration={500}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight heading-accent-underline">
              Total Council Dashboard
            </h1>
            <p className="text-xs text-slate-500 mt-2">
              Section One • Real-time overview of all councils, members, today's goals, and reflections.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 shadow-xs transition hover:scale-102"
            >
              <RefreshCw size={14} className={refreshing ? "animate-spin text-indigo-600" : ""} />
              <span>Refresh</span>
            </button>
            <Link
              to="/admin/overview"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition hover:shadow-indigo-500/20"
            >
              <TrendingUp size={14} />
              <span>Weekly & Monthly Reports</span>
            </Link>
          </div>
        </div>
      </ScrollReveal>

      {/* Summary Cards Grid (TRD Section 4.1) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Councils */}
        <ScrollReveal direction="up" delay={100}>
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs card-hover-elevate flex items-center justify-between group">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Councils</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{summary?.totalCouncils || 0}</h3>
              <p className="text-[11px] text-slate-500 mt-1">Active campus bodies</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Building2 size={22} />
            </div>
          </div>
        </ScrollReveal>

        {/* Total Council Members */}
        <ScrollReveal direction="up" delay={180}>
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs card-hover-elevate flex items-center justify-between group">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Council Members</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{summary?.totalMembers || 0}</h3>
              <div className="flex items-center gap-2 mt-1 text-[11px]">
                <span className="text-emerald-600 font-medium">{summary?.activeMembers || 0} Active</span>
                <span>•</span>
                <span className="text-slate-400">{summary?.inactiveMembers || 0} Inactive</span>
              </div>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users size={22} />
            </div>
          </div>
        </ScrollReveal>

        {/* Today's Goals & Completion Rate */}
        <ScrollReveal direction="up" delay={260}>
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs card-hover-emerald flex items-center justify-between group">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Today's Goals</p>
              <div className="flex items-baseline gap-2 mt-1">
                <h3 className="text-2xl font-bold text-slate-900">{summary?.todayTotalGoals || 0}</h3>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                  {summary?.todayCompletionRate !== "N/A" ? `${summary?.todayCompletionRate}%` : "N/A"}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1 text-[11px]">
                <span className="text-emerald-600 font-medium">✓ {summary?.todayCompletedGoals || 0}</span>
                <span className="text-rose-600 font-medium">✕ {summary?.todayIncompleteGoals || 0}</span>
                <span className="text-slate-500">● {summary?.todayPendingGoals || 0}</span>
              </div>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Target size={22} />
            </div>
          </div>
        </ScrollReveal>

        {/* Pending Reflections */}
        <ScrollReveal direction="up" delay={340}>
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs card-hover-amber flex items-center justify-between group">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Pending Reflections</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{summary?.pendingEveningReflections || 0}</h3>
              <p className="text-[11px] text-amber-600 font-medium mt-1">Awaiting evening review</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Sparkles size={22} />
            </div>
          </div>
        </ScrollReveal>
      </div>

      {/* Council Members on Leave Tracker */}
      {leaves && leaves.length > 0 && (
        <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏖️</span>
            <div>
              <h2 className="text-sm font-bold text-amber-900">
                Council Members On Leave ({leaves.length})
              </h2>
              <p className="text-[11px] text-amber-700">
                Active leaves with duration & temporary student handover
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {leaves.map((l, idx) => (
              <div key={idx} className="bg-white p-3 rounded-xl border border-amber-200/90 shadow-2xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{l.memberName}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                    {l.totalDays || "1"} Day(s) Leave
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  {l.startDate} to {l.endDate}
                </p>
                {l.reason && (
                  <p className="text-[11px] text-slate-600 italic">
                    Reason: {l.reason}
                  </p>
                )}
                {l.handoverStudentName && (
                  <p className="text-[11px] text-emerald-700 font-semibold pt-0.5">
                    🎓 Handed over to: {l.handoverStudentName}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Smart Alerts (Heuristic) */}
      {alerts && alerts.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">✨</span>
            <h2 className="text-base font-bold text-slate-900">AI Smart Alerts ({alerts.length})</h2>
            <span className="text-xs text-slate-500 font-normal">• Automated member performance & inactivity detection</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {alerts.map((a, idx) => (
              <SmartAlertCard key={idx} alert={a} />
            ))}
          </div>
        </div>
      )}

      {/* Council Members Table (PRD Section 4.1) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Council Members Directory & Today's Progress</h2>
            <p className="text-xs text-slate-500">
              Complete roster across all councils with today's goal completion metrics.
            </p>
          </div>
          <Link
            to="/admin/members"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition"
          >
            <span>Manage All Members</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Member</th>
                <th className="px-5 py-3">Council & Position</th>
                <th className="px-5 py-3 text-center">Status</th>
                <th className="px-5 py-3 text-center">Today's Goals</th>
                <th className="px-5 py-3 text-center">Completed</th>
                <th className="px-5 py-3 text-center">Incomplete</th>
                <th className="px-5 py-3 text-center">Completion Rate</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {councilMembers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-8 text-center text-slate-500 text-xs">
                    No council members found.
                  </td>
                </tr>
              ) : (
                councilMembers.map((m) => {
                  const stats = m.todayStats || {};
                  return (
                    <tr key={m.userId} className="hover:bg-slate-50/70 transition">
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-slate-900">{m.name}</div>
                        <div className="text-xs text-slate-400">{m.email}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-medium text-slate-800">{m.councilName}</div>
                        <div className="text-xs text-indigo-600 font-medium">{m.position || "Member"}</div>
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                            (m.status || "").toUpperCase() === "ACTIVE"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-slate-100 text-slate-600 border border-slate-200"
                          }`}
                        >
                          {m.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-center font-semibold text-slate-800">
                        {stats.totalGoals || 0}
                      </td>
                      <td className="px-5 py-3.5 text-center font-medium text-emerald-600">
                        {stats.completedGoals || 0}
                      </td>
                      <td className="px-5 py-3.5 text-center font-medium text-rose-600">
                        {stats.incompleteGoals || 0}
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
                      <td className="px-5 py-3.5 text-right">
                        <Link
                          to={`/admin/goals?userId=${m.userId}`}
                          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
                        >
                          View Goals
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Council & Coordinator Official Directory Table */}
      <CouncilDirectoryTable title="Official Council & Coordinator Directory (14 Councils • 25 Coordinators)" />

      {/* Quick Links & Shortcuts Banner */}
      <ScrollReveal direction="up" delay={150}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/admin/goals"
            className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs card-hover-elevate transition flex items-center justify-between group"
          >
            <div>
              <h3 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">Council Goals Dashboard</h3>
              <p className="text-xs text-slate-500 mt-0.5">Section Two • Monitor live daily goals by council</p>
            </div>
            <ArrowRight size={18} className="text-indigo-600 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            to="/admin/overview"
            className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs card-hover-elevate transition flex items-center justify-between group"
          >
            <div>
              <h3 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">Weekly & Monthly Overview</h3>
              <p className="text-xs text-slate-500 mt-0.5">Section Three • Automated progress analytics</p>
            </div>
            <ArrowRight size={18} className="text-indigo-600 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            to="/admin/feedback"
            className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs card-hover-elevate transition flex items-center justify-between group"
          >
            <div>
              <h3 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">Student Feedback & Complaints</h3>
              <p className="text-xs text-slate-500 mt-0.5">Section Four • Review suggestions & resolve grievances</p>
            </div>
            <ArrowRight size={18} className="text-indigo-600 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </ScrollReveal>
    </div>
  );
}
