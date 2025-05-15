import { supabase } from "@/integrations/supabase/client";
import { Profile, UserRole } from "@/contexts/types";

// Helper function to clean up auth state
export const cleanupAuthState = () => {
  // Remove standard auth tokens
  localStorage.removeItem('supabase.auth.token');
  // Remove all Supabase auth keys from localStorage
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
  // Remove from sessionStorage if in use
  Object.keys(sessionStorage || {}).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      sessionStorage.removeItem(key);
    }
  });
};

// Function to fetch user profile data
export const fetchUserProfile = async (userId: string) => {
  try {
    console.log("Fetching profile for user:", userId);
    
    // Use maybeSingle() to handle cases where profile might not exist
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching profile:", error);
      throw error;
    }

    if (data) {
      console.log("Profile loaded successfully:", data);
      return data as Profile;
    } else {
      // Handle case where profile doesn't exist
      console.log("No profile found for user. Creating default profile.");
      
      try {
        // Get the current user data
        const { data: userData, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error("Error getting user data:", userError);
          throw userError;
        }
        
        if (userData && userData.user) {
          console.log("User data retrieved:", userData.user);
          
          // Create a profile with required fields based on database schema
          const defaultProfile = {
            id: userId,
            email: userData.user.email || '',
            first_name: userData.user.user_metadata?.first_name || null,
            last_name: userData.user.user_metadata?.last_name || null,
            role: "student" as Profile["role"], // Default role
            avatar_url: null,
            school_id: null
          };

          // Special case for super admin
          if (defaultProfile.email === "super@edufar.co") {
            console.log("Setting up super admin profile");
            defaultProfile.role = "super_admin";
          }
          
          // Special case for school admin - check user metadata
          if (userData.user.user_metadata?.role === 'school_admin') {
            console.log("Setting up school admin profile from metadata:", userData.user.user_metadata);
            defaultProfile.role = "school_admin";
            defaultProfile.school_id = userData.user.user_metadata?.school_id || null;
          }
          
          // Call the create_user_profile RPC function that was created in the database
          const { error: insertError } = await supabase.rpc('create_user_profile', {
            user_id: userId,
            user_email: defaultProfile.email,
            user_first_name: defaultProfile.first_name,
            user_last_name: defaultProfile.last_name,
            user_role: defaultProfile.role
          });

          if (insertError) {
            console.error("Error creating default profile via RPC:", insertError.message);
            // Try fallback approach
            const { error: directInsertError } = await supabase
              .from('profiles')
              .insert({
                id: userId,
                email: defaultProfile.email,
                first_name: defaultProfile.first_name,
                last_name: defaultProfile.last_name,
                role: defaultProfile.role,
                school_id: defaultProfile.school_id
              });
              
            if (directInsertError) {
              console.error("Fallback profile creation failed:", directInsertError);
            } else {
              console.log("Created profile via fallback method");
              return defaultProfile;
            }
          } else {
            console.log("Created default profile:", defaultProfile);
            return defaultProfile;
          }
        }
        
        return null;
      } catch (profileError: any) {
        console.error("Error in profile creation:", profileError.message);
        return null;
      }
    }
  } catch (error: any) {
    console.error("Error fetching user profile:", error.message);
    return null;
  }
};

/**
 * Creates a profile for a new user
 * @param userId - The ID of the user to create a profile for
 * @param email - The email address of the user
 * @param firstName - The first name of the user
 * @param lastName - The last name of the user
 * @param role - The role of the user
 * @param schoolId - The school ID to associate with the user profile
 */
export const createUserProfile = async (
  userId: string, 
  email: string, 
  firstName: string, 
  lastName: string, 
  role: UserRole,
  schoolId?: string
) => {
  try {
    // Profile data object
    const profileData = {
      id: userId,
      email,
      first_name: firstName,
      last_name: lastName,
      role,
      school_id: schoolId || null
    };
    
    console.log("Creating profile with data:", profileData);
    
    // Try to create a new profile
    const { error: insertError } = await supabase
      .from('profiles')
      .insert(profileData);
    
    // If profile already exists, update it
    if (insertError) {
      console.log("Insert error, attempting update:", insertError.message);
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          first_name: firstName,
          last_name: lastName,
          role,
          school_id: schoolId || null
        })
        .eq('id', userId);
      
      if (updateError) {
        console.error('Error updating user profile:', updateError);
        throw updateError;
      }
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error creating user profile:', error);
    return { success: false, error };
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
      p_user_metadata: userMetadata ? JSON.stringify(userMetadata) : null,
      p_app_metadata: appMetadata ? JSON.stringify(appMetadata) : null
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
      
      // Create a new object instead of using spread
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
