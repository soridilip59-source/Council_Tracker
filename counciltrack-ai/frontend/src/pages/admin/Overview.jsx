import { useState, useEffect } from "react";
import { analyticsApi, councilApi, userApi } from "../../services/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import {
  Calendar,
  BarChart3,
  TrendingUp,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Building2,
  Users,
} from "lucide-react";

export default function Overview() {
  const [tab, setTab] = useState("weekly"); // 'weekly' | 'monthly' | 'councils'

  // Filter States
  const [councils, setCouncils] = useState([]);
  const [members, setMembers] = useState([]);
  const [selectedCouncil, setSelectedCouncil] = useState("");
  const [selectedMember, setSelectedMember] = useState("");

  // Weekly State
  const [weeklyData, setWeeklyData] = useState(null);
  const [loadingWeekly, setLoadingWeekly] = useState(true);

  // Monthly State
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [monthlyData, setMonthlyData] = useState(null);
  const [loadingMonthly, setLoadingMonthly] = useState(true);

  // Councils Comparison State
  const [councilsComparison, setCouncilsComparison] = useState([]);
  const [loadingComparison, setLoadingComparison] = useState(true);

  // Load dropdown metadata
  useEffect(() => {
    async function loadMeta() {
      try {
        const [cRes, mRes] = await Promise.all([councilApi.getAll(), userApi.getAll()]);
        setCouncils(cRes.data.data || []);
        setMembers(mRes.data.data || []);
      } catch (err) {
        console.error("Failed to load metadata:", err);
      }
    }
    loadMeta();
  }, []);

  // Fetch Weekly
  useEffect(() => {
    async function fetchWeekly() {
      setLoadingWeekly(true);
      try {
        const res = await analyticsApi.getWeekly({
          councilId: selectedCouncil,
          userId: selectedMember,
        });
        setWeeklyData(res.data.data);
      } catch (err) {
        console.error("Failed to fetch weekly progress:", err);
      } finally {
        setLoadingWeekly(false);
      }
    }
    fetchWeekly();
  }, [selectedCouncil, selectedMember]);

  // Fetch Monthly
  useEffect(() => {
    async function fetchMonthly() {
      setLoadingMonthly(true);
      try {
        const res = await analyticsApi.getMonthly({
          year: selectedYear,
          month: selectedMonth,
          councilId: selectedCouncil,
          userId: selectedMember,
        });
        setMonthlyData(res.data.data);
      } catch (err) {
        console.error("Failed to fetch monthly progress:", err);
      } finally {
        setLoadingMonthly(false);
      }
    }
    fetchMonthly();
  }, [selectedYear, selectedMonth, selectedCouncil, selectedMember]);

  // Fetch Councils Comparison
  useEffect(() => {
    async function fetchComparison() {
      setLoadingComparison(true);
      try {
        const res = await analyticsApi.getCouncils();
        setCouncilsComparison(res.data.data || []);
      } catch (err) {
        console.error("Failed to fetch councils comparison:", err);
      } finally {
        setLoadingComparison(false);
      }
    }
    fetchComparison();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Weekly & Monthly Overview</h1>
          <p className="text-xs text-slate-500 mt-1">
            Section Three • Progress and consistency calculated automatically from daily goal records (PRD v2.0).
          </p>
        </div>

        {/* Tab Controls */}
        <div className="inline-flex p-1 bg-slate-200/80 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setTab("weekly")}
            className={`px-3 py-1.5 rounded-lg transition ${
              tab === "weekly" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Weekly Progress
          </button>
          <button
            onClick={() => setTab("monthly")}
            className={`px-3 py-1.5 rounded-lg transition ${
              tab === "monthly" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Monthly Progress
          </button>
          <button
            onClick={() => setTab("councils")}
            className={`px-3 py-1.5 rounded-lg transition ${
              tab === "councils" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Council Comparison
          </button>
        </div>
      </div>

      {/* Global Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mr-2">
          <Filter size={15} />
          <span>Filters:</span>
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
          value={selectedMember}
          onChange={(e) => setSelectedMember(e.target.value)}
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

        {/* Month & Year Selectors (visible in monthly tab) */}
        {tab === "monthly" && (
          <>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
            >
              {[
                "January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December",
              ].map((mName, idx) => (
                <option key={idx + 1} value={idx + 1}>
                  {mName}
                </option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
            >
              <option value={2026}>2026</option>
              <option value={2027}>2027</option>
            </select>
          </>
        )}

        {(selectedCouncil || selectedMember) && (
          <button
            onClick={() => {
              setSelectedCouncil("");
              setSelectedMember("");
            }}
            className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
          >
            Reset
          </button>
        )}
      </div>

      {/* TAB A: WEEKLY PROGRESS */}
      {tab === "weekly" && (
        <div className="space-y-6">
          {loadingWeekly ? (
            <div className="p-12 text-center text-xs text-slate-500">Calculating weekly progress...</div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <p className="text-[11px] font-medium text-slate-500 uppercase">Week Range</p>
                  <p className="text-sm font-bold text-slate-900 mt-1">
                    {weeklyData?.startDate?.slice(5)} to {weeklyData?.endDate?.slice(5)}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Monday to Sunday</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <p className="text-[11px] font-medium text-slate-500 uppercase">Total Goals</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{weeklyData?.totalGoals || 0}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <p className="text-[11px] font-medium text-emerald-600 uppercase">Completed</p>
                  <p className="text-2xl font-bold text-emerald-600 mt-1">{weeklyData?.completedGoals || 0}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <p className="text-[11px] font-medium text-rose-600 uppercase">Incomplete</p>
                  <p className="text-2xl font-bold text-rose-600 mt-1">{weeklyData?.incompleteGoals || 0}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <p className="text-[11px] font-medium text-indigo-600 uppercase">Completion Rate</p>
                  <p className="text-2xl font-bold text-indigo-600 mt-1">
                    {weeklyData?.weeklyCompletionRate !== "N/A"
                      ? `${weeklyData?.weeklyCompletionRate}%`
                      : "N/A"}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {weeklyData?.pendingGoals || 0} pending separate
                  </p>
                </div>
              </div>

              {/* Chart: Daily Goal Completion */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 mb-1">Daily Goal Completion Chart</h3>
                <p className="text-xs text-slate-500 mb-4">
                  Visual comparison of completed vs incomplete vs pending goals across each day of the week.
                </p>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyData?.dailyBreakdown || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="dayName" stroke="#64748b" fontSize={12} />
                      <YAxis stroke="#64748b" fontSize={12} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="completed" name="Completed" fill="#10b981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="incomplete" name="Incomplete" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="pending" name="Pending" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Daily Breakdown Table (PRD Section 4.3 Table Example) */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-4 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900">Daily Breakdown Table</h3>
                </div>
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                    <tr>
                      <th className="px-5 py-3">Day</th>
                      <th className="px-5 py-3">Date</th>
                      <th className="px-5 py-3 text-center">Created Goals</th>
                      <th className="px-5 py-3 text-center">Completed</th>
                      <th className="px-5 py-3 text-center">Incomplete</th>
                      <th className="px-5 py-3 text-center">Pending</th>
                      <th className="px-5 py-3 text-center">Daily Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {weeklyData?.dailyBreakdown?.map((d) => (
                      <tr key={d.date} className="hover:bg-slate-50">
                        <td className="px-5 py-3 font-semibold text-slate-900">{d.dayName}</td>
                        <td className="px-5 py-3 text-slate-500">{d.date}</td>
                        <td className="px-5 py-3 text-center font-bold text-slate-800">{d.total}</td>
                        <td className="px-5 py-3 text-center font-medium text-emerald-600">{d.completed}</td>
                        <td className="px-5 py-3 text-center font-medium text-rose-600">{d.incomplete}</td>
                        <td className="px-5 py-3 text-center text-slate-400">{d.pending}</td>
                        <td className="px-5 py-3 text-center font-bold">
                          {d.completionRate !== "N/A" ? `${d.completionRate}%` : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* TAB B: MONTHLY PROGRESS */}
      {tab === "monthly" && (
        <div className="space-y-6">
          {loadingMonthly ? (
            <div className="p-12 text-center text-xs text-slate-500">Calculating monthly progress...</div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <p className="text-[11px] font-medium text-slate-500 uppercase">Selected Period</p>
                  <p className="text-sm font-bold text-slate-900 mt-1">
                    {monthlyData?.startDate} to {monthlyData?.endDate}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <p className="text-[11px] font-medium text-slate-500 uppercase">Monthly Goals</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{monthlyData?.totalGoals || 0}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <p className="text-[11px] font-medium text-emerald-600 uppercase">Completed</p>
                  <p className="text-2xl font-bold text-emerald-600 mt-1">{monthlyData?.completedGoals || 0}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <p className="text-[11px] font-medium text-rose-600 uppercase">Incomplete</p>
                  <p className="text-2xl font-bold text-rose-600 mt-1">{monthlyData?.incompleteGoals || 0}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <p className="text-[11px] font-medium text-indigo-600 uppercase">Monthly Rate</p>
                  <p className="text-2xl font-bold text-indigo-600 mt-1">
                    {monthlyData?.monthlyCompletionRate !== "N/A"
                      ? `${monthlyData?.monthlyCompletionRate}%`
                      : "N/A"}
                  </p>
                </div>
              </div>

              {/* Weekly Comparison Chart */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 mb-1">Weekly Comparison Chart</h3>
                <p className="text-xs text-slate-500 mb-4">
                  Aggregated goal achievements across the weeks of the selected calendar month.
                </p>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData?.weeklyComparison || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="weekLabel" stroke="#64748b" fontSize={11} />
                      <YAxis stroke="#64748b" fontSize={12} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="completed" name="Completed" fill="#10b981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="incomplete" name="Incomplete" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="pending" name="Pending" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Weekly Comparison Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                    <tr>
                      <th className="px-5 py-3">Week Block</th>
                      <th className="px-5 py-3 text-center">Total Goals</th>
                      <th className="px-5 py-3 text-center">Completed</th>
                      <th className="px-5 py-3 text-center">Incomplete</th>
                      <th className="px-5 py-3 text-center">Pending</th>
                      <th className="px-5 py-3 text-center">Completion Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {monthlyData?.weeklyComparison?.map((w, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="px-5 py-3 font-semibold text-slate-800">{w.weekLabel}</td>
                        <td className="px-5 py-3 text-center font-bold">{w.total}</td>
                        <td className="px-5 py-3 text-center font-medium text-emerald-600">{w.completed}</td>
                        <td className="px-5 py-3 text-center font-medium text-rose-600">{w.incomplete}</td>
                        <td className="px-5 py-3 text-center text-slate-400">{w.pending}</td>
                        <td className="px-5 py-3 text-center font-bold">
                          {w.completionRate !== "N/A" ? `${w.completionRate}%` : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* TAB C: COUNCILS COMPARISON */}
      {tab === "councils" && (
        <div className="space-y-6">
          {loadingComparison ? (
            <div className="p-12 text-center text-xs text-slate-500">Comparing council performances...</div>
          ) : (
            <>
              {/* Council-wise Comparison Chart */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 mb-1">Council-Wise Performance Comparison</h3>
                <p className="text-xs text-slate-500 mb-4">
                  Comparative analysis of goal completion volume and success rate per council.
                </p>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={councilsComparison}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="councilName" stroke="#64748b" fontSize={12} />
                      <YAxis stroke="#64748b" fontSize={12} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="completedGoals" name="Completed Goals" fill="#10b981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="incompleteGoals" name="Incomplete Goals" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Council Metrics Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                    <tr>
                      <th className="px-5 py-3">Council Name</th>
                      <th className="px-5 py-3 text-center">Active Members</th>
                      <th className="px-5 py-3 text-center">Total Goals Created</th>
                      <th className="px-5 py-3 text-center">Completed</th>
                      <th className="px-5 py-3 text-center">Incomplete</th>
                      <th className="px-5 py-3 text-center">Completion Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {councilsComparison.map((c) => (
                      <tr key={c.councilId} className="hover:bg-slate-50">
                        <td className="px-5 py-3.5 font-bold text-slate-900">{c.councilName}</td>
                        <td className="px-5 py-3.5 text-center font-medium text-slate-700">{c.totalMembers}</td>
                        <td className="px-5 py-3.5 text-center font-bold text-slate-800">{c.totalGoals}</td>
                        <td className="px-5 py-3.5 text-center font-semibold text-emerald-600">{c.completedGoals}</td>
                        <td className="px-5 py-3.5 text-center font-semibold text-rose-600">{c.incompleteGoals}</td>
                        <td className="px-5 py-3.5 text-center">
                          <span
                            className={`font-semibold text-xs px-2.5 py-0.5 rounded-md ${
                              c.completionRate === "N/A"
                                ? "bg-slate-100 text-slate-500"
                                : Number(c.completionRate) >= 70
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {c.completionRate !== "N/A" ? `${c.completionRate}%` : "N/A"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
