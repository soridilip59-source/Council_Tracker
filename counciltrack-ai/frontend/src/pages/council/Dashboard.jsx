import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { goalApi, reflectionApi } from "../../services/api";
import ScrollReveal from "../../components/ui/ScrollReveal";
import {
  Target,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Plus,
  ArrowRight,
  TrendingUp,
  Building,
  Calendar,
} from "lucide-react";

export default function CouncilDashboard() {
  const { user } = useAuth();
  const [goals, setGoals] = useState([]);
  const [todayReflection, setTodayReflection] = useState(null);
  const [loading, setLoading] = useState(true);

  const todayStr = new Date().toISOString().split("T")[0];

  const loadData = async () => {
    try {
      const [gRes, rRes] = await Promise.all([
        goalApi.getMy({ goalDate: todayStr }),
        reflectionApi.getMy(),
      ]);
      setGoals(gRes.data.data || []);
      const ref = (rRes.data.data || []).find((r) => r.reflectionDate === todayStr);
      setTodayReflection(ref || null);
    } catch (err) {
      console.error("Failed to load council dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalGoals = goals.length;
  const completedGoals = goals.filter((g) => (g.status || "").toUpperCase() === "COMPLETED").length;
  const incompleteGoals = goals.filter((g) => (g.status || "").toUpperCase() === "INCOMPLETE").length;
  const pendingGoals = goals.filter((g) => (g.status || "").toUpperCase() === "PENDING").length;

  const finalized = completedGoals + incompleteGoals;
  const completionRate = finalized > 0 ? Math.round((completedGoals / finalized) * 100) : "N/A";

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <ScrollReveal direction="down" duration={500}>
        <div className="bg-gradient-to-r from-indigo-950 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative overflow-hidden border border-indigo-800/40">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 text-xs font-semibold">
                {user?.councilName || "Council"}
              </span>
              <span className="text-indigo-400">•</span>
              <span className="text-xs text-indigo-300 font-medium">{user?.position || "Coordinator"}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Hello, {user?.name || "Council Member"}!
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-indigo-200/80 max-w-xl">
              Track your daily commitments, review accomplishments with evening reflections, and keep your council accountable.
            </p>
          </div>

          {/* Quick Actions in Banner */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 relative z-10">
            <Link
              to="/council/goals"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-indigo-50 text-indigo-900 font-semibold text-xs shadow-sm transition hover:scale-102"
            >
              <Plus size={16} className="text-indigo-600" />
              <span>Add Daily Goal</span>
            </Link>
            <Link
              to="/council/reflection"
              className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs transition hover:scale-102 ${
                todayReflection
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30"
                  : "bg-indigo-600 hover:bg-indigo-500 text-white"
              }`}
            >
              <Sparkles size={16} />
              <span>{todayReflection ? "Edit Evening Reflection" : "Evening Reflection"}</span>
            </Link>
          </div>
        </div>
      </ScrollReveal>

      {/* Summary Cards Grid (PRD Section 5.1) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <ScrollReveal direction="up" delay={50}>
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs card-hover-elevate">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Today's Goals</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{totalGoals}</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">{todayStr}</p>
          </div>
        </ScrollReveal>

        <ScrollReveal direction="up" delay={120}>
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs card-hover-emerald">
            <p className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">Completed</p>
            <h3 className="text-2xl font-bold text-emerald-600 mt-1">{completedGoals}</h3>
            <p className="text-[10px] text-emerald-600/70 mt-0.5">Finished today</p>
          </div>
        </ScrollReveal>

        <ScrollReveal direction="up" delay={190}>
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs card-hover-elevate">
            <p className="text-[11px] font-semibold text-rose-600 uppercase tracking-wider">Incomplete</p>
            <h3 className="text-2xl font-bold text-rose-600 mt-1">{incompleteGoals}</h3>
            <p className="text-[10px] text-rose-600/70 mt-0.5">With reason logged</p>
          </div>
        </ScrollReveal>

        <ScrollReveal direction="up" delay={260}>
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs card-hover-elevate">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Pending</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{pendingGoals}</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Awaiting reflection</p>
          </div>
        </ScrollReveal>

        <ScrollReveal direction="up" delay={330}>
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs card-hover-elevate">
            <p className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider">Completion Rate</p>
            <h3 className="text-2xl font-bold text-indigo-600 mt-1">
              {completionRate !== "N/A" ? `${completionRate}%` : "N/A"}
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Excludes pending</p>
          </div>
        </ScrollReveal>
      </div>

      {/* Today's Goals Checklist Section */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Today's Daily Goals Checklist</h2>
            <p className="text-xs text-slate-500">
              Review your tasks for today. Update status before or during your evening reflection.
            </p>
          </div>
          <Link
            to="/council/goals"
            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
          >
            <span>Manage All Goals</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-500">Loading daily goals...</div>
          ) : goals.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-xs text-slate-500">You haven't added any goals for today yet.</p>
              <Link
                to="/council/goals"
                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700 transition"
              >
                <Plus size={14} />
                <span>Create Your First Goal Today</span>
              </Link>
            </div>
          ) : (
            goals.map((g) => {
              const statusUpper = (g.status || "").toUpperCase();
              return (
                <div key={g.goalId} className="p-4 sm:px-6 flex items-center justify-between gap-4 hover:bg-slate-50/70 transition">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="mt-1">
                      {statusUpper === "COMPLETED" ? (
                        <CheckCircle2 size={18} className="text-emerald-500" />
                      ) : statusUpper === "INCOMPLETE" ? (
                        <XCircle size={18} className="text-rose-500" />
                      ) : (
                        <Clock size={18} className="text-slate-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold text-slate-900 truncate">{g.title}</h4>
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{g.description}</p>
                      {g.incompleteReason && (
                        <p className="text-[11px] text-rose-600 font-medium mt-1">
                          Reason: {g.incompleteReason}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
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
                    <span
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                        statusUpper === "COMPLETED"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : statusUpper === "INCOMPLETE"
                          ? "bg-rose-50 text-rose-700 border border-rose-200"
                          : "bg-slate-100 text-slate-600 border border-slate-200"
                      }`}
                    >
                      {statusUpper}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Evening Reflection Banner Card */}
      <ScrollReveal direction="up" delay={200}>
        <div className="p-6 bg-gradient-to-r from-amber-50 to-indigo-50 border border-amber-200/70 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 card-hover-amber">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-semibold mb-1">
              <Sparkles size={12} />
              <span>Daily Evening Requirement</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 heading-accent-underline">
              {todayReflection ? "Evening Reflection Submitted" : "Submit Your Evening Reflection"}
            </h3>
            <p className="text-xs text-slate-600 max-w-xl mt-2">
              {todayReflection
                ? `You submitted your reflection for today on ${new Date(todayReflection.submittedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}. You can update it if needed.`
                : "Reflect on today's accomplishments, challenges, learnings, and finalize any incomplete goal explanations."}
            </p>
          </div>
          <Link
            to="/council/reflection"
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition whitespace-nowrap shadow-xs hover:shadow-md hover:scale-102"
          >
            {todayReflection ? "View / Edit Reflection" : "Open Reflection Form"}
          </Link>
        </div>
      </ScrollReveal>
    </div>
  );
}
