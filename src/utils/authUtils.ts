
import { supabase } from "@/integrations/supabase/client";
import { Profile } from "@/contexts/types";

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
    // Use maybeSingle() to handle cases where profile might not exist
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
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
          throw userError;
        }
        
        if (userData && userData.user) {
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

          // Call the create_user_profile RPC function that was created in the database
          const { error: insertError } = await supabase.rpc('create_user_profile', {
            user_id: userId,
            user_email: defaultProfile.email,
            user_first_name: defaultProfile.first_name,
            user_last_name: defaultProfile.last_name,
            user_role: defaultProfile.role
          });

          if (insertError) {
            console.error("Error creating default profile:", insertError.message);
            // Try fallback approach for super admin account creation
            if (defaultProfile.email === "super@edufar.co") {
              const { error: adminError } = await supabase.auth.updateUser({
                data: { role: 'super_admin' }
              });
              
              if (!adminError) {
                // Force reload to apply changes
                window.location.reload();
              }
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
