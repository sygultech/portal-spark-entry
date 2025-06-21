
import { Routes, Route } from 'react-router-dom';
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

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/create-super-admin" element={<CreateSuperAdmin />} />
      
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Layout>
            <Dashboard />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/super-admin" element={
        <ProtectedRoute requiredRoles={['super_admin']}>
          <Layout>
            <SuperAdminDashboard />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/school-admin" element={
        <ProtectedRoute requiredRoles={['school_admin']}>
          <Layout>
            <SchoolAdminDashboard />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/schools" element={
        <ProtectedRoute requiredRoles={['super_admin']}>
          <Layout>
            <SchoolManagement />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/academic" element={
        <ProtectedRoute requiredRoles={['super_admin', 'school_admin', 'teacher']}>
          <Layout>
            <Academic />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/students" element={
        <ProtectedRoute requiredRoles={['super_admin', 'school_admin', 'teacher']}>
          <Layout>
            <Students />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/staff" element={
        <ProtectedRoute requiredRoles={['super_admin', 'school_admin']}>
          <Layout>
            <StaffManagement />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/attendance" element={
        <ProtectedRoute requiredRoles={['super_admin', 'school_admin', 'teacher', 'parent']}>
          <Layout>
            <Attendance />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/timetable" element={
        <ProtectedRoute requiredRoles={['super_admin', 'school_admin', 'teacher']}>
          <Layout>
            <Timetable />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/profile" element={
        <ProtectedRoute>
          <Layout>
            <ProfileSettings />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
