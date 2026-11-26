import { useState } from "react";
import { authApi } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { User, Lock, CheckCircle, AlertCircle, Settings, Eye, EyeOff } from "lucide-react";

export default function ProfileSettings() {
  const { user, updateUser } = useAuth();

  // Profile update state
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [customUserId, setCustomUserId] = useState(user?.slug || "");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSuccess, setPwSuccess] = useState("");
  const [pwError, setPwError] = useState("");

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileError("");
    setProfileSuccess("");
    if (!name.trim()) { setProfileError("Name is required."); return; }
    setProfileSaving(true);
    try {
      const res = await authApi.updateProfile({
        name: name.trim(),
        email: email.trim(),
        customUserId: customUserId.trim(),
      });
      const updatedUser = res.data.data;
      updateUser(updatedUser);
      setProfileSuccess("Profile updated successfully!");
    } catch (err) {
      setProfileError(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwError("");
    setPwSuccess("");
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPwError("All fields are required."); return;
    }
    if (newPassword !== confirmPassword) {
      setPwError("New password and confirm password do not match."); return;
    }
    if (newPassword.trim().length < 4) {
      setPwError("New password must be at least 4 characters."); return;
    }
    setPwSaving(true);
    try {
      await authApi.changePassword({ currentPassword, newPassword });
      setPwSuccess("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPwError(err.response?.data?.message || "Failed to change password.");
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <Settings className="text-indigo-600" size={28} />
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Account Settings</h1>
          <p className="text-sm text-slate-500">
            {user?.councilName ? `${user.councilName} · ` : ""}{user?.email}
          </p>
        </div>
      </div>

      {/* Update Profile Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
        <div className="flex items-center gap-2 mb-1">
          <User size={18} className="text-indigo-600" />
          <h2 className="text-base font-bold text-slate-900">Update Profile</h2>
        </div>
        <p className="text-xs text-slate-500 -mt-2">Change your display name or login email.</p>

        {profileError && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <span>{profileError}</span>
          </div>
        )}
        {profileSuccess && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-start gap-2">
            <CheckCircle size={16} className="flex-shrink-0 mt-0.5" />
            <span>{profileSuccess}</span>
          </div>
        )}

        <form onSubmit={handleProfileSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Custom Login User ID / Handle
            </label>
            <input
              type="text"
              value={customUserId}
              onChange={(e) => setCustomUserId(e.target.value)}
              placeholder={user?.role === "ADMIN" ? "admin" : "e.g. disco, english"}
              className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 font-mono"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              {user?.role === "COUNCIL"
                ? "💡 Dono coordinators is custom User ID se login kar sakte hain (jaise 'disco')."
                : "💡 Aap is custom User ID se direct Admin Portal me login kar sakte hain."}
            </p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Login Email *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@counciltrack.org"
              className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
            />
          </div>
          <div className="pt-1">
            <button
              type="submit"
              disabled={profileSaving}
              className="w-full bg-indigo-600 text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-indigo-700 transition disabled:opacity-60"
            >
              {profileSaving ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </form>
      </div>

      {/* Change Password Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
        <div className="flex items-center gap-2 mb-1">
          <Lock size={18} className="text-indigo-600" />
          <h2 className="text-base font-bold text-slate-900">Change / Reset Password</h2>
        </div>
        <p className="text-xs text-slate-500 -mt-2">Update your login password (minimum 4 characters).</p>

        {pwError && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <span>{pwError}</span>
          </div>
        )}
        {pwSuccess && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-start gap-2">
            <CheckCircle size={16} className="flex-shrink-0 mt-0.5" />
            <span>{pwSuccess}</span>
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Current Password *
            </label>
            <div className="relative">
              <input
                type={showCurrentPw ? "text" : "password"}
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border border-slate-300 rounded-xl px-3 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPw(!showCurrentPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                title={showCurrentPw ? "Hide password" : "Show password"}
              >
                {showCurrentPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              New Password *
            </label>
            <div className="relative">
              <input
                type={showNewPw ? "text" : "password"}
                required
                minLength={4}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border border-slate-300 rounded-xl px-3 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
              />
              <button
                type="button"
                onClick={() => setShowNewPw(!showNewPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                title={showNewPw ? "Hide password" : "Show password"}
              >
                {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Confirm New Password *
            </label>
            <div className="relative">
              <input
                type={showConfirmPw ? "text" : "password"}
                required
                minLength={4}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border border-slate-300 rounded-xl px-3 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPw(!showConfirmPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                title={showConfirmPw ? "Hide password" : "Show password"}
              >
                {showConfirmPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div className="pt-1">
            <button
              type="submit"
              disabled={pwSaving}
              className="w-full bg-slate-900 text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-slate-800 transition disabled:opacity-60"
            >
              {pwSaving ? "Changing..." : "Change Password"}
            </button>
          </div>
        </form>
      </div>

      {/* Council Members Info (read-only) */}
      {user?.members && user.members.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-900">Council Members</h2>
          <p className="text-xs text-slate-500 -mt-2">Members registered under this council account.</p>
          <div className="space-y-2">
            {user.members.map((m, i) => (
              <div
                key={m.memberId || i}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 text-sm"
              >
                <div>
                  <p className="font-semibold text-slate-800">{m.name}</p>
                  <p className="text-xs text-slate-500">{m.email || ""}</p>
                </div>
                <span className="text-xs font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">
                  {m.position || "Member"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
