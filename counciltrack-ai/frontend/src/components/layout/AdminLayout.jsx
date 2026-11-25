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
  CheckCircle2,
  Building2,
  Settings,
} from "lucide-react";

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  const copyFeedbackLink = () => {
    const link = `${window.location.origin}/feedback`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const navItems = [
    { label: "Dashboard Overview", path: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Total Council Members", path: "/admin/members", icon: Users },
    { label: "Council Management", path: "/admin/councils", icon: Building2 },
    { label: "Council Goals", path: "/admin/goals", icon: Target },
    { label: "Weekly & Monthly Overview", path: "/admin/overview", icon: BarChart3 },
    { label: "Student Feedback", path: "/admin/feedback", icon: MessageSquareHeart },
    { label: "Profile & Password", path: "/admin/settings", icon: Settings },
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
            <span className="block text-[10px] text-indigo-300">Council Admin Portal</span>
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
          mobileMenuOpen ? "flex" : "hidden"
        } md:flex w-full md:w-64 bg-slate-900 text-slate-300 flex-shrink-0 flex-col z-40 md:sticky md:top-0 md:h-screen max-h-screen`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-800 hidden md:flex items-center gap-3 shrink-0">
          <img
            src="/navgurukul-logo.png"
            alt="NavGurukul Logo"
            className="h-9 w-auto object-contain bg-white/95 rounded-lg p-1"
          />
          <div>
            <h1 className="font-bold text-white text-sm leading-tight">NavGurukul Dantewada</h1>
            <p className="text-[11px] text-indigo-400 font-medium">Council Portal</p>
          </div>
        </div>

        {/* Admin Badge */}
        <div className="px-5 py-3 bg-slate-800/60 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Shield size={15} className="text-indigo-400" />
            <span className="text-xs font-semibold text-slate-200">Admin Portal</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-medium">
            Active
          </span>
        </div>

        {/* Scrollable Navigation Tabs */}
        <nav className="flex-1 min-h-0 p-3 space-y-1 overflow-y-auto scrollbar-thin">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800"
                }`}
              >
                <Icon size={18} className={isActive ? "text-white" : "text-slate-400"} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Public Feedback Link Action */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/80 shrink-0">
          <button
            onClick={copyFeedbackLink}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-indigo-300 font-medium border border-slate-700 transition"
          >
            {copiedLink ? <CheckCircle2 size={14} className="text-emerald-400" /> : <ExternalLink size={14} />}
            <span>{copiedLink ? "Link Copied!" : "Copy Public Feedback Link"}</span>
          </button>
        </div>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-950/60 shrink-0">
          <div className="min-w-0 pr-2">
            <p className="text-xs font-semibold text-slate-200 truncate">{user?.name || "Administrator"}</p>
            <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            title="Log out"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-300 hover:text-white bg-rose-500/10 hover:bg-rose-600 transition shrink-0"
          >
            <LogOut size={14} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                NavGurukul Dantewada
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-500">Centralized Governance</span>
            </div>
            <h2 className="text-lg font-bold text-slate-800">
              Council Portal Management
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs text-slate-500">Today</p>
              <p className="text-xs font-medium text-slate-800">
                {new Date().toLocaleDateString("en-IN", {
                  weekday: "short",
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
            <Link
              to="/feedback"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-medium border border-indigo-200 transition"
            >
              <span>Preview Public Form</span>
              <ExternalLink size={12} />
            </Link>
          </div>
        </header>

        <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
