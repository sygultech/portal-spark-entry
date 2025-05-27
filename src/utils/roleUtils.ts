import { Profile, UserRole } from "@/types/common";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/lib/database.types";

type UserRoleCache = Database['public']['Tables']['user_role_cache']['Row'];

// Default routes for each role
export const getRoleBasedRoute = (role?: UserRole | UserRole[]): string => {
  // Handle both array and single role
  const primaryRole = Array.isArray(role) ? role[0] : role;
  
  switch (primaryRole) {
    case "super_admin":
      return "/admin";
    case "school_admin":
      return "/school";
    case "teacher":
      return "/teacher";
    case "student":
      return "/student";
    case "parent":
      return "/parent";
    case "staff":
      return "/staff";
    case "librarian":
      return "/library";
    default:
      return "/";
  }
};

// Check if a user has access to a specific route based on their role
export const canAccessRoute = (userRole: UserRole | UserRole[] | undefined, requiredRoles: string[]): boolean => {
  if (!userRole) return false;
  
  // Handle both array and single role
  const roles = Array.isArray(userRole) ? userRole : [userRole];
  return roles.some(role => requiredRoles.includes(role));
};

// Get role-specific navigation items
export const getRoleNavigation = (profile: Profile | null) => {
  if (!profile) return [];

  // Get the primary role (first role in the array)
  const primaryRole = profile?.roles?.[0];

  // Role-specific items
  switch (primaryRole) {
    case "super_admin":
      return [
        { label: "Dashboard", href: "/admin" },
        { label: "Schools", href: "/admin/schools" },
        { label: "Users", href: "/admin/users" },
        { label: "Settings", href: "/admin/settings" },
      ];
    case "school_admin":
      return [
        { label: "Dashboard", href: "/school" },
        { label: "Students", href: "/school/students" },
        { label: "Teachers", href: "/school/teachers" },
        { label: "Classes", href: "/school/classes" },
        { label: "Settings", href: "/school/settings" },
      ];
    case "teacher":
      return [
        { label: "Dashboard", href: "/teacher" },
        { label: "Classes", href: "/teacher/classes" },
        { label: "Students", href: "/teacher/students" },
        { label: "Assignments", href: "/teacher/assignments" },
      ];
    case "student":
      return [
        { label: "Dashboard", href: "/student" },
        { label: "Classes", href: "/student/classes" },
        { label: "Assignments", href: "/student/assignments" },
        { label: "Grades", href: "/student/grades" },
      ];
    case "parent":
      return [
        { label: "Dashboard", href: "/parent" },
        { label: "Children", href: "/parent/children" },
        { label: "Grades", href: "/parent/grades" },
        { label: "Messages", href: "/parent/messages" },
      ];
    case "staff":
      return [
        { label: "Dashboard", href: "/staff" },
        { label: "Tasks", href: "/staff/tasks" },
        { label: "Schedule", href: "/staff/schedule" },
      ];
    case "librarian":
      return [
        { label: "Dashboard", href: "/library" },
        { label: "Books", href: "/library/books" },
        { label: "Members", href: "/library/members" },
        { label: "Loans", href: "/library/loans" },
      ];
    default:
      return [];
  }
};

// Helper function to check if user has a specific role
export const hasRole = (profile: Profile | null, role: UserRole): boolean => {
  if (!profile?.roles) return false;
  return profile.roles.includes(role);
};

// Helper function to get primary role as string
export const getPrimaryRole = (profile: Profile | null): UserRole | undefined => {
  return profile?.roles?.[0];
};

// Helper function to format role for display
export const formatRole = (role: UserRole | UserRole[]): string => {
  const roleToFormat = Array.isArray(role) ? role[0] : role;
  return roleToFormat?.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ') || '';
};

// Function to refresh user roles in cache
export const refreshUserRoles = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('refresh_user_role_cache', {
      p_user_id: userId
    });

    if (error) {
      console.error('Error refreshing user roles:', error);
      return false;
    }

    return true;
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
      .order('created_at', { ascending: false })
      .limit(1)
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
