import { supabase } from "@/integrations/supabase/client";
import { Profile, UserRole } from "@/types/common";
import { refreshUserRoles } from "./roleUtils";

// Function to refresh user role cache
export const refreshUserRoleCache = async (userId: string) => {
  try {
    // Call the database function to refresh the cache
    const { data, error } = await supabase.rpc('refresh_user_role_cache', { 
      p_user_id: userId 
    });
    
    if (error) {
      console.error('Error refreshing role cache:', error);
      return false;
    }
    return data || false;
  } catch (error) {
    console.error('Error in refreshUserRoleCache:', error);
    return false;
  }
};

// Function to clean up auth state
export const cleanupAuthState = () => {
  localStorage.removeItem('supabase.auth.token');
  sessionStorage.removeItem('supabase.auth.token');
};

// Function to fetch user profile
export const fetchUserProfile = async (userId: string): Promise<Profile | null> => {
  try {
    // Fetch the profile data
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    if (!profile) {
      return null;
    }

    return {
      id: profile.id,
      first_name: profile.first_name,
      last_name: profile.last_name,
      email: profile.email,
      avatar_url: profile.avatar_url,
      school_id: profile.school_id,
      roles: profile.roles,
      created_at: profile.created_at,
      updated_at: profile.updated_at
    };
  } catch (error) {
    console.error('Error in fetchUserProfile:', error);
    return null;
  }
};

// Function to create user profile
export const createUserProfile = async (
  userId: string,
  email: string,
  firstName: string,
  lastName: string,
  role: UserRole,
  schoolId?: string | null
): Promise<void> => {
  try {
    const { error } = await supabase.rpc('create_profile_for_existing_user', {
      user_id: userId,
      user_email: email,
      user_role: role,
      school_id: schoolId
    });

    if (error) throw error;
    
    // Refresh the role cache after creating the profile
    await refreshUserRoles(userId);
  } catch (error) {
    console.error('Error creating profile:', error);
    throw error;
  }
};

// Define a comprehensive interface for auth user details
export interface AuthUserDetails {
  id: string;
  aud?: string;
  role?: string;
  email: string;
  phone: string | null;
  created_at: string;
  updated_at?: string;
  last_sign_in_at: string | null;
  invited_at?: string | null;
  confirmation_sent_at?: string | null;
  confirmation_token?: string | null;
  recovery_sent_at?: string | null;
  email_change_sent_at?: string | null;
  email_change?: string | null;
  phone_change?: string | null;
  phone_change_sent_at?: string | null;
  user_metadata: Record<string, any>;
  app_metadata: Record<string, any>;
  email_confirmed: boolean;
  phone_confirmed: boolean;
  is_banned: boolean;
  banned_until: string | null;
  is_super_admin?: boolean;
  is_sso_user?: boolean;
  is_anonymous?: boolean;
  confirmed_at?: string | null;
  deleted_at?: string | null;
  instance_id?: string | null;
}

// Helper function to safely type check and convert Supabase RPC response
export function isValidAuthUserResponse(data: any): data is AuthUserDetails {
  return (
    data &&
    typeof data === 'object' &&
    !Array.isArray(data) &&
    'id' in data &&
    'email' in data &&
    'email_confirmed' in data &&
    'phone_confirmed' in data &&
    'is_banned' in data
  );
}

/**
 * Updates authentication details for a user
 * This function wraps the update_auth_user database function
 */
export const updateAuthUserDetails = async (
  userId: string,
  data: {
    email?: string;
    phone?: string | null;
    emailConfirmed?: boolean;
    phoneConfirmed?: boolean;
    isBanned?: boolean;
    confirmationToken?: string | null;
    confirmationSentAt?: string | null;
    instanceId?: string | null;
    userMetadata?: Record<string, any>;
    appMetadata?: Record<string, any>;
  }
) => {
  try {
    console.log("Updating auth user details for user:", userId);
    console.log("With data:", data);

    // Make sure metadata is properly handled as an object, not a string
    const userMetadata = data.userMetadata;
    const appMetadata = data.appMetadata;

    // Call the RPC function with the correct parameters
    const { data: response, error } = await supabase.rpc("update_auth_user", {
      p_user_id: userId,
      p_email: data.email,
      p_phone: data.phone,
      p_email_confirmed: data.emailConfirmed,
      p_phone_confirmed: data.phoneConfirmed,
      p_banned: data.isBanned,
      p_confirmation_token: data.confirmationToken,
      p_confirmation_sent_at: data.confirmationSentAt,
      p_instance_id: data.instanceId,
      p_user_metadata: userMetadata,
      p_app_metadata: appMetadata
    });

    if (error) {
      console.error("Error updating auth user:", error);
      throw error;
    }

    console.log("Auth update response:", response);
    return { success: true, data: response };
  } catch (error: any) {
    console.error("Auth update error:", error.message || error);
    return { success: false, error };
  }
};

/**
 * Fetches extended authentication details for a user
 * This function wraps the get_auth_user_details database function
 */
