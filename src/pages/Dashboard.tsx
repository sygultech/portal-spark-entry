
import { useNavigate, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getRoleBasedRoute } from "@/utils/roleUtils";

const Dashboard = () => {
  const { profile, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && profile?.role) {
      const roleSpecificRoute = getRoleBasedRoute(profile.role);
      if (roleSpecificRoute !== "/dashboard") {
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

  // If we have a role and the role's route isn't dashboard, we should redirect
  if (profile?.role && getRoleBasedRoute(profile.role) !== "/dashboard") {
    return <Navigate to={getRoleBasedRoute(profile.role)} replace />;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <p>Welcome to the dashboard. Please use the sidebar navigation to access the modules.</p>
    </div>
  );
};

export default Dashboard;

// force update

// force update
