import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { LogIn } from "lucide-react";
import SuperAdminDashboard from "./SuperAdminDashboard";
import AdminDashboard from "./AdminDashboard";
import CouncilDashboard from "./CouncilDashboard";
import StudentDashboard from "./StudentDashboard";

export default function Dashboard() {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-green-600 border-t-transparent" />
      </div>
    );
  }

  // If not logged in, render the public dashboard view with an optional login banner
  if (!isAuthenticated || !user) {
    return (
      <div>
        <div className="bg-green-50 border-b border-green-200 px-6 py-2.5 text-xs text-green-900 flex justify-between items-center max-w-7xl mx-auto">
          <span>You are currently viewing the public dashboard.</span>
          <Link
            to="/login"
            className="font-bold text-green-800 hover:text-green-950 flex items-center gap-1 underline"
          >
            <LogIn size={13} /> Login for Council Member & Admin access
          </Link>
        </div>
        <StudentDashboard />
      </div>
    );
  }

  // Role-based views for authenticated users
  switch (user.role) {
    case "super_admin":
      return <SuperAdminDashboard />;
    case "admin":
      return <AdminDashboard />;
    case "council_member":
      return <CouncilDashboard />;
    case "student":
    default:
      return <StudentDashboard />;
  }
}
