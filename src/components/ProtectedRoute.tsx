import React, { useEffect } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getRoleBasedRoute, canAccessRoute } from "@/utils/roleUtils";

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
      if (location.pathname === "/" && profile.role) {
        const roleRoute = getRoleBasedRoute(profile.role);
        // Only redirect if not already on the role's route
        if (roleRoute !== "/" && location.pathname !== roleRoute) {
          console.log(`Redirecting user with role ${profile.role} to ${roleRoute}`);
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
  if (requiredRoles.length > 0 && profile && !requiredRoles.includes(profile.role)) {
    console.log(`User with role ${profile.role} attempted to access a route for ${requiredRoles.join(', ')}`);
    // Show NotFound component directly instead of redirecting
    return <Navigate to="/404" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

// force update

// force update
