import { useState } from "react";
import {
  Building2,
  Users,
  Search,
  KeyRound,
  Copy,
  Check,
  ShieldCheck,
  Sparkles,
  Target,
  FileText,
} from "lucide-react";

export const COUNCIL_DIRECTORY = [
  {
    id: 1,
    councilName: "Discipline Council (DISCO)",
    coordinatorName: "Mohan Kunjam / Akanksha Dewangan",
    coordinators: ["Mohan Kunjam", "Akanksha Dewangan"],
    councilPost: "Discipline Coordinator (Disco)",
    emails: ["disco@counciltrack.org"],
    loginHandle: "disco",
    councilEmail: "disco@counciltrack.org",
    defaultPassword: "Admin@123",
  },
  {
    id: 2,
    councilName: "Workout Council",
    coordinatorName: "Lalita / Radheshyam",
    coordinators: ["Lalita", "Radheshyam"],
    councilPost: "Workout Coordinator",
    emails: ["workout@counciltrack.org"],
    loginHandle: "workout",
    councilEmail: "workout@counciltrack.org",
    defaultPassword: "Admin@123",
  },
  {
    id: 3,
    councilName: "Academic Council (SOP)",
    coordinatorName: "Gungun",
    coordinators: ["Gungun"],
    councilPost: "Academic Coordinator (SOP)",
    emails: ["sop@counciltrack.org"],
    loginHandle: "sop",
    councilEmail: "sop@counciltrack.org",
    defaultPassword: "Admin@123",
  },
  {
    id: 4,
    councilName: "Academic Council (SOB)",
    coordinatorName: "Dinesh / Anjali",
    coordinators: ["Dinesh", "Anjali"],
    councilPost: "Academic Coordinator (SOB)",
    emails: ["sob@counciltrack.org"],
    loginHandle: "sob",
    councilEmail: "sob@counciltrack.org",
    defaultPassword: "Admin@123",
  },
  {
    id: 5,
    councilName: "Academic Council (SOF)",
    coordinatorName: "Mukesh / Nikita",
    coordinators: ["Mukesh", "Nikita"],
    councilPost: "Academic Coordinator (SOF)",
    emails: ["sof@counciltrack.org"],
    loginHandle: "sof",
    councilEmail: "sof@counciltrack.org",
    defaultPassword: "Admin@123",
  },
  {
    id: 6,
    councilName: "English Council",
    coordinatorName: "Dilip Kumar Sori / Deepa Sodi",
    coordinators: ["Dilip Kumar Sori", "Deepa Sodi"],
    councilPost: "English Facilitator",
    emails: ["english@counciltrack.org"],
    loginHandle: "english",
    councilEmail: "english@counciltrack.org",
    defaultPassword: "Admin@123",
  },
  {
    id: 7,
    councilName: "IT Council",
    coordinatorName: "Khushi / Subhash",
    coordinators: ["Khushi", "Subhash"],
    councilPost: "IT Coordinator",
    emails: ["it@counciltrack.org"],
    loginHandle: "it",
    councilEmail: "it@counciltrack.org",
    defaultPassword: "Admin@123",
  },
  {
    id: 8,
    councilName: "Health Council",
    coordinatorName: "Khushi / Sahdev",
    coordinators: ["Khushi", "Sahdev"],
    councilPost: "Health Coordinator",
    emails: ["health@counciltrack.org"],
    loginHandle: "health",
    councilEmail: "health@counciltrack.org",
    defaultPassword: "Admin@123",
  },
  {
    id: 9,
    councilName: "Hackathon Council",
    coordinatorName: "Vikky Podiyam",
    coordinators: ["Vikky Podiyam"],
    councilPost: "Hackathon Coordinator",
    emails: ["hackathon@counciltrack.org"],
    loginHandle: "hackathon",
    councilEmail: "hackathon@counciltrack.org",
    defaultPassword: "Admin@123",
  },
  {
    id: 10,
    councilName: "Placement Council",
    coordinatorName: "Himanshu",
    coordinators: ["Himanshu"],
    councilPost: "Placement Coordinator",
    emails: ["placement@counciltrack.org"],
    loginHandle: "placement",
    councilEmail: "placement@counciltrack.org",
    defaultPassword: "Admin@123",
  },
  {
    id: 11,
    councilName: "Outreach Council",
    coordinatorName: "Aakashi",
    coordinators: ["Aakashi"],
    councilPost: "Outreach Coordinator",
    emails: ["outreach@counciltrack.org"],
    loginHandle: "outreach",
    councilEmail: "outreach@counciltrack.org",
    defaultPassword: "Admin@123",
  },
  {
    id: 12,
    councilName: "Operations Council",
    coordinatorName: "Sanjana / Ramlal",
    coordinators: ["Sanjana", "Ramlal"],
    councilPost: "Operations Coordinator (Ops Coordinator)",
    emails: ["operations@counciltrack.org"],
    loginHandle: "operations",
    councilEmail: "operations@counciltrack.org",
    defaultPassword: "Admin@123",
  },
  {
    id: 13,
    councilName: "Culture Council",
    coordinatorName: "Kranti Kashyap / Vidya / Himani",
    coordinators: ["Kranti Kashyap", "Vidya", "Himani"],
    councilPost: "Culture Coordinator",
    emails: ["culture@counciltrack.org"],
    loginHandle: "culture",
    councilEmail: "culture@counciltrack.org",
    defaultPassword: "Admin@123",
  },
  {
    id: 14,
    councilName: "Induction Council",
    coordinatorName: "Sona / Kajal",
    coordinators: ["Sona", "Kajal"],
    councilPost: "Induction Coordinator",
    emails: ["induction@counciltrack.org"],
    loginHandle: "induction",
    councilEmail: "induction@counciltrack.org",
    defaultPassword: "Admin@123",
  },
];

