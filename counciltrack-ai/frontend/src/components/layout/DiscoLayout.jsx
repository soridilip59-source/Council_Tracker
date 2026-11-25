import { useState } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  Users,
  Shield,
  Target,
  BarChart3,
  MessageSquareHeart,
  ExternalLink,
  LogOut,
  Menu,
  X,
  Building2,
  Sparkles,
  AlertTriangle,
  Moon,
} from "lucide-react";

export default function DiscoLayout() {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/disco/login");
  };

  const navItems = [
    { label: "DISCO Command Center", path: "/disco/dashboard", icon: LayoutDashboard },
    { label: "Councils & Roster", path: "/disco/councils", icon: Building2 },
    { label: "Goals Monitoring Board", path: "/disco/goals", icon: Target },
    { label: "Blocker & Issue Triage", path: "/disco/blockers", icon: AlertTriangle },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-900 font-sans">
      {/* Mobile Top Bar */}
      <div className="md:hidden bg-slate-900 text-white flex items-center justify-between p-4 sticky top-0 z-50 shadow">
        <div className="flex items-center gap-2.5">
          <img
            src="/navgurukul-logo.png"
            alt="NavGurukul Logo"
            className="h-8 w-auto object-contain bg-white/95 rounded-md p-1"
          />
          <div>
            <span className="font-bold tracking-tight text-white text-sm">NavGurukul Dantewada</span>
            <span className="block text-[10px] text-purple-300">DISCO Command Center</span>
          </div>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1 rounded-md text-slate-300 hover:text-white hover:bg-slate-800"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`${
          mobileMenuOpen ? "block" : "hidden"
        } md:block w-full md:w-64 bg-slate-900 text-slate-300 flex-shrink-0 flex flex-col z-40 md:sticky md:top-0 md:h-screen`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-800 hidden md:flex items-center gap-3">
          <img
            src="/navgurukul-logo.png"
            alt="NavGurukul Logo"
            className="h-9 w-auto object-contain bg-white/95 rounded-lg p-1"
          />
          <div>
            <h1 className="font-bold text-white text-sm leading-tight">NavGurukul Dantewada</h1>
            <p className="text-[11px] text-purple-400 font-medium">DISCO Governance Portal</p>
          </div>
        </div>

        {/* DISCO Coordinator Profile Badge */}
        <div className="px-5 py-3.5 bg-slate-800/60 border-b border-slate-800">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <Shield size={14} className="text-purple-400" />
              <span className="text-xs font-bold text-white">Chief DISCO</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30">
              Discipline Lead
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-200 truncate">{user?.name || "Discipline Coordinator"}</p>
          <p className="text-[11px] text-slate-400 truncate">{user?.position || "Discipline Coordinator (DISCO)"}</p>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition ${
                  active
                    ? "bg-purple-600 text-white font-semibold shadow-xs"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/80"
                }`}
              >
                <Icon size={16} className={active ? "text-white" : "text-slate-400"} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer Area */}
        <div className="p-3 border-t border-slate-800 space-y-2">
          {isAdmin && (
            <Link
              to="/admin/dashboard"
              className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium bg-slate-800 text-indigo-300 hover:bg-slate-700 hover:text-white transition"
            >
              <div className="flex items-center gap-2">
                <Shield size={14} />
                <span>Staff Admin Portal</span>
              </div>
              <ExternalLink size={12} />
            </Link>
          )}

          <Link
            to="/council/dashboard"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium bg-slate-800/70 text-emerald-300 hover:bg-slate-700 hover:text-white transition"
          >
            <div className="flex items-center gap-2">
              <Target size={14} />
              <span>Council Portal</span>
            </div>
            <ExternalLink size={12} />
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}