// AiInsightCard.jsx — Reusable AI insight components (heuristic provider)
import React from "react";

const toneConfig = {
  excellent: { bg: "bg-emerald-50", border: "border-emerald-300", text: "text-emerald-800", badge: "bg-emerald-100 text-emerald-700" },
  positive:  { bg: "bg-blue-50",    border: "border-blue-300",    text: "text-blue-800",    badge: "bg-blue-100 text-blue-700" },
  good:      { bg: "bg-green-50",   border: "border-green-300",   text: "text-green-800",   badge: "bg-green-100 text-green-700" },
  neutral:   { bg: "bg-gray-50",    border: "border-gray-300",    text: "text-gray-800",    badge: "bg-gray-100 text-gray-700" },
  warning:   { bg: "bg-amber-50",   border: "border-amber-300",   text: "text-amber-800",   badge: "bg-amber-100 text-amber-700" },
  critical:  { bg: "bg-red-50",     border: "border-red-300",     text: "text-red-800",     badge: "bg-red-100 text-red-700" },
};

const severityConfig = {
  HIGH:   { bg: "bg-red-50",    border: "border-red-300",    text: "text-red-800",    badge: "bg-red-500 text-white" },
  MEDIUM: { bg: "bg-amber-50",  border: "border-amber-300",  text: "text-amber-800",  badge: "bg-amber-500 text-white" },
  LOW:    { bg: "bg-blue-50",   border: "border-blue-300",   text: "text-blue-800",   badge: "bg-blue-400 text-white" },
};

export function ReflectionAiCard({ aiAnalysis, onClose }) {
  if (!aiAnalysis) return null;
  const { tone = "neutral", headline, feedback, tip, completionRate } = aiAnalysis;
  const cfg = toneConfig[tone] || toneConfig.neutral;
  return (
    <div className={`rounded-xl border-2 p-5 ${cfg.bg} ${cfg.border} space-y-3`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">✨</span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">AI Feedback</p>
            <h3 className={`font-bold text-base ${cfg.text}`}>{headline}</h3>
          </div>
        </div>
        {completionRate !== null && completionRate !== undefined && (
          <span className={`text-sm font-bold px-3 py-1 rounded-full ${cfg.badge}`}>{completionRate}% complete</span>
        )}
      </div>
      <p className={`text-sm leading-relaxed ${cfg.text}`}>{feedback}</p>
      {tip && (
        <div className="flex items-start gap-2 bg-white/60 rounded-lg p-3">
          <span className="text-base">💡</span>
          <p className={`text-xs leading-relaxed ${cfg.text} font-medium`}>{tip}</p>
        </div>
      )}
      {onClose && (
        <button onClick={onClose} className="text-xs text-gray-500 hover:text-gray-700 underline w-full text-right">
          Dismiss
        </button>
      )}
    </div>
  );
}

export function WeeklyAiInsightCard({ aiInsight }) {
  if (!aiInsight) return null;
  const { emoji, summary, highlight, suggestion, completionRate } = aiInsight;
  const rate = typeof completionRate === "number" ? completionRate : 0;
  const tone = rate >= 85 ? "excellent" : rate >= 70 ? "good" : rate >= 50 ? "neutral" : rate > 0 ? "warning" : "neutral";
  const cfg = toneConfig[tone] || toneConfig.neutral;
  return (
    <div className={`rounded-xl border-2 p-5 ${cfg.bg} ${cfg.border} space-y-3`}>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-2xl">{emoji || "🤖"}</span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">AI Weekly Insight</p>
          <p className="text-xs text-gray-400">Heuristic analysis — no API key needed</p>
        </div>
      </div>
      <p className={`text-sm leading-relaxed ${cfg.text}`}>{summary}</p>
      {highlight && <p className="text-xs text-gray-500 font-medium">📌 {highlight}</p>}
      <div className="flex items-start gap-2 bg-white/60 rounded-lg p-3">
        <span className="text-base">💡</span>
        <p className={`text-xs leading-relaxed ${cfg.text} font-medium`}>{suggestion}</p>
      </div>
    </div>
  );
}

export function GoalSuggestionCard({ suggestions = [], onSelect, loading }) {
  if (loading) {
    return (
      <div className="rounded-xl border-2 border-purple-200 bg-purple-50 p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl animate-spin">✨</span>
          <p className="text-sm text-purple-700 font-semibold">AI suggestions generate ho rahi hain...</p>
        </div>
        <div className="space-y-2">
          {[1,2,3].map(i => <div key={i} className="h-10 bg-purple-100 rounded-lg animate-pulse" />)}
        </div>
      </div>
    );
  }
  if (!suggestions.length) return null;
  return (
    <div className="rounded-xl border-2 border-purple-200 bg-purple-50 p-5 space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-xl">✨</span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-purple-500">AI Suggestions</p>
          <p className="text-xs text-purple-400">Click to use as goal title</p>
        </div>
      </div>
      <div className="space-y-2">
        {suggestions.map((s, i) => (
          <button
            key={i}
            onClick={() => onSelect && onSelect(s)}
            className="w-full text-left flex items-center gap-3 p-3 bg-white rounded-lg border border-purple-200 hover:border-purple-400 hover:bg-purple-50 transition-all group"
          >
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${s.priority === "HIGH" ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"}`}>
              {s.priority}
            </span>
            <span className="text-sm text-gray-700 group-hover:text-purple-800 flex-1">{s.title}</span>
            <span className="text-purple-400 opacity-0 group-hover:opacity-100 text-xs">Use →</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function SmartAlertCard({ alert }) {
  if (!alert) return null;
  const cfg = severityConfig[alert.severity] || severityConfig.LOW;
  return (
    <div className={`rounded-xl border p-4 ${cfg.bg} ${cfg.border} space-y-2`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">{alert.emoji}</span>
          <div>
            <p className={`text-sm font-semibold ${cfg.text}`}>{alert.memberName}</p>
            <p className="text-xs text-gray-500">{alert.position}</p>
          </div>
        </div>
        <span className={`text-xs font-bold px-2 py-1 rounded-full ${cfg.badge}`}>{alert.severity}</span>
      </div>
      <p className={`text-xs leading-relaxed ${cfg.text}`}>{alert.message}</p>
      <p className="text-xs text-gray-500 italic">👉 {alert.action}</p>
    </div>
  );
}
