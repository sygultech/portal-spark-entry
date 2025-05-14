
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import Layout from "@/components/layout/Layout";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Academic from "@/pages/Academic";
import SchoolAdmin from "@/pages/SchoolAdmin";
import SuperAdminDashboard from "@/pages/SuperAdminDashboard";
import { AcademicProvider } from "@/contexts/AcademicContext";

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route path="/" element={<Layout />}>
              <Route index element={<Navigate to="/dashboard" />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="super-admin-dashboard" element={<SuperAdminDashboard />} />
              <Route path="school-admin" element={<SchoolAdmin />} />
              <Route path="academic" element={<Academic />} />
              {/* Add other routes here */}
            </Route>
          </Routes>
          
          <Toaster />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
