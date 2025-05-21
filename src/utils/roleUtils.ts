import { Profile, UserRole } from "@/contexts/types";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/lib/database.types";

type UserRoleCache = Database['public']['Tables']['user_role_cache']['Row'];

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
      return "/dashboard";
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
        { name: "Academic", href: "/academic" },
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

// Function to refresh user roles in cache
export const refreshUserRoles = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('refresh_user_roles', {
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

// Function to get user's roles from cache
export const getUserRolesFromCache = async (userId: string): Promise<UserRoleCache[] | null> => {
  try {
    const { data, error } = await supabase
      .from('user_role_cache')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching user roles from cache:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getUserRolesFromCache:', error);
    return null;
  }
};

// Function to get user's primary role from cache
export const getUserPrimaryRole = async (userId: string): Promise<UserRole | null> => {
  try {
    const { data, error } = await supabase
      .from('user_role_cache')
      .select('role')
      .eq('user_id', userId)
      .eq('is_primary', true)
      .single();

    if (error) {
      console.error('Error fetching primary role:', error);
      return null;
    }

    return data?.role || null;
  } catch (error) {
    console.error('Error in getUserPrimaryRole:', error);
    return null;
  }
};

// force update
