import { createContext, useContext, useState, useEffect } from "react";
import { authApi } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("counciltrack_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem("counciltrack_token"));
  const [loading, setLoading] = useState(true);

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("counciltrack_token");
    localStorage.removeItem("counciltrack_user");
  };

  useEffect(() => {
    async function verifySession() {
      if (token) {
        try {
          const res = await authApi.getMe();
          setUser(res.data.data);
          localStorage.setItem("counciltrack_user", JSON.stringify(res.data.data));
        } catch {
          logout();
        }
      }
      setLoading(false);
    }
    verifySession();
  }, [token]);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    const { token: receivedToken, user: receivedUser } = res.data.data;
    setToken(receivedToken);
    setUser(receivedUser);
    localStorage.setItem("counciltrack_token", receivedToken);
    localStorage.setItem("counciltrack_user", JSON.stringify(receivedUser));
    return receivedUser;
  };

  const refreshUser = async () => {
    try {
      const res = await authApi.getMe();
      setUser(res.data.data);
      localStorage.setItem("counciltrack_user", JSON.stringify(res.data.data));
      return res.data.data;
    } catch {
      return null;
    }
  };

  const userRole = (user?.role || "").toUpperCase();
  const isAdmin = userRole === "ADMIN";
  const isDisco = userRole === "DISCO";
  const isCouncil = userRole === "COUNCIL";

  const canMonitorAllGoals = isAdmin || isDisco;
  const canManageCouncils = isAdmin || isDisco;
  const canPromoteToDisco = isAdmin;
  const canViewConfidentialNotes = isAdmin;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role: userRole || "GUEST",
        isAdmin,
        isDisco,
        isCouncil,
        canMonitorAllGoals,
        canManageCouncils,
        canPromoteToDisco,
        canViewConfidentialNotes,
        isAuthenticated: Boolean(user && token),
        loading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
