import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";

// Layouts
import AdminLayout from "./components/layout/AdminLayout";
import CouncilLayout from "./components/layout/CouncilLayout";

// Public Pages
import Home from "./pages/Home";
import AdminLogin from "./pages/admin/AdminLogin";
import CouncilLogin from "./pages/council/CouncilLogin";
import FeedbackForm from "./pages/public/FeedbackForm";

// Admin Portal Pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminMembers from "./pages/admin/Members";
import AdminCouncils from "./pages/admin/Councils";
import AdminGoals from "./pages/admin/CouncilGoals";
import AdminOverview from "./pages/admin/Overview";
import AdminFeedback from "./pages/admin/Feedback";

// Council Member Portal Pages
import CouncilDashboard from "./pages/council/Dashboard";
import DailyGoals from "./pages/council/DailyGoals";
import EveningReflection from "./pages/council/EveningReflection";
import WeeklyProgress from "./pages/council/WeeklyProgress";
import MonthlyProgress from "./pages/council/MonthlyProgress";
import CouncilFeedback from "./pages/council/CouncilFeedback";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Landing & Feedback Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/feedback" element={<FeedbackForm />} />

          {/* Dedicated Login Routes (PRD Section 3.1) */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/council/login" element={<CouncilLogin />} />
          <Route path="/login" element={<Navigate to="/council/login" replace />} />

          {/* Admin Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="members" element={<AdminMembers />} />
              <Route path="councils" element={<AdminCouncils />} />
              <Route path="goals" element={<AdminGoals />} />
              <Route path="overview" element={<AdminOverview />} />
              <Route path="feedback" element={<AdminFeedback />} />
            </Route>
          </Route>

          {/* Council Member Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={["COUNCIL"]} />}>
            <Route path="/council" element={<CouncilLayout />}>
              <Route index element={<Navigate to="/council/dashboard" replace />} />
              <Route path="dashboard" element={<CouncilDashboard />} />
              <Route path="goals" element={<DailyGoals />} />
              <Route path="reflection" element={<EveningReflection />} />
              <Route path="weekly-progress" element={<WeeklyProgress />} />
              <Route path="monthly-progress" element={<MonthlyProgress />} />
              <Route path="feedback" element={<CouncilFeedback />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
