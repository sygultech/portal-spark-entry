
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from './components/ui/toaster';

// Pages
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Index from './pages/Index';
import NotFound from './pages/NotFound';
import CreateSuperAdmin from './pages/CreateSuperAdmin';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import SchoolManagement from './pages/SchoolManagement';

// Components
import ProtectedRoute from './components/ProtectedRoute';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/create-super-admin" element={<CreateSuperAdmin />} />
          
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
          
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            } 
          />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
