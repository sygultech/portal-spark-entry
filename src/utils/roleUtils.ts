
import { UserRole } from "@/types/common";
import { UserProfile } from "@/contexts/types";
import { supabase } from "@/integrations/supabase/client";

export const hasRole = (profile: UserProfile | null, role: UserRole): boolean => {
  if (!profile?.roles) return false;
  
  // Handle both single role array and UserSchoolRole array formats
  if (Array.isArray(profile.roles)) {
    // If it's a simple array of roles
    if (typeof profile.roles[0] === 'string') {
      return (profile.roles as UserRole[]).includes(role);
    }
    // If it's an array of UserSchoolRole objects
    return profile.roles.some((r: any) => 
      r.roles && Array.isArray(r.roles) && r.roles.includes(role)
    );
  }
  
  return false;
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
  
  // Handle both single role array and UserSchoolRole array formats
  if (Array.isArray(profile.roles)) {
    // If it's a simple array of roles
    if (typeof profile.roles[0] === 'string') {
      return profile.roles[0] as UserRole;
    }
    // If it's an array of UserSchoolRole objects
    const firstSchoolRole = profile.roles[0] as any;
    return firstSchoolRole?.roles?.[0] || null;
  }
  
  return null;
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
  
  const role = getPrimaryRole(profile);
  
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

// Function to refresh user roles in the cache
export const refreshUserRoles = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('refresh_user_role_cache', { 
      p_user_id: userId 
    });
    
    if (error) {
      console.error('Error refreshing user roles:', error);
      return false;
    }
    
    return data || false;
  } catch (error) {
    console.error('Error in refreshUserRoles:', error);
    return false;
  }
};
