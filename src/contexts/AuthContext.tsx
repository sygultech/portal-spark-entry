
import React, { createContext, useState, useEffect, useContext } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { AuthContextType, Profile } from "./types";
import { useAuthOperations } from "@/hooks/useAuthOperations";
import { fetchUserProfile } from "@/utils/authUtils";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { signIn, signUp, signOut } = useAuthOperations();

  useEffect(() => {
    console.log("AuthProvider: Setting up auth state listener");
    
    let mounted = true;
    
    // Get initial session first
    const initializeAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        console.log("Initial session check:", currentSession?.user?.id);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          try {
            console.log("Fetching profile for user:", currentSession.user.id);
            const userProfile = await fetchUserProfile(currentSession.user.id);
            if (mounted) {
              if (userProfile) {
                console.log("Profile loaded successfully:", userProfile);
                setProfile(userProfile);
              } else {
                console.log("No profile found for user");
                setProfile(null);
              }
            }
          } catch (error) {
            console.error("Error fetching initial profile:", error);
            if (mounted) {
              setProfile(null);
            }
          }
        } else {
          setProfile(null);
        }
        
        if (mounted) {
          console.log("Setting isLoading to false");
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (!mounted) return;
        
        console.log("Auth state changed:", event, currentSession?.user?.id);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        // Fetch profile data if user exists
        if (currentSession?.user) {
          try {
            console.log("Fetching profile after auth change for user:", currentSession.user.id);
            const userProfile = await fetchUserProfile(currentSession.user.id);
            if (mounted) {
              if (userProfile) {
                console.log("Profile loaded after auth change:", userProfile);
                setProfile(userProfile);
              } else {
                console.log("No profile found after auth change");
                setProfile(null);
              }
            }
          } catch (error) {
            console.error("Error fetching profile after auth change:", error);
            if (mounted) {
              setProfile(null);
            }
          }
        } else {
          setProfile(null);
        }
        
        if (mounted) {
          console.log("Setting isLoading to false after auth change");
          setIsLoading(false);
        }
      }
    );

    // Initialize auth
    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  console.log("AuthProvider render:", { user: !!user, profile: !!profile, isLoading });

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
