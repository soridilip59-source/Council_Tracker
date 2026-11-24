import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogIn, LogOut, User, Bell } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { notifications, clearNotifications } = useSocket();
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  const links = [
    ["Home", "/"],
    ["About Us", "/about"],
    ["Councils", "/councils"],
    ["Goals", "/goals"],
    ["Dashboard", "/dashboard"],
    ["Gallery", "/gallery"],
    ["Feedback", "/feedback"],
    ["Contact Us", "/contact"],
  ];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="bg-white sticky top-0 z-50 border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-5 py-3 flex justify-between items-center">
        {/* NavGurukul Branding */}
        <Link to="/" className="flex items-center gap-3">
          <img
            src="/navgurukul-logo.png"
            alt="NavGurukul Logo"
            className="w-28 h-14 object-contain"
          />
          <div className="border-l pl-3">
            <h1 className="font-bold text-gray-900">NavGurukul</h1>
            <p className="text-xs text-gray-500">Dantewada Campus</p>
            <p className="text-xs text-green-700 font-semibold">
              CouncilTrack AI
            </p>
          </div>
        </Link>

        {/* Navigation Links */}
        <div className="hidden lg:flex gap-6 items-center">
          {links.map(([name, path]) => (
            <Link
              key={path}
              to={path}
              className="text-sm font-medium text-gray-700 hover:text-green-700 transition hover-underline-link"
            >
              {name}
            </Link>
          ))}
        </div>

        {/* Auth / Login State */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg relative transition"
                  title="Notifications"
                >
                  <Bell size={18} />
                  {notifications?.length > 0 && (
                    <span className="absolute top-1 right-1 h-2 w-2 bg-green-600 rounded-full" />
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 z-50">
                    <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-100">
                      <span className="text-xs font-bold text-gray-700">Live Updates</span>
                      {notifications?.length > 0 && (
                        <button onClick={clearNotifications} className="text-[11px] text-gray-400 hover:text-gray-600">
                          Clear
                        </button>
                      )}
                    </div>
                    {notifications?.length === 0 ? (
                      <p className="text-xs text-gray-400 py-3 text-center">No new notifications</p>
                    ) : (
                      <div className="space-y-2 max-h-56 overflow-y-auto">
                        {notifications.map((n) => (
                          <div key={n.id} className="text-xs p-2 rounded-lg bg-gray-50 text-gray-700 border border-gray-100">
                            {n.text}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* User Profile Info */}
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-xs font-bold text-gray-900">{user?.name}</span>
                <span className="text-[10px] text-green-700 font-semibold uppercase">
                  {user?.role?.replace("_", " ")}
                </span>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-700 px-3.5 py-2 rounded-lg transition flex items-center gap-1.5 text-xs font-semibold"
                title="Logout"
              >
                <LogOut size={15} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="bg-green-800 text-white px-5 py-2.5 rounded-lg flex gap-2 items-center hover:bg-green-900 transition font-medium text-sm"
            >
              <LogIn size={17} /> Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
