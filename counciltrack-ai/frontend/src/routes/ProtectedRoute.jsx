import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ allowedRoles = [] }) {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    if (allowedRoles.includes("ADMIN") && !allowedRoles.includes("DISCO")) {
      return <Navigate to="/admin/login" replace />;
    }
    if (allowedRoles.includes("DISCO")) {
      return <Navigate to="/disco/login" replace />;
    }
    return <Navigate to="/council/login" replace />;
  }

  const userRole = (user?.role || "").toUpperCase();
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    // Role mismatch: redirect to their respective dashboard
    if (userRole === "ADMIN") {
      return <Navigate to="/admin/dashboard" replace />;
    }
    if (userRole === "DISCO") {
      return <Navigate to="/disco/dashboard" replace />;
    }
    return <Navigate to="/council/dashboard" replace />;
  }

  return <Outlet />;
}
