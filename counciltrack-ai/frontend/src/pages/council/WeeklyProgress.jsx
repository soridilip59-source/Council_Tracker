import { useState, useEffect } from "react";
import { analyticsApi } from "../../services/api";
import { WeeklyAiInsightCard } from "../../components/ai/AiInsightCard";
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
import { TrendingUp, CheckCircle2, XCircle, Clock, Calendar } from "lucide-react";

export default function WeeklyProgress() {
  const [weeklyData, setWeeklyData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWeekly() {
      try {
        const res = await analyticsApi.getWeekly();
        setWeeklyData(res.data.data);
      } catch (err) {
        console.error("Failed to load weekly progress:", err);
      } finally {
        setLoading(false);
      }
    }
    loadWeekly();
  }, []);

  if (loading) {
    return <div className="p-12 text-center text-xs text-slate-500">Calculating your weekly progress...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <TrendingUp className="text-indigo-600" size={24} />
          <span>My Weekly Progress</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Section 5.4 • Automated calculations from your daily goals for the current week ({weeklyData?.startDate} to {weeklyData?.endDate}).
        </p>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Weekly Goals</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">{weeklyData?.totalGoals || 0}</h3>
          <p className="text-[10px] text-slate-400 mt-0.5">Monday to Sunday</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">Completed</p>
          <h3 className="text-2xl font-bold text-emerald-600 mt-1">{weeklyData?.completedGoals || 0}</h3>
          <p className="text-[10px] text-emerald-600/70 mt-0.5">Successful tasks</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-semibold text-rose-600 uppercase tracking-wider">Incomplete</p>
          <h3 className="text-2xl font-bold text-rose-600 mt-1">{weeklyData?.incompleteGoals || 0}</h3>
          <p className="text-[10px] text-rose-600/70 mt-0.5">With reason recorded</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Pending</p>
          <h3 className="text-2xl font-bold text-slate-800 mt-1">{weeklyData?.pendingGoals || 0}</h3>
          <p className="text-[10px] text-slate-400 mt-0.5">Awaiting reflection</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider">Weekly Rate</p>
          <h3 className="text-2xl font-bold text-indigo-600 mt-1">
            {weeklyData?.weeklyCompletionRate !== "N/A"
              ? `${weeklyData?.weeklyCompletionRate}%`
              : "N/A"}
          </h3>
          <p className="text-[10px] text-slate-400 mt-0.5">Completed / Finalized</p>
        </div>
      </div>

      {/* AI Weekly Insight */}
      {weeklyData?.aiInsight && (
        <WeeklyAiInsightCard aiInsight={weeklyData.aiInsight} />
      )}

      {/* Chart */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-1">Daily Completion Chart</h3>
        <p className="text-xs text-slate-500 mb-4">
          Visual progression of your daily goal completions throughout the week.
        </p>
        <div className="h-64 w-full">
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

      {/* Daily Breakdown Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900">Daily Goal History Table</h3>
        </div>
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
            <tr>
              <th className="px-5 py-3">Day</th>
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3 text-center">Goals Planned</th>
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
                <td className="px-5 py-3 text-center font-bold">{d.total}</td>
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
    </div>
  );
}
