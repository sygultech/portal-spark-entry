
import { useAuth } from "@/contexts/AuthContext";
import { getRoleNavigation } from "@/utils/roleUtils";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";

export const RoleNavigation = () => {
  const { profile } = useAuth();
  const location = useLocation();
  
  const navItems = getRoleNavigation(profile);
  
  return (
    <nav className="flex gap-2">
      {navItems.map((item) => (
        <Button
          key={item.href}
          variant={location.pathname === item.href ? "default" : "outline"}
          size="sm"
          asChild
        >
          <Link to={item.href}>{item.name}</Link>
        </Button>
      ))}
    </nav>
  );
};

export default RoleNavigation;

// force update

// force update
