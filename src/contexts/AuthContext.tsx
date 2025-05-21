
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
  const { isLoading, setIsLoading, signIn, signUp, signOut } = useAuthOperations();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        // Fetch profile data with setTimeout to prevent deadlocks
        if (currentSession?.user) {
          setTimeout(async () => {
            const userProfile = await fetchUserProfile(currentSession.user.id);
            if (userProfile) {
              setProfile(userProfile);
            }
          }, 0);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user) {
        const userProfile = await fetchUserProfile(currentSession.user.id);
        if (userProfile) {
          setProfile(userProfile);
        }
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setIsLoading]);

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
