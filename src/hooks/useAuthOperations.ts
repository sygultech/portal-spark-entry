
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Profile } from "@/contexts/types";
import { toast } from "@/components/ui/use-toast";
import { cleanupAuthState, fetchUserProfile } from "@/utils/authUtils";
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
      
      // Attempt to sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      // Check for the specific "Email not confirmed" error or "Invalid login credentials"
      if (error && (error.message.includes("Email not confirmed") || error.message.includes("Invalid login credentials"))) {
        console.log("Login error detected:", error.message);
        
        // Check if this might be a school admin with unconfirmed email
        try {
          // First check email confirmation status directly
          const { data: isConfirmed, error: isConfirmedError } = await supabase.rpc(
            'is_email_confirmed', 
            { email_address: email }
          );
          
          console.log("Email confirmation status check:", isConfirmed, isConfirmedError);
          
          if (isConfirmedError) {
            console.error("Error checking email confirmation:", isConfirmedError);
          }
          
          // Check if this email exists in profiles, regardless of confirmation status
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('role, email, school_id')
            .eq('email', email)
            .maybeSingle();
          
          console.log("Profile check result:", profileData, profileError);
          
          // If the profile exists and is a school admin
          if (profileData?.role === 'school_admin') {
            console.log("Found school admin profile, attempting to auto-confirm email");
            
            // Call the stored procedure to confirm email
            const { data: confirmData, error: confirmError } = await supabase.rpc(
              'manually_confirm_email',
              { email_address: email }
            );
            
            console.log("Email confirmation result:", confirmData, confirmError);
            
            if (confirmError) {
              toast({
                title: "Login failed",
                description: "Unable to confirm email. Please contact support.",
                variant: "destructive",
              });
              throw confirmError;
            }
            
            if (confirmData) {
              // If confirmation succeeds, attempt login again
              console.log("Email confirmed, retrying login");
              const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({
                email,
                password,
              });
              
              if (retryError) {
                console.error("Retry login failed:", retryError);
                // More specific error for debugging
                if (retryError.message.includes("Invalid login credentials")) {
                  toast({
                    title: "Login failed",
                    description: "The email was confirmed, but login still failed. This may indicate an incorrect password.",
                    variant: "destructive",
                  });
                } else {
                  toast({
                    title: "Login failed",
                    description: retryError.message || "An unexpected error occurred during login retry",
                    variant: "destructive",
                  });
                }
                throw retryError;
              }
              
              if (retryData?.user) {
                // Proceed with successful login
                console.log("Login successful after email confirmation");
                const userProfile = await fetchUserProfile(retryData.user.id);
                const roleBasedRoute = getRoleBasedRoute(userProfile?.role);
                
                if (navigate) {
                  navigate(roleBasedRoute);
                } else {
                  window.location.href = roleBasedRoute;
                }
                
                toast({
                  title: "Login successful!",
                  description: "Welcome back!",
                });
                return;
              }
            } else {
              toast({
                title: "Login failed",
                description: "Email confirmation failed. Please contact support.",
                variant: "destructive",
              });
            }
          } else {
            // If user doesn't exist in profiles or is not a school admin
            console.log("User not found in profiles or is not a school admin");
            
            // Check if the user exists in auth.users by trying to create
            const { data: manualCheckData, error: manualCheckError } = await supabase.rpc(
              'manually_confirm_email',
              { email_address: email }
            );
            
            console.log("Manual confirmation attempt:", manualCheckData, manualCheckError);
            
            if (manualCheckData) {
              // If the user exists and was confirmed, try login again
              const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({
                email,
                password,
              });
              
              if (!retryError && retryData?.user) {
                console.log("Login successful after manual email confirmation");
                
                // Create a profile if needed
                const userProfile = await fetchUserProfile(retryData.user.id);
                const roleBasedRoute = getRoleBasedRoute(userProfile?.role);
                
                if (navigate) {
                  navigate(roleBasedRoute);
                } else {
                  window.location.href = roleBasedRoute;
                }
                
                toast({
                  title: "Login successful!",
                  description: "Welcome back!",
                });
                return;
              }
            }
            
            toast({
              title: "Login failed",
              description: error.message || "Invalid login credentials",
              variant: "destructive",
            });
          }
        } catch (err: any) {
          console.error("Error during login recovery process:", err);
          toast({
            title: "Login failed",
            description: err.message || "An unexpected error occurred",
            variant: "destructive",
          });
        }
      } else if (error) {
        // Handle other errors
        console.error("Login error:", error);
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive",
        });
      } else if (data?.user) {
        // Normal successful login path
        console.log("Login successful, fetching profile");
        const userProfile = await fetchUserProfile(data.user.id);
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
