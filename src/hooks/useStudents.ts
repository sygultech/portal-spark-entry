
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Student } from '@/types/school';

export function useStudents() {
  const { profile } = useAuth();
  const schoolId = profile?.school_id;
  
  const studentsQuery = useQuery({
    queryKey: ['students', schoolId],
    queryFn: async () => {
      if (!schoolId) throw new Error("School ID is required");
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'student')
        .eq('school_id', schoolId);
        
      if (error) throw error;
      return data as Student[];
    },
    enabled: !!schoolId
  });

  return {
    students: studentsQuery.data || [],
    isLoading: studentsQuery.isLoading,
    error: studentsQuery.error
  };
}

// force update
