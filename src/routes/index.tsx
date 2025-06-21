
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import SignUp from '@/pages/SignUp';
import Dashboard from '@/pages/Dashboard';
import SuperAdminDashboard from '@/pages/SuperAdminDashboard';
import SchoolAdminDashboard from '@/pages/SchoolAdminDashboard';
import SchoolManagement from '@/pages/SchoolManagement';
import Academic from '@/pages/Academic';
import Students from '@/pages/Students';
import StaffManagement from '@/pages/StaffManagement';
import Attendance from '@/pages/Attendance';
import Timetable from '@/pages/Timetable';
import ProfileSettings from '@/pages/ProfileSettings';
import NotFound from '@/pages/NotFound';
import CreateSuperAdmin from '@/pages/CreateSuperAdmin';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Index />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/signup',
    element: <SignUp />,
  },
  {
    path: '/create-super-admin',
    element: <CreateSuperAdmin />,
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <Layout>
          <Dashboard />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/super-admin',
    element: (
      <ProtectedRoute requiredRoles={['super_admin']}>
        <Layout>
          <SuperAdminDashboard />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/school-admin',
    element: (
      <ProtectedRoute requiredRoles={['school_admin']}>
        <Layout>
          <SchoolAdminDashboard />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/schools',
    element: (
      <ProtectedRoute requiredRoles={['super_admin']}>
        <Layout>
          <SchoolManagement />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/academic',
    element: (
      <ProtectedRoute requiredRoles={['super_admin', 'school_admin', 'teacher']}>
        <Layout>
          <Academic />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/students',
    element: (
      <ProtectedRoute requiredRoles={['super_admin', 'school_admin', 'teacher']}>
        <Layout>
          <Students />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/staff',
    element: (
      <ProtectedRoute requiredRoles={['super_admin', 'school_admin']}>
        <Layout>
          <StaffManagement />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/attendance',
    element: (
      <ProtectedRoute requiredRoles={['super_admin', 'school_admin', 'teacher', 'parent']}>
        <Layout>
          <Attendance />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/timetable',
    element: (
      <ProtectedRoute requiredRoles={['super_admin', 'school_admin', 'teacher']}>
        <Layout>
          <Timetable />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/profile',
    element: (
      <ProtectedRoute>
        <Layout>
          <ProfileSettings />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);

// Default export for the AppRoutes component
const AppRoutes = () => {
  return <RouterProvider router={router} />;
};

export default AppRoutes;
