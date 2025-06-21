
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Profile, UserRole } from "@/contexts/types";
import { toast } from "@/components/ui/use-toast";
import { cleanupAuthState, fetchUserProfile, createUserProfile, refreshUserRoleCache } from "@/utils/authUtils";

export const useAuthOperations = () => {
  const [isLoading, setIsLoading] = useState(false);

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
        console.log("Global sign out failed, continuing with sign in");
      }
      
      // Attempt to sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.log("Login error detected:", error.message);
        
        if (error.message.includes("Email not confirmed")) {
          try {
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
                toast({
                  title: "Login successful!",
                  description: "Welcome back!",
                });
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
        } else if (error.message.includes("Invalid login credentials")) {
          toast({
            title: "Login failed",
            description: "The email or password you entered is incorrect.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Login failed",
            description: error.message,
            variant: "destructive",
          });
        }
        
        setIsLoading(false);
        return;
      }
      
      if (data?.user) {
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
      cleanupAuthState();
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            role: "student" 
          },
        },
      });

      if (error) throw error;

      toast({
        title: "Sign up successful!",
        description: "Please check your email for a confirmation link.",
      });
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
      cleanupAuthState();
      await supabase.auth.signOut({ scope: 'global' });
      
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
    signIn,
    signUp,
    signOut
  };
};
