import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { fetchUserProfile, switchUserSchool, getUserRolesInSchool } from '@/utils/authUtils';
import { UserProfile, UserSchoolRole } from '@/types/auth';
import { UserRole } from '@/types/common';

export const useAuth = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      const profile = await fetchUserProfile(userId);
      setUser(profile);
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const switchSchool = async (schoolId: string) => {
    if (!user) return false;
    
    const success = await switchUserSchool(schoolId);
    if (success) {
      // Reload user profile to get updated school context
      await loadUserProfile(user.id);
    }
    return success;
  };

  const getCurrentSchoolRoles = async (): Promise<UserRole[]> => {
    if (!user?.id || !user.primary_school_id) return [];
    return getUserRolesInSchool(user.id, user.primary_school_id);
  };

  const hasRole = (role: UserRole, schoolId?: string): boolean => {
    if (!user) return false;
    
    const targetSchoolId = schoolId || user.primary_school_id;
    if (!targetSchoolId) return false;

    return user.roles.some(r => 
      r.school_id === targetSchoolId && 
      r.role === role
    );
  };

  const getSchoolRoles = (schoolId: string): UserSchoolRole[] => {
    if (!user) return [];
    return user.roles.filter(r => r.school_id === schoolId);
  };

  return {
    user,
    loading,
    switchSchool,
    getCurrentSchoolRoles,
    hasRole,
    getSchoolRoles
  };
}; 
// force update

// force update
