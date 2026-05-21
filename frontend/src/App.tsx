import { Route, Routes, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AddApplication from "./pages/AddApplication";
import ApplicationDetail from "./pages/ApplicationDetail";

import ProtectedRoutes from "./components/ProtectedRoutes";
function App() {
  return (
    <div>
      <Routes>
        {/* unprotected routes */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* protected routes */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoutes>
              <Dashboard />
            </ProtectedRoutes>
          }
        />
        <Route
          path="/jobs/:id"
          element={
            <ProtectedRoutes>
              <ApplicationDetail />
            </ProtectedRoutes>
          }
        />
        <Route
          path="/addApplication"
          element={
            <ProtectedRoutes>
              <AddApplication />
            </ProtectedRoutes>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
