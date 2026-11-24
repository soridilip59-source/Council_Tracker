import React from "react";
import { Sparkles, Building2, ShieldCheck, Target, HeartHandshake, Compass } from "lucide-react";

const MARQUEE_ITEMS = [
  { icon: Building2, text: "NavGurukul Dantewada Campus", highlight: true },
  { icon: Sparkles, text: "NavGurukul Dantewada Council Portal", highlight: true },
  { icon: Target, text: "Daily Goals & Evening Reflections", highlight: false },
  { icon: ShieldCheck, text: "Accountability • Transparency • Leadership", highlight: true },
  { icon: HeartHandshake, text: "Student Participation & Campus Governance", highlight: false },
  { icon: Compass, text: "NavGurukul Dantewada • Building Tomorrow's Leaders", highlight: true },
];

export default function MarqueeBanner({ className = "" }) {
  return (
    <div
      className={`relative w-full overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white py-2.5 border-y border-indigo-500/20 group select-none shadow-sm ${className}`}
    >
      {/* Edge gradient fade masks */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-r from-slate-900 to-transparent z-10" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-l from-slate-900 to-transparent z-10" />

      {/* Infinite scrolling track */}
      <div className="flex w-max items-center gap-8 animate-marquee group-hover:[animation-play-state:paused]">
        {/* Render 2 sets for seamless loop */}
        {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="flex items-center gap-2.5 text-xs font-medium tracking-wide whitespace-nowrap"
            >
              <span
                className={`inline-flex items-center justify-center p-1 rounded-md ${
                  item.highlight
                    ? "bg-indigo-500/30 text-indigo-300 ring-1 ring-indigo-400/40"
                    : "bg-white/10 text-slate-300"
                }`}
              >
                <Icon size={13} />
              </span>
              <span
                className={
                  item.highlight
                    ? "font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 via-indigo-100 to-white"
                    : "text-slate-300"
                }
              >
                {item.text}
              </span>
              <span className="text-indigo-500/60 font-bold ml-3 text-xs">•</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
