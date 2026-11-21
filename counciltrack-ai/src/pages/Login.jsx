import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogIn, Sparkles, AlertCircle, CheckCircle2, ArrowRight, LogOut } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, isAuthenticated, login, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e?.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      if (!err.response) {
        setError("Cannot reach backend server. Please verify the backend is running at http://localhost:4000.");
      } else {
        setError(err.response?.data?.error || "Login failed. Please check your credentials.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = async (demoEmail) => {
    setEmail(demoEmail);
    setPassword("Admin@123");
    setError("");
    setIsSubmitting(true);
    try {
      await login(demoEmail, "Admin@123");
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // If already authenticated
  if (isAuthenticated && user) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6 bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100 text-center">
          <div className="inline-flex p-3 bg-green-50 text-green-700 rounded-full mb-4">
            <CheckCircle2 size={36} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Already Logged In</h2>
          <p className="text-sm text-gray-500 mb-6">
            Signed in as <strong>{user.name}</strong> ({user.role?.replace("_", " ")})
          </p>

          <div className="space-y-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="w-full py-3 bg-green-800 hover:bg-green-900 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition shadow"
            >
              Go to Dashboard <ArrowRight size={17} />
            </button>
            <button
              onClick={logout}
              className="w-full py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium rounded-xl flex items-center justify-center gap-2 transition text-sm"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-6 bg-gradient-to-b from-[#F8FAF8] to-gray-100 text-gray-800">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
        {/* Header with NavGurukul Branding */}
        <div className="text-center mb-6">
          <img
            src="/navgurukul-logo.png"
            alt="NavGurukul Logo"
            className="w-32 h-14 object-contain mx-auto mb-3"
          />
          <h2 className="text-2xl font-bold text-gray-900">Login to CouncilTrack AI</h2>
          <p className="text-xs text-gray-500 mt-1">Dantewada Campus • Council Management Platform</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. rahul@counciltrack.org"
              required
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-green-800 hover:bg-green-900 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition shadow hover:shadow-md disabled:opacity-50 text-sm"
          >
            {isSubmitting ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <>
                <LogIn size={17} /> Login
              </>
            )}
          </button>
        </form>

        {/* 1-Click Demo Login Shortcuts */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider text-center mb-3 flex items-center justify-center gap-1.5">
            <Sparkles size={14} className="text-amber-500" /> 1-Click Demo Login (Test Roles)
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => handleQuickLogin("superadmin@counciltrack.org")}
              className="p-2.5 bg-purple-50 hover:bg-purple-100 text-purple-800 rounded-xl font-medium border border-purple-200 transition text-left"
            >
              👑 Super Admin
            </button>
            <button
              onClick={() => handleQuickLogin("admin@counciltrack.org")}
              className="p-2.5 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-xl font-medium border border-blue-200 transition text-left"
            >
              🛡️ Admin
            </button>
            <button
              onClick={() => handleQuickLogin("rahul@counciltrack.org")}
              className="p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl font-medium border border-emerald-200 transition text-left"
            >
              🎯 Council Member
            </button>
            <button
              onClick={() => handleQuickLogin("student@counciltrack.org")}
              className="p-2.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl font-medium border border-amber-200 transition text-left"
            >
              🎓 Student
            </button>
          </div>
          <p className="text-[11px] text-gray-400 text-center mt-3">
            Pre-configured test password: <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-700">Admin@123</code>
          </p>
        </div>
      </div>
    </div>
  );
}
