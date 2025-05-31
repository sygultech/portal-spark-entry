import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useTeachers() {
  const { profile } = useAuth();
  const schoolId = profile?.school_id;
  
  const teachersQuery = useQuery({
    queryKey: ['teachers', schoolId],
    queryFn: async () => {
      if (!schoolId) throw new Error("School ID is required");
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .contains('roles', ['teacher'])
        .eq('school_id', schoolId);
        
      if (error) throw error;
      return data;
    },
    enabled: !!schoolId
  });

  return {
    teachers: teachersQuery.data || [],
    isLoading: teachersQuery.isLoading,
    error: teachersQuery.error
  };
}
