
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface Profile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: 'super_admin' | 'school_admin' | 'teacher' | 'student' | 'parent';
  school_id: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export const useProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setProfile(null);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          setError(error.message);
          toast({
            title: 'Error',
            description: `Could not fetch profile: ${error.message}`,
            variant: 'destructive',
          });
        } else {
          setProfile(data);
          setError(null);
        }
      } catch (err: any) {
        console.error('Exception in fetchProfile:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      if (!user) return null;

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating profile:', error);
        toast({
          title: 'Error',
          description: `Could not update profile: ${error.message}`,
          variant: 'destructive',
        });
        return null;
      }

      setProfile(data);
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
      return data;
    } catch (err: any) {
      console.error('Exception in updateProfile:', err);
      toast({
        title: 'Error',
        description: `An unexpected error occurred: ${err.message}`,
        variant: 'destructive',
      });
      return null;
    }
  };

  return {
    profile,
    isLoading,
    error,
    updateProfile,
  };
};

// force update
