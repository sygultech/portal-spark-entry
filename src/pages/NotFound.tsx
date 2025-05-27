import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";
import { getRoleBasedRoute } from "@/utils/roleUtils";

const NotFound = () => {
  const location = useLocation();
  const { profile, isLoading } = useAuth();
  const from = location.state?.from || location.pathname;

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      from
    );
  }, [from]);

  // Determine where to redirect the user based on their role
  const homeRoute = !isLoading && profile ? getRoleBasedRoute(profile.roles) : "/";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-2">Page Not Found</h2>
        <p className="text-gray-600 mb-6">
          {from === "/404" 
            ? "You don't have permission to access this page."
            : "Sorry, the page you are looking for doesn't exist or has been moved."}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild>
            <Link to={homeRoute} className="flex items-center">
              <Home className="mr-2 h-4 w-4" /> Go to Dashboard
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to={from === "/404" ? homeRoute : "/"} className="flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
