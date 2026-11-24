import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Target, Lock, User, ArrowRight, AlertCircle, Sparkles, ArrowLeft } from "lucide-react";

export default function CouncilLogin() {
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
      if ((user.role || "").toUpperCase() !== "COUNCIL") {
        setError("This portal is for Council Members. Please use the Admin Portal Login.");
        setLoading(false);
        return;
      }
      navigate("/council/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials or inactive account");
    } finally {
      setLoading(false);
    }
  };

  const fillMember = (demoId, demoPass = "Council@123") => {
    setEmail(demoId);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-indigo-50/20 to-white flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
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
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-xs font-semibold uppercase tracking-wider mb-2">
            <Target size={14} />
            <span>Council Coordinator Portal</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Council Member Login
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-600">
            NavGurukul Dantewada • Daily Goals & Reflections
          </p>
        </div>

        <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 sm:rounded-2xl sm:px-10 card-hover-emerald">
            {error && (
              <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-2">
                <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Credentials Info Badge */}
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-50/90 border border-emerald-100 text-xs text-emerald-950 space-y-1.5">
              <div className="font-semibold flex items-center justify-between">
                <span>🔑 Council Credentials:</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-emerald-200/70 rounded text-emerald-800">Ready</span>
              </div>
              <p className="text-[11px] text-emerald-800">
                <strong>Council ID:</strong> <code className="bg-white px-1.5 py-0.5 rounded text-emerald-900 border border-emerald-200 font-mono">council</code> or <code className="bg-white px-1.5 py-0.5 rounded text-emerald-900 border border-emerald-200 font-mono">englishfacilitator@navgurukul.org</code>
              </p>
              <p className="text-[11px] text-emerald-800">
                <strong>Password:</strong> <code className="bg-white px-1.5 py-0.5 rounded text-emerald-900 border border-emerald-200 font-mono">Council@123</code>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 tracking-wider">
                  Council Member ID or Email
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
                    placeholder="council or englishfacilitator@navgurukul.org"
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent text-sm"
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
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition disabled:opacity-50"
              >
                <span>{loading ? "Authenticating..." : "Login to Council Portal"}</span>
                <ArrowRight size={16} />
              </button>
            </form>

            {/* Quick Demo Pre-fill Buttons */}
            <div className="mt-5 pt-4 border-t border-slate-100 space-y-2">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-center">
                Quick Auto-fill Options
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => fillMember("englishfacilitator@navgurukul.org", "Council@123")}
                  className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 text-left truncate transition"
                >
                  <span className="font-semibold block truncate">English Facilitator</span>
                  <span className="text-[10px] text-slate-500 block truncate">english / Council@123</span>
                </button>
                <button
                  type="button"
                  onClick={() => fillMember("academicfacilitator@navgurukul.org", "Council@123")}
                  className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 text-left truncate transition"
                >
                  <span className="font-semibold block truncate">Academic Facilitator</span>
                  <span className="text-[10px] text-slate-500 block truncate">academic / Council@123</span>
                </button>
              </div>
            </div>

            <div className="mt-5 text-center text-xs text-slate-500">
              <span>Admin account? </span>
              <Link to="/admin/login" className="font-semibold text-indigo-600 hover:underline">
                Go to Admin Portal
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