export const fetchAuthUserDetails = async (userId: string) => {
  try {
    console.log("Fetching auth user details for user:", userId);
    
    const { data: rawData, error } = await supabase.rpc(
      'get_auth_user_details',
      { p_user_id: userId }
    );
    
    if (error) {
      console.error("Error fetching auth user details:", error);
      throw error;
    }
    
    // Use the type guard to validate the response
    if (rawData && isValidAuthUserResponse(rawData)) {
      console.log("Auth user details response:", rawData);
      
      // Process the user_metadata to ensure it's an object
      let processedUserMetadata = rawData.user_metadata;
      if (typeof processedUserMetadata === 'string') {
        try {
          processedUserMetadata = JSON.parse(processedUserMetadata);
        } catch (e) {
          console.warn("Failed to parse user_metadata string:", e);
          processedUserMetadata = {};
        }
      }
      
      let processedAppMetadata = rawData.app_metadata;
      if (typeof processedAppMetadata === 'string') {
        try {
          processedAppMetadata = JSON.parse(processedAppMetadata);
        } catch (e) {
          console.warn("Failed to parse app_metadata string:", e);
          processedAppMetadata = {};
        }
      }
      
      // Create a new object with all properties properly typed
      const data: AuthUserDetails = {
        id: rawData.id,
        aud: rawData.aud,
        role: rawData.role,
        email: rawData.email,
        phone: rawData.phone,
        created_at: rawData.created_at,
        updated_at: rawData.updated_at,
        last_sign_in_at: rawData.last_sign_in_at,
        invited_at: rawData.invited_at,
        confirmation_sent_at: rawData.confirmation_sent_at,
        confirmation_token: rawData.confirmation_token,
        recovery_sent_at: rawData.recovery_sent_at,
        email_change_sent_at: rawData.email_change_sent_at,
        email_change: rawData.email_change,
        phone_change: rawData.phone_change,
        phone_change_sent_at: rawData.phone_change_sent_at,
        user_metadata: processedUserMetadata,
        app_metadata: processedAppMetadata,
        email_confirmed: rawData.email_confirmed,
        phone_confirmed: rawData.phone_confirmed,
        is_banned: rawData.is_banned,
        banned_until: rawData.banned_until,
        is_super_admin: rawData.is_super_admin,
        is_sso_user: rawData.is_sso_user,
        is_anonymous: rawData.is_anonymous,
        confirmed_at: rawData.confirmed_at,
        deleted_at: rawData.deleted_at,
        instance_id: rawData.instance_id
      };
      
      return { success: true, data };
    } else {
      console.error("Invalid data format returned:", rawData);
      throw new Error("Invalid data format returned from database");
    }
  } catch (error: any) {
    console.error("Error fetching auth user details:", error.message || error);
    return { success: false, error };
  }
};

export const switchUserSchool = async (schoolId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .rpc('switch_primary_school', { p_school_id: schoolId });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error switching school:', error);
    return false;
  }
};

export const getUserRolesInSchool = async (userId: string, schoolId: string): Promise<UserRole[]> => {
  try {
    const { data: roles, error } = await supabase
      .from('user_role_cache')
      .select('user_role')
      .eq('user_id', userId)
      .eq('school_id', schoolId);

    if (error) throw error;
    return roles.map(r => r.user_role);
  } catch (error) {
    console.error('Error getting user roles:', error);
    return [];
  }
};

export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
};

export const getCurrentProfile = async (): Promise<Profile | null> => {
  try {
    const user = await getCurrentUser();
    if (!user) return null;

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) throw error;

    // Refresh user roles in cache
    await refreshUserRoles(user.id);

    return profile;
  } catch (error) {
    console.error("Error getting current profile:", error);
    return null;
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const user = await getCurrentUser();
    return !!user;
  } catch (error) {
    console.error("Error checking authentication:", error);
    return false;
  }
};

export const hasRequiredRole = async (requiredRoles: UserRole[]): Promise<boolean> => {
  try {
    const profile = await getCurrentProfile();
    if (!profile?.roles) return false;

    return requiredRoles.some(role => profile.roles.includes(role));
  } catch (error) {
    console.error("Error checking required role:", error);
    return false;
  }
};

export const isSuperAdmin = async (): Promise<boolean> => {
  return hasRequiredRole(["super_admin"]);
};

export const isSchoolAdmin = async (): Promise<boolean> => {
  return hasRequiredRole(["school_admin"]);
};

export const isTeacher = async (): Promise<boolean> => {
  return hasRequiredRole(["teacher"]);
};

export const isStudent = async (): Promise<boolean> => {
  return hasRequiredRole(["student"]);
};

export const isParent = async (): Promise<boolean> => {
  return hasRequiredRole(["parent"]);
};

export const isStaff = async (): Promise<boolean> => {
  return hasRequiredRole(["staff"]);
};

export const isLibrarian = async (): Promise<boolean> => {
  return hasRequiredRole(["librarian"]);
};
