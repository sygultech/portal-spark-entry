
import React, { createContext, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

// Define profile type based on our database structure
export type UserRole = "super_admin" | "school_admin" | "teacher" | "student" | "parent";

export interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  avatar_url: string | null;
  school_id: string | null;
  role: UserRole;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Helper function to clean up auth state
  const cleanupAuthState = () => {
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
  const fetchUserProfile = async (userId: string) => {
    try {
      // Replace single() with maybeSingle() to handle cases where profile might not exist
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (data) {
        setProfile(data as Profile);
      } else {
        // Handle case where profile doesn't exist
        console.log("No profile found for user. Creating default profile.");
        // Attempt to create a basic profile for the user
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
            role: "student" as UserRole, // Default role
            avatar_url: null,
            school_id: null
          };

          const { error: insertError } = await supabase
            .from("profiles")
            .insert(defaultProfile);

          if (insertError) {
            console.error("Error creating default profile:", insertError.message);
          } else {
            setProfile(defaultProfile);
          }
        }
      }
    } catch (error: any) {
      console.error("Error fetching user profile:", error.message);
    }
  };

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
        setUser(data.user);
        setSession(data.session);
        
        // Fetch user profile after successful sign in
        // Use setTimeout to prevent potential deadlocks
        setTimeout(() => {
          fetchUserProfile(data.user.id);
        }, 0);
        
        navigate("/");
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
      setUser(null);
      setSession(null);
      setProfile(null);
      
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

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        // Fetch profile data with setTimeout to prevent deadlocks
        if (currentSession?.user) {
          setTimeout(() => {
            fetchUserProfile(currentSession.user.id);
          }, 0);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user) {
        fetchUserProfile(currentSession.user.id);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const value = {
    session,
    user,
    profile,
    isLoading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
