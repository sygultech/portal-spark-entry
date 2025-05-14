import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/layouts/AppLayout";
import AuthLayout from "@/layouts/AuthLayout";
import Account from "@/pages/Account";
import AdminDashboard from "@/pages/AdminDashboard";
import Home from "@/pages/Home";
import Pricing from "@/pages/Pricing";
import Profile from "@/pages/Profile";
import ResetPassword from "@/pages/ResetPassword";
import SchoolDashboard from "@/pages/SchoolDashboard";
import SignIn from "@/pages/SignIn";
import SignUp from "@/pages/SignUp";
import SuperAdminDashboard from "@/pages/SuperAdminDashboard";
import SchoolManagement from "@/pages/SchoolManagement";

const Routes = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/pricing" element={<Pricing />} />

        {/* Auth Routes */}
        <Route
          path="/signin"
          element={
            <AuthLayout>
              <SignIn />
            </AuthLayout>
          }
        />
        <Route
          path="/signup"
          element={
            <AuthLayout>
              <SignUp />
            </AuthLayout>
          }
        />
        <Route
          path="/reset-password"
          element={
            <AuthLayout>
              <ResetPassword />
            </AuthLayout>
          }
        />

        {/* Protected Routes - General */}
        <Route
          path="/account"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Account />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Profile />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AppLayout>
                <AdminDashboard />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* School Admin Routes */}
        <Route
          path="/school-dashboard"
          element={
            <ProtectedRoute allowedRoles={["school_admin"]}>
              <AppLayout>
                <SchoolDashboard />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* Super Admin Routes */}
        <Route 
          path="/super-admin-dashboard" 
          element={
            <ProtectedRoute allowedRoles={["super_admin"]}>
              <AppLayout>
                <SuperAdminDashboard />
              </AppLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/school-management" 
          element={
            <ProtectedRoute allowedRoles={["super_admin"]}>
              <AppLayout>
                <SchoolManagement />
              </AppLayout>
            </ProtectedRoute>
          } 
        />
        
        {/* Default Route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

const ProtectedRoute = ({
  children,
  allowedRoles,
}: {
  children?: React.ReactNode;
  allowedRoles?: string[];
}) => {
  const { isAuthenticated, profile, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin" />;
  }

  if (allowedRoles && !allowedRoles.includes(profile?.role || "")) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};

export default Routes;
