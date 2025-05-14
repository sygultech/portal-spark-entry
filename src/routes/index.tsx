
import {
  BrowserRouter,
  Routes as RouterRoutes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/layout/AppLayout";
import AuthLayout from "@/components/AuthLayout";
import RoleNavigation from "@/components/RoleNavigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import SuperAdminDashboard from "@/pages/SuperAdminDashboard";
import SchoolManagement from "@/pages/SchoolManagement";
import SignIn from "@/pages/SignIn";
import SignUp from "@/pages/SignUp";
import Profile from "@/pages/ProfileSettings";
import Login from "@/pages/Login";
import NotFound from "@/pages/NotFound";
import Index from "@/pages/Index";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <RouterRoutes>
        {/* Public Routes */}
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />

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
        
        {/* Protected Routes - General */}
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

        {/* Super Admin Routes */}
        <Route 
          path="/super-admin-dashboard" 
          element={
            <ProtectedRoute requiredRoles={["super_admin"]}>
              <AppLayout>
                <SuperAdminDashboard />
              </AppLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/school-management" 
          element={
            <ProtectedRoute requiredRoles={["super_admin"]}>
              <AppLayout>
                <SchoolManagement />
              </AppLayout>
            </ProtectedRoute>
          } 
        />
        
        {/* Default Route */}
        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
    </BrowserRouter>
  );
};

export default AppRoutes;
