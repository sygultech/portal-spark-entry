import React, { useEffect } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getRoleBasedRoute, canAccessRoute, getPrimaryRole } from "@/utils/roleUtils";

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
  const navigate = useNavigate();

  // Effect to handle role-based redirection
  useEffect(() => {
    if (!isLoading && user && profile) {
      // If we're at the root path and the user should be redirected to a role-specific page
      if (location.pathname === "/" && profile.roles) {
        const roleRoute = getRoleBasedRoute(profile.roles);
        // Only redirect if not already on the role's route
        if (roleRoute !== "/" && location.pathname !== roleRoute) {
          const primaryRole = getPrimaryRole(profile);
          console.log(`Redirecting user with role ${primaryRole} to ${roleRoute}`);
          navigate(roleRoute, { replace: true });
        }
      }
    }
  }, [user, profile, isLoading, location.pathname, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If specific roles are required and user doesn't have one of them
  if (requiredRoles.length > 0 && profile && !canAccessRoute(profile.roles, requiredRoles)) {
    const primaryRole = getPrimaryRole(profile);
    console.log(`User with role ${primaryRole} attempted to access a route for ${requiredRoles.join(', ')}`);
    // Show NotFound component directly instead of redirecting
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
