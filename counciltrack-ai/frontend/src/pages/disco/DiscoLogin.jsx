import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Shield, Lock, User, ArrowRight, AlertCircle, ArrowLeft, Users, CheckCircle } from "lucide-react";

export default function DiscoLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await login(email, password);
      const role = (user.role || "").toUpperCase();
      if (role !== "DISCO" && role !== "ADMIN") {
        setError("This portal is exclusively for Discipline Coordinators (DISCO) and Staff Administrators.");
        setLoading(false);
        return;
      }
      navigate("/disco/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials or inactive account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-purple-50/20 to-white flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* NavGurukul Logo & Header */}
        <div className="text-center">
          <Link to="/" className="inline-block group mb-3">
            <img
              src="/navgurukul-logo.png"
              alt="NavGurukul Logo"
              className="h-14 w-auto mx-auto object-contain transition-transform group-hover:scale-105"
            />
          </Link>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 border border-purple-200/80 text-purple-700 text-xs font-semibold uppercase tracking-wider mb-2">
            <Shield size={14} />
            <span>Discipline & Governance Hub</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            DISCO Command Center
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-600">
            NavGurukul Dantewada • Chief Discipline Coordinator Portal
          </p>
        </div>

        <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 sm:rounded-2xl sm:px-10 card-hover-elevate">
            {error && (
              <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-2">
                <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Credentials Info Badge */}
            <div className="mb-5 p-3.5 rounded-xl bg-purple-50/90 border border-purple-100 text-xs text-purple-950 space-y-1.5">
              <div className="font-semibold flex items-center justify-between">
                <span>🛡️ DISCO Credentials:</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-purple-200/70 rounded text-purple-800">Coordinator</span>
              </div>
              <p className="text-[11px] text-purple-800">
                <strong>ID / Email:</strong> <code className="bg-white px-1.5 py-0.5 rounded text-purple-900 border border-purple-200 font-mono">disco</code> or <code className="bg-white px-1.5 py-0.5 rounded text-purple-900 border border-purple-200 font-mono">akanksha@counciltrack.org</code>
              </p>
              <p className="text-[11px] text-purple-800">
                <strong>Password:</strong> <code className="bg-white px-1.5 py-0.5 rounded text-purple-900 border border-purple-200 font-mono">Admin@123</code> or <code className="bg-white px-1.5 py-0.5 rounded text-purple-900 border border-purple-200 font-mono">Disco@123</code>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 tracking-wider">
                  DISCO ID or Email
                </label>
                <div className="mt-1 relative rounded-lg shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="disco or akanksha@counciltrack.org"
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 tracking-wider">
                  Password
                </label>
                <div className="mt-1 relative rounded-lg shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition disabled:opacity-50"
              >
                <span>{loading ? "Authenticating..." : "Login to DISCO Command Center"}</span>
                <ArrowRight size={16} />
              </button>
            </form>

            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <Link to="/council/login" className="font-medium text-slate-600 hover:text-emerald-600 hover:underline">
                Council Login
              </Link>
              <span className="text-slate-300">•</span>
              <Link to="/admin/login" className="font-medium text-slate-600 hover:text-indigo-600 hover:underline">
                Staff Admin Login
              </Link>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition">
              <ArrowLeft size={13} />
              <span>Back to Main Page</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}