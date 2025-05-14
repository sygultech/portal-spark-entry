
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
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Fetch user profile after successful sign in
        const userProfile = await fetchUserProfile(data.user.id);
        
        // Determine the appropriate route based on user role
        const roleBasedRoute = getRoleBasedRoute(userProfile?.role);
        
        // Navigate to the role-specific dashboard
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
