
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Profile, UserRole } from "@/contexts/types";
import { toast } from "@/components/ui/use-toast";
import { cleanupAuthState, fetchUserProfile, createUserProfile } from "@/utils/authUtils";
import { getRoleBasedRoute } from "@/utils/roleUtils";

export const useAuthOperations = () => {
  const [isLoading, setIsLoading] = useState(true);
  
  // Use optional chaining to avoid errors when not in a Router context
  const navigate = useNavigate();

  // Handle sign in
  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log("Attempting to sign in with:", email);
      
      // Clean up existing state
      cleanupAuthState();
      
      // Attempt global sign out first
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
        console.log("Global sign out failed, continuing with sign in");
      }
      
      // Check if the email is confirmed before attempting to sign in
      const { data: emailConfirmed, error: emailCheckError } = await supabase.rpc(
        'is_email_confirmed',
        { email_address: email }
      );
      
      if (emailCheckError) {
        console.error("Error checking email confirmation:", emailCheckError);
      }
      
      // Attempt to sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      // Handle specific error cases
      if (error) {
        console.log("Login error detected:", error.message);
        
        // Special handling for "Email not confirmed" error
        if (error.message.includes("Email not confirmed")) {
          // Try to confirm the email if it's a school admin
          try {
            // Try to confirm the email if it's a school admin
            const { data: confirmData, error: confirmError } = await supabase.rpc(
              'manually_confirm_email',
              { email_address: email }
            );
            
            if (confirmError) {
              console.error("Error confirming email:", confirmError);
              toast({
                title: "Login failed",
                description: "Unable to confirm email. Please contact support.",
                variant: "destructive",
              });
              throw confirmError;
            }
            
            // If email was confirmed, retry login
            if (confirmData) {
              console.log("Email confirmed, retrying login");
              const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({
                email,
                password,
              });
              
              if (retryError) {
                console.error("Retry login failed:", retryError);
                toast({
                  title: "Login failed",
                  description: retryError.message || "Invalid login credentials",
                  variant: "destructive",
                });
                throw retryError;
              }
              
              if (retryData?.user) {
                // Process successful login after email confirmation
                await handleSuccessfulLogin(retryData.user.id);
                return;
              }
            }
          } catch (err: any) {
            console.error("Error during login recovery process:", err);
            toast({
              title: "Login failed",
              description: err.message || "An unexpected error occurred",
              variant: "destructive",
            });
          }
        } 
        // Handle "Invalid login credentials" error
        else if (error.message.includes("Invalid login credentials")) {
          toast({
            title: "Login failed",
            description: "The email or password you entered is incorrect.",
            variant: "destructive",
          });
        } 
        // Handle other errors
        else {
          toast({
            title: "Login failed",
            description: error.message,
            variant: "destructive",
          });
        }
        
        setIsLoading(false);
        return;
      }
      
      // Handle successful login
      if (data?.user) {
        await handleSuccessfulLogin(data.user.id);
      }
    } catch (error: any) {
      console.error("Login process error:", error);
      toast({
        title: "Login failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper function for handling successful login
  const handleSuccessfulLogin = async (userId: string) => {
    try {
      console.log("Login successful, fetching profile for:", userId);
      
      // Fetch or create user profile
      let userProfile = await fetchUserProfile(userId);
      
      // If profile doesn't exist, create it with safe defaults
      if (!userProfile) {
        console.log("No profile found, creating profile for:", userId);
        
        // Get user data
        const { data: userData } = await supabase.auth.getUser();
        
        if (userData?.user) {
          // Determine appropriate role based on metadata
          let role: UserRole = "student"; // Safe default
          let schoolId = null;
          
          // Only use metadata role if it exists and is valid
          if (userData.user.user_metadata?.role) {
            // Special case for super admin and school admin
            if (userData.user.user_metadata.role === "super_admin" || 
                userData.user.user_metadata.role === "school_admin") {
              role = userData.user.user_metadata.role as UserRole;
              
              // For school_admin, also get school_id
              if (role === "school_admin" && userData.user.user_metadata.school_id) {
                schoolId = userData.user.user_metadata.school_id;
              }
            }
          }
          
          // Handle the special case for super@edufar.co
          if (userData.user.email === "super@edufar.co") {
            role = "super_admin";
          }
          
          // Try to create the profile using the new database function
          const { error: profileError } = await supabase.rpc(
            'create_profile_for_existing_user',
            { 
              user_id: userId, 
              user_email: userData.user.email || '', 
              user_role: role 
            }
          );
          
          if (profileError) {
            console.error("Error creating profile via RPC:", profileError);
            // Fall back to regular createUserProfile function
            await createUserProfile(
              userId,
              userData.user.email || '',
              userData.user.user_metadata?.first_name || userData.user.email?.split('@')[0] || '',
              userData.user.user_metadata?.last_name || '',
              role,
              schoolId
            );
          }
          
          // Fetch the newly created profile
          userProfile = await fetchUserProfile(userId);
        }
      }
      
      // Redirect based on role
      const roleBasedRoute = getRoleBasedRoute(userProfile?.role);
      
      console.log("Redirecting to:", roleBasedRoute);
      if (navigate) {
        navigate(roleBasedRoute);
      } else {
        window.location.href = roleBasedRoute;
      }
      
      toast({
        title: "Login successful!",
        description: "Welcome back!",
      });
    } catch (error: any) {
      console.error("Error in handleSuccessfulLogin:", error);
      throw error; // Let the calling function handle this
    }
  };

  // Handle sign up
  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    setIsLoading(true);
    try {
      // Clean up existing state
      cleanupAuthState();
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            // Default role is student - more secure
            role: "student" 
          },
        },
      });

      if (error) throw error;

      toast({
        title: "Sign up successful!",
        description: "Please check your email for a confirmation link.",
      });

      // Don't navigate or set session here as the user needs to verify their email
    } catch (error: any) {
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle sign out
  const signOut = async () => {
    setIsLoading(true);
    try {
      // Clean up auth state
      cleanupAuthState();
      
      await supabase.auth.signOut({ scope: 'global' });
      
      // Redirect to login page
      if (navigate) {
        navigate("/login");
      } else {
        window.location.href = "/login";
      }
      
      toast({
        title: "Logged out successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    setIsLoading,
    signIn,
    signUp,
    signOut
  };
};
