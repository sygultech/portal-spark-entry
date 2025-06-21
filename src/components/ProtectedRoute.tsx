
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { canAccessRoute } from "@/utils/roleUtils";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRoles = [] 
}) => {
  const { user, profile, isLoading } = useAuth();
  const location = useLocation();

  console.log("ProtectedRoute:", { 
    user: !!user, 
    profile: !!profile, 
    isLoading, 
    path: location.pathname,
    hasRequiredRoles: requiredRoles.length > 0,
    userRoles: profile?.roles
  });

  // Show loading only for a reasonable time
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If no user, redirect to login
  if (!user) {
    console.log("No user, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  // If specific roles are required and user doesn't have access
  if (requiredRoles.length > 0 && profile && !canAccessRoute(profile.roles, requiredRoles)) {
    console.log(`User doesn't have required roles: ${requiredRoles.join(', ')}`);
    return <Navigate to="/dashboard" replace />;
  }

  // Render the protected content
  return <>{children}</>;
};

export default ProtectedRoute;
