import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Jobs from "./pages/Jobs";
import Companies from "./pages/Companies";
import Applications from "./pages/Applications";
import Interviews from "./pages/Interviews";
import AdminUsers from "./pages/AdminUsers";
import Sessions from "./pages/Sessions";
import NotFound from "./pages/NotFound";

import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";

function App() {
  const token = localStorage.getItem("token");

  return (
    <Routes>
      {/* Default Route */}
      <Route
        path="/"
        element={<Navigate to={token ? "/dashboard" : "/login"} replace />}
      />

      {/* Public Routes */}
      <Route
        path="/login"
        element={token ? <Navigate to="/dashboard" replace /> : <Login />}
      />

      <Route
        path="/register"
        element={token ? <Navigate to="/dashboard" replace /> : <Register />}
      />

      {/* Protected Dashboards */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Protected Profile */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Profile />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Protected Job Openings */}
      <Route
        path="/jobs"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Jobs />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Protected Company Registry */}
      <Route
        path="/companies"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Companies />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Protected Application Tracking */}
      <Route
        path="/applications"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Applications />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Protected Interview Schedules */}
      <Route
        path="/interviews"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Interviews />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Protected Mentorship Sessions */}
      <Route
        path="/sessions"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Sessions />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />


      {/* Admin Only Users Panel */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute role="admin">
            <DashboardLayout>
              <AdminUsers />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;