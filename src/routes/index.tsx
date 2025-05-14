
import { Route, Routes } from 'react-router-dom';
import { Outlet } from 'react-router-dom';

import Login from '@/pages/Login';
import SignUp from '@/pages/SignUp';
import Index from '@/pages/Index';
import NotFound from '@/pages/NotFound';
import CreateSuperAdmin from '@/pages/CreateSuperAdmin';
import SuperAdminDashboard from '@/pages/SuperAdminDashboard';
import SchoolManagement from '@/pages/SchoolManagement';
import ProfileSettings from '@/pages/ProfileSettings';

import ProtectedRoute from '@/components/ProtectedRoute';
import AppLayout from '@/components/layout/AppLayout';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/create-super-admin" element={<CreateSuperAdmin />} />

      {/* Protected routes with AppLayout */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout>
              <Outlet />
            </AppLayout>
          </ProtectedRoute>
        }
      >
        {/* Super Admin Routes */}
        <Route
          path="/super-admin-dashboard"
          element={
            <ProtectedRoute requiredRoles={["super_admin"]}>
              <SuperAdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/school-management"
          element={
            <ProtectedRoute requiredRoles={["super_admin"]}>
              <SchoolManagement />
            </ProtectedRoute>
          }
        />

        {/* Profile Settings Route - accessible by all authenticated users */}
        <Route path="/profile/settings" element={<ProfileSettings />} />

        {/* Default route */}
        <Route path="/" element={<Index />} />
      </Route>

      {/* Catch-all route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
