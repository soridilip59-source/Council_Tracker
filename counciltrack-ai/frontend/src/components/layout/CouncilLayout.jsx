import { useState } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  Target,
  Sparkles,
  TrendingUp,
  CalendarDays,
  MessageSquare,
  LogOut,
  Menu,
  X,
  Building,
  Calendar,
  Settings,
} from "lucide-react";

export default function CouncilLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/council/login");
  };

  const navItems = [
    { label: "Dashboard", path: "/council/dashboard", icon: LayoutDashboard },
    { label: "My Daily Goals", path: "/council/goals", icon: Target },
    { label: "Weekly Goals", path: "/council/weekly-goals", icon: Calendar },
    { label: "Evening Reflection", path: "/council/reflection", icon: Sparkles },
    { label: "Weekly Progress", path: "/council/weekly-progress", icon: TrendingUp },
    { label: "Monthly Progress", path: "/council/monthly-progress", icon: CalendarDays },
    { label: "Council Feedback", path: "/council/feedback", icon: MessageSquare },
    { label: "Profile & Password", path: "/council/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-900 font-sans">
      {/* Mobile Top Bar */}
      <div className="md:hidden bg-indigo-950 text-white flex items-center justify-between p-4 sticky top-0 z-50 shadow">
        <div className="flex items-center gap-2.5">
          <img
            src="/navgurukul-logo.png"
            alt="NavGurukul Logo"
            className="h-8 w-auto object-contain bg-white/95 rounded-md p-1"
          />
          <div>
            <span className="font-bold tracking-tight text-white text-sm">NavGurukul Dantewada</span>
            <span className="block text-[10px] text-indigo-300">Council Member Portal</span>
          </div>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1 rounded-md text-indigo-200 hover:text-white hover:bg-indigo-900"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`${
          mobileMenuOpen ? "block" : "hidden"
        } md:block w-full md:w-64 bg-indigo-950 text-indigo-200 flex-shrink-0 flex flex-col z-40 md:sticky md:top-0 md:h-screen`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-indigo-900 hidden md:flex items-center gap-3">
          <img
            src="/navgurukul-logo.png"
            alt="NavGurukul Logo"
            className="h-9 w-auto object-contain bg-white/95 rounded-lg p-1"
          />
          <div>
            <h1 className="font-bold text-white text-sm leading-tight">NavGurukul Dantewada</h1>
            <p className="text-[11px] text-indigo-300 font-medium">Council Portal</p>
          </div>
        </div>

        {/* Council Member Badge */}
        <div className="px-5 py-3.5 bg-indigo-900/60 border-b border-indigo-900">
          <div className="flex items-center gap-2 mb-1">
            <Building size={14} className="text-indigo-400" />
            <span className="text-xs font-semibold text-white truncate">
              {user?.councilName || "Assigned Council"}
            </span>
          </div>
          <p className="text-[11px] text-indigo-300 font-medium truncate">
            {user?.position || "Council Member"}
          </p>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
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
                    : "text-indigo-200 hover:text-white hover:bg-indigo-900/60"
                }`}
              >
                <Icon size={18} className={isActive ? "text-white" : "text-indigo-300"} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-indigo-900 flex items-center justify-between bg-indigo-950">
          <div className="min-w-0 pr-2">
            <p className="text-xs font-semibold text-white truncate">{user?.name || "Council Member"}</p>
            <p className="text-[11px] text-indigo-400 truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            title="Log out"
            className="p-2 rounded-lg text-indigo-300 hover:text-rose-400 hover:bg-indigo-900 transition"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                {user?.councilName || "Council"}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-500">{user?.position || "Member"}</span>
            </div>
            <h2 className="text-lg font-bold text-slate-800">
              Welcome back, {user?.name?.split(" ")[0] || "Member"}!
            </h2>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-xs text-slate-500">Today</p>
            <p className="text-xs font-medium text-slate-800">
              {new Date().toLocaleDateString("en-IN", {
                weekday: "long",
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
        </header>

        <main className="flex-1 p-6 max-w-6xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
