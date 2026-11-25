import { useState, useEffect } from "react";
import { analyticsApi } from "../../services/api";
import { MonthlyAiInsightCard } from "../../components/ai/AiInsightCard";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { CalendarDays, CheckCircle2, XCircle, Clock } from "lucide-react";

export default function MonthlyProgress() {
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);

  const [monthlyData, setMonthlyData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMonthly() {
      setLoading(true);
      try {
        const res = await analyticsApi.getMonthly({
          year: selectedYear,
          month: selectedMonth,
        });
        setMonthlyData(res.data.data);
      } catch (err) {
        console.error("Failed to load monthly progress:", err);
      } finally {
        setLoading(false);
      }
    }
    loadMonthly();
  }, [selectedYear, selectedMonth]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarDays className="text-indigo-600" size={24} />
            <span>My Monthly Progress</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Section 5.5 • Month-to-date analysis calculated from your daily goal records.
          </p>
        </div>

        {/* Month Selector */}
        <div className="flex items-center gap-2">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
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
            className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
          >
            <option value={2026}>2026</option>
            <option value={2027}>2027</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500">Calculating your monthly progress...</div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Monthly Goals</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{monthlyData?.totalGoals || 0}</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">1st to last day of month</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <p className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">Completed</p>
              <h3 className="text-2xl font-bold text-emerald-600 mt-1">{monthlyData?.completedGoals || 0}</h3>
              <p className="text-[10px] text-emerald-600/70 mt-0.5">Finished</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <p className="text-[11px] font-semibold text-rose-600 uppercase tracking-wider">Incomplete</p>
              <h3 className="text-2xl font-bold text-rose-600 mt-1">{monthlyData?.incompleteGoals || 0}</h3>
              <p className="text-[10px] text-rose-600/70 mt-0.5">With reasons</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Pending</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">{monthlyData?.pendingGoals || 0}</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Unreviewed</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <p className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider">Monthly Rate</p>
              <h3 className="text-2xl font-bold text-indigo-600 mt-1">
                {monthlyData?.monthlyCompletionRate !== "N/A"
                  ? `${monthlyData?.monthlyCompletionRate}%`
                  : "N/A"}
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Completed / Finalized</p>
            </div>
          </div>

          {/* AI Monthly Calculation & Executive Insight */}
          {monthlyData?.aiMonthlyInsight && (
            <MonthlyAiInsightCard aiMonthlyInsight={monthlyData.aiMonthlyInsight} />
          )}

          {/* Weekly Comparison Chart within the month */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Weekly Consistency Breakdown</h3>
            <p className="text-xs text-slate-500 mb-4">
              Comparing your completed vs incomplete goals across each week block of the month.
            </p>
            <div className="h-64 w-full">
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
  );
}
