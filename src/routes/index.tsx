import {
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
import SchoolAdminDashboard from "@/pages/SchoolAdminDashboard";
import SchoolManagement from "@/pages/SchoolManagement";
import Profile from "@/pages/ProfileSettings";
import Login from "@/pages/Login";
import NotFound from "@/pages/NotFound";
import Index from "@/pages/Index";
import SignUp from "@/pages/SignUp";
import SchoolAdmin from "@/pages/SchoolAdmin";
import Academic from "@/pages/Academic";
import Students from "@/pages/Students";

const AppRoutes = () => {
  return (
    <RouterRoutes>
      {/* Public Routes */}
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />

      {/* Auth Routes */}
      <Route
        path="/signin"
        element={
          <AuthLayout
            title="Sign in to your account"
            subtitle="Welcome back! Please enter your details."
          >
            <Login />
          </AuthLayout>
        }
      />
      <Route
        path="/signup"
        element={
          <AuthLayout
            title="Create an account"
            subtitle="Enter your information to get started"
          >
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
      
      {/* School Admin Routes */}
      <Route 
        path="/school-admin" 
        element={
          <ProtectedRoute requiredRoles={["school_admin"]}>
            <AppLayout>
              <SchoolAdmin />
            </AppLayout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/students" 
        element={
          <ProtectedRoute requiredRoles={["school_admin", "teacher"]}>
            <AppLayout>
              <Students />
            </AppLayout>
          </ProtectedRoute>
        } 
      />
      
      {/* Academic Routes */}
      <Route 
        path="/academic" 
        element={
          <ProtectedRoute requiredRoles={["school_admin"]}>
            <AppLayout>
              <Academic />
            </AppLayout>
          </ProtectedRoute>
        } 
      />
      
      {/* Default Route */}
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<NotFound />} />
    </RouterRoutes>
  );
};

export default AppRoutes;
