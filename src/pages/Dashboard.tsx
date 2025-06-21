
import { useNavigate, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getRoleBasedRoute } from "@/utils/roleUtils";

const Dashboard = () => {
  const { profile, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Only redirect if we have a profile and it's not loading
    if (!isLoading && profile?.roles) {
      const roleSpecificRoute = getRoleBasedRoute(profile.roles);
      console.log("Dashboard: checking redirect", { roleSpecificRoute, roles: profile.roles });
      
      // Only redirect if the role-specific route is different from dashboard
      if (roleSpecificRoute && roleSpecificRoute !== "/dashboard") {
        console.log("Dashboard: redirecting to", roleSpecificRoute);
        navigate(roleSpecificRoute, { replace: true });
      }
    }
  }, [profile, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If we have a profile with roles and should redirect, show loading while redirect happens
  if (profile?.roles) {
    const roleSpecificRoute = getRoleBasedRoute(profile.roles);
    if (roleSpecificRoute && roleSpecificRoute !== "/dashboard") {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      );
    }
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Welcome</h2>
          <p className="text-gray-600">
            Welcome to your dashboard. Use the sidebar navigation to access different modules.
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <p className="text-gray-600">
            Access your most frequently used features here.
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <p className="text-gray-600">
            Your recent activities will appear here.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
