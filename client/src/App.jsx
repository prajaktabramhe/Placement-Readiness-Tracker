import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Companies from "./pages/Companies";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

import ProtectedRoute from "./components/ProtectedRoute";

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
        element={
          token ? <Navigate to="/dashboard" replace /> : <Login />
        }
      />

      <Route
        path="/register"
        element={
          token ? <Navigate to="/dashboard" replace /> : <Register />
        }
      />

      {/* Protected Dashboard */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Protected Companies */}
      <Route
        path="/companies"
        element={
          <ProtectedRoute>
            <Companies />
          </ProtectedRoute>
        }
      />

      {/* Admin Only */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute role="admin">
            <Admin />
          </ProtectedRoute>
        }
      />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;