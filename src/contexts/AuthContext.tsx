
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
            const userProfile = await fetchUserProfile(currentSession.user.id);
            if (mounted && userProfile) {
              setProfile(userProfile);
            }
          } catch (error) {
            console.error("Error fetching initial profile:", error);
          }
        } else {
          setProfile(null);
        }
        
        if (mounted) {
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
            const userProfile = await fetchUserProfile(currentSession.user.id);
            if (mounted && userProfile) {
              setProfile(userProfile);
            }
          } catch (error) {
            console.error("Error fetching profile:", error);
          }
        } else {
          setProfile(null);
        }
        
        if (mounted) {
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
