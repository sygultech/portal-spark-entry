
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const useAvailableTeachers = () => {
  const { profile } = useAuth();
  const [teachers, setTeachers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeachers = async () => {
      if (!profile?.school_id) {
        setTeachers([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Get all teachers from the school
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('school_id', profile.school_id)
          .eq('role', 'teacher');

        if (error) throw error;
        
        setTeachers(data || []);
      } catch (err: any) {
        console.error('Error in useAvailableTeachers:', err);
        setError(err.message);
        toast({
          title: 'Error',
          description: `Failed to fetch teachers: ${err.message}`,
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeachers();
  }, [profile?.school_id]);

  return {
    teachers,
    isLoading,
    error,
    refreshTeachers: async () => {
      setIsLoading(true);
      try {
        // Re-fetch all teachers from the school
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('school_id', profile?.school_id)
          .eq('role', 'teacher');

        if (error) throw error;
        setTeachers(data || []);
      } catch (err: any) {
        console.error('Error refreshing teachers:', err);
        toast({
          title: 'Error',
          description: `Failed to refresh teacher list: ${err.message}`,
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    }
  };
};

// force update

// force update
