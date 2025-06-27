
import { UserRole } from "@/types/common";
import { UserProfile } from "@/contexts/types";

export const hasRole = (profile: UserProfile | null, role: UserRole): boolean => {
  if (!profile?.roles) return false;
  return profile.roles.includes(role);
};

export const canAccessRoute = (userRoles: UserRole[] | string[] | undefined, requiredRoles: string[] | UserRole[]): boolean => {
  if (!userRoles || userRoles.length === 0) return false;
  
  // Convert userRoles to UserRole[] if it's string[]
  const roles = userRoles as UserRole[];
  const required = requiredRoles as UserRole[];
  
  return required.some(role => roles.includes(role));
};

export const getPrimaryRole = (profile: UserProfile | null): UserRole | null => {
  if (!profile?.roles || profile.roles.length === 0) return null;
  return profile.roles[0];
};

export const getRoleBasedRoute = (roles: UserRole[] | string[] | undefined): string => {
  if (!roles || roles.length === 0) return "/";
  
  const role = Array.isArray(roles) ? roles[0] as UserRole : roles as UserRole;
  
  switch (role) {
    case "super_admin":
      return "/super-admin-dashboard";
    case "school_admin":
      return "/school-admin";
    case "teacher":
      return "/teacher-dashboard";
    case "student":
      return "/student-dashboard";
    case "parent":
      return "/parent-dashboard";
    default:
      return "/";
  }
};

export const getRoleNavigation = (profile: UserProfile | null) => {
  if (!profile?.roles) return [];
  
  const role = profile.roles[0];
  
  switch (role) {
    case "super_admin":
      return [
        { href: "/super-admin-dashboard", label: "Dashboard" },
        { href: "/school-management", label: "Schools" },
      ];
    case "school_admin":
      return [
        { href: "/school-admin", label: "Dashboard" },
        { href: "/students", label: "Students" },
        { href: "/academic", label: "Academic" },
        { href: "/staff", label: "Staff" },
        { href: "/fees", label: "Fees" },
        { href: "/library", label: "Library" },
      ];
    default:
      return [];
  }
};

export const formatRole = (roles: UserRole[] | string[] | undefined): string => {
  if (!roles || roles.length === 0) return "";
  
  const role = Array.isArray(roles) ? roles[0] : roles;
  
  switch (role) {
    case "super_admin":
      return "Super Admin";
    case "school_admin":
      return "School Admin";
    case "teacher":
      return "Teacher";
    case "student":
      return "Student";
    case "parent":
      return "Parent";
    default:
      return String(role);
  }
};
