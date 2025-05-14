
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Profile } from "@/contexts/types";
import { toast } from "@/components/ui/use-toast";
import { cleanupAuthState, fetchUserProfile } from "@/utils/authUtils";
import { getRoleBasedRoute } from "@/utils/roleUtils";

export const useAuthOperations = () => {
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Handle sign in
  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Clean up existing state
      cleanupAuthState();
      
      // Attempt global sign out first
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
      }
      
      // Attempt to sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      // Check for the specific "Email not confirmed" error
      if (error && error.message.includes("Email not confirmed")) {
        console.log("Email not confirmed, attempting to confirm for school admin");
        
        // For security reasons, attempt to auto-confirm specific school admin emails
        // Use a direct database call instead of the admin API which has type issues
        const { data: confirmData, error: confirmError } = await supabase
          .from('profiles')
          .select('role')
          .eq('email', email)
          .single()
          .then(async (profileResult) => {
            // If this is a school admin, try to confirm their email
            if (profileResult.data?.role === 'school_admin') {
              // Call the stored procedure to confirm email
              return await supabase.rpc(
                'auto_confirm_email',
                { target_email: email }
              );
            }
            return { data: false, error: null };
          })
          .catch(() => ({ data: false, error: null }));
        
        if (confirmError || !confirmData) {
          // If confirmation fails, show the standard error
          toast({
            title: "Login failed",
            description: "Email not confirmed. Please check your inbox for a confirmation link.",
            variant: "destructive",
          });
          throw error; // Rethrow the original error
        } else {
          // If confirmation succeeds, attempt login again
          const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          
          if (retryError) throw retryError;
          
          if (retryData.user) {
            // Proceed with successful login
            const userProfile = await fetchUserProfile(retryData.user.id);
            const roleBasedRoute = getRoleBasedRoute(userProfile?.role);
            navigate(roleBasedRoute);
            
            toast({
              title: "Login successful!",
              description: "Welcome back!",
            });
          }
        }
      } else if (error) {
        // Handle other errors
        throw error;
      } else if (data.user) {
        // Normal successful login path
        const userProfile = await fetchUserProfile(data.user.id);
        const roleBasedRoute = getRoleBasedRoute(userProfile?.role);
        navigate(roleBasedRoute);
        
        toast({
          title: "Login successful!",
          description: "Welcome back!",
        });
      }
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message,
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
      navigate("/login");
      
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