export default function CouncilDirectoryTable({ onSelectEmail = null, title = "Official Council & Coordinator Directory" }) {
  const [search, setSearch] = useState("");
  const [copiedText, setCopiedText] = useState("");

  const handleCopy = (text) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedText(text);
      setTimeout(() => setCopiedText(""), 2000);
    }
  };

  const filtered = COUNCIL_DIRECTORY.filter((c) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      c.councilName.toLowerCase().includes(q) ||
      c.coordinatorName.toLowerCase().includes(q) ||
      c.councilPost.toLowerCase().includes(q) ||
      c.emails.some((e) => e.toLowerCase().includes(q)) ||
      c.councilEmail.toLowerCase().includes(q)
    );
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-slate-50 to-white">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
              <Building2 size={18} />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">{title}</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            NavGurukul Dantewada • 14 Official Councils & 25 Coordinators with login credentials
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search council, coordinator, post..."
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white"
          />
        </div>
      </div>

      {/* Directory Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600 text-[11px] uppercase tracking-wider font-semibold border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-center w-12">#</th>
              <th className="px-5 py-3">Council Name</th>
              <th className="px-5 py-3">Coordinator Name</th>
              <th className="px-5 py-3">Council Post</th>
              <th className="px-5 py-3">Login Email / ID</th>
              <th className="px-5 py-3 text-center">Default Password</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-xs text-slate-500">
                  No councils or coordinators found matching "{search}".
                </td>
              </tr>
            ) : (
              filtered.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/80 transition">
                  {/* # */}
                  <td className="px-4 py-3.5 text-center font-mono text-xs font-bold text-slate-400">
                    {c.id}
                  </td>

                  {/* Council Name */}
                  <td className="px-5 py-3.5">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Building2 size={15} className="text-indigo-600 flex-shrink-0" />
                      <span>{c.councilName}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      {c.councilEmail}
                    </div>
                  </td>

                  {/* Coordinator Name */}
                  <td className="px-5 py-3.5">
                    <div className="font-semibold text-slate-800">{c.coordinatorName}</div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {c.coordinators.map((name, i) => (
                        <span
                          key={i}
                          onClick={() => onSelectEmail && onSelectEmail(name.toLowerCase().split(" ")[0])}
                          className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100 ${
                            onSelectEmail ? "cursor-pointer hover:bg-indigo-100" : ""
                          }`}
                          title={onSelectEmail ? `Click to auto-fill ${name} in login` : undefined}
                        >
                          <Users size={10} />
                          <span>{name}</span>
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Council Post */}
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                      {c.councilPost}
                    </span>
                  </td>

                  {/* Login Email / ID */}
                  <td className="px-5 py-3.5">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5 group/email">
                        <code
                          onClick={() => onSelectEmail && onSelectEmail(c.councilEmail)}
                          className={`font-mono text-xs px-2 py-0.5 rounded bg-indigo-50 text-indigo-800 font-semibold border border-indigo-100 ${
                            onSelectEmail ? "cursor-pointer hover:bg-indigo-100 hover:text-indigo-900" : ""
                          }`}
                          title={onSelectEmail ? "Click to use in login" : undefined}
                        >
                          {c.councilEmail}
                        </code>
                        <button
                          type="button"
                          onClick={() => handleCopy(c.councilEmail)}
                          className="p-1 text-slate-400 hover:text-indigo-600 transition"
                          title="Copy email"
                        >
                          {copiedText === c.councilEmail ? (
                            <Check size={12} className="text-emerald-600" />
                          ) : (
                            <Copy size={12} />
                          )}
                        </button>
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1">
                        <span>Alias / Handle:</span>
                        <code
                          onClick={() => onSelectEmail && onSelectEmail(c.loginHandle)}
                          className={`font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-bold ${
                            onSelectEmail ? "cursor-pointer hover:bg-slate-200" : ""
                          }`}
                        >
                          {c.loginHandle}
                        </code>
                      </div>
                      <div className="text-[10px] text-slate-400 italic">
                        (Dono coordinators ka 1 hi shared login)
                      </div>
                    </div>
                  </td>

                  {/* Default Password */}
                  <td className="px-5 py-3.5 text-center">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-mono text-xs font-semibold border border-slate-200">
                      <KeyRound size={12} className="text-slate-500" />
                      <span>{c.defaultPassword}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(c.defaultPassword)}
                        className="p-0.5 text-slate-400 hover:text-indigo-600 transition ml-1"
                        title="Copy password"
                      >
                        {copiedText === c.defaultPassword ? (
                          <Check size={11} className="text-emerald-600" />
                        ) : (
                          <Copy size={11} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 4 Essential Operational Guidelines Cards */}
      <div className="p-5 bg-slate-50/80 border-t border-slate-200/90 grid grid-cols-1 md:grid-cols-2 gap-3.5">
        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-700">
            <span className="text-base">💡</span>
            <span>Direct Name Login</span>
          </div>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            Sabhi coordinators apne naam ya alias se bhi login kar sakte hain (jaise <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-800">lalita</code>, <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-800">deepa</code>, <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-800">dilip</code>, <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-800">gungun</code>, <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-800">dinesh</code>, <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-800">sona</code>, <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-800">kajal</code>, <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-800">vikky</code>, <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-800">himani</code>, <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-800">vidya</code> etc.).
          </p>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-700">
            <span className="text-base">🛡️</span>
            <span>Khushi (IT) & Khushi (Health) Resolution</span>
          </div>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            IT Council ke liye <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-800">khushi.it</code> / <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-800">khushi.it@counciltrack.org</code> aur Health Council ke liye <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-800">khushi.health</code> / <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-800">khushi.health@counciltrack.org</code> ko accurately route kar diya gaya hai.
          </p>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700">
            <span className="text-base">📋</span>
            <span>Admin Directory</span>
          </div>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            Admin Portal ke <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-800">/admin/members</code> me sabhi 25 members unke assigned council aur exact position ke sath visible aur editable hain.
          </p>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-700">
            <span className="text-base">🎯</span>
            <span>Daily Goals & Morning Dropdowns</span>
          </div>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            Council session ke andar dono coordinators ke naam dropdown me aayenge jisse har coordinator apne specific daily goals select karke submit kar sakta hai.
          </p>
        </div>
      </div>
    </div>
  );
}
