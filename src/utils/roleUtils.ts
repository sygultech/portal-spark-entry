
import { Profile } from "@/contexts/types";

// Default routes for each role
export const getRoleBasedRoute = (role?: string): string => {
  switch (role) {
    case "super_admin":
      return "/super-admin-dashboard";
    case "school_admin":
      return "/school-admin";
    case "teacher":
      return "/teacher";
    case "student":
      return "/student";
    case "parent":
      return "/parent";
    default:
      return "/";
  }
};

// Check if a user has access to a specific route based on their role
export const canAccessRoute = (userRole: string | undefined, requiredRoles: string[]): boolean => {
  if (!userRole) return false;
  return requiredRoles.includes(userRole);
};

// Get role-specific navigation items
export const getRoleNavigation = (profile: Profile | null) => {
  // Base navigation items all authenticated users can see
  const baseNavItems = [
    { name: "Home", href: "/" },
    { name: "Profile", href: "/profile" },
  ];

  // Role-specific items
  switch (profile?.role) {
    case "super_admin":
      return [
        ...baseNavItems,
        { name: "Dashboard", href: "/super-admin-dashboard" },
        { name: "Schools", href: "/schools" },
        { name: "Users", href: "/users" },
        { name: "Settings", href: "/settings" },
      ];
    case "school_admin":
      return [
        ...baseNavItems,
        { name: "Dashboard", href: "/school-admin" },
        { name: "Teachers", href: "/teachers" },
        { name: "Students", href: "/students" },
      ];
    case "teacher":
      return [
        ...baseNavItems,
        { name: "Dashboard", href: "/teacher" },
        { name: "Classes", href: "/classes" },
        { name: "Students", href: "/my-students" },
      ];
    case "student":
      return [
        ...baseNavItems,
        { name: "Dashboard", href: "/student" },
        { name: "Classes", href: "/my-classes" },
        { name: "Assignments", href: "/assignments" },
      ];
    case "parent":
      return [
        ...baseNavItems,
        { name: "Dashboard", href: "/parent" },
        { name: "Children", href: "/children" },
      ];
    default:
      return baseNavItems;
  }
};
