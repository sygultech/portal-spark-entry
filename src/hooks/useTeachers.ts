import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Teacher {
  id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  profile_id: string | null;
  is_teacher: boolean;
  employment_status: string;
  school_id: string;
}

export function useTeachers() {
  const { profile } = useAuth();
  const schoolId = profile?.school_id;
  
  const teachersQuery = useQuery({
    queryKey: ['teachers', schoolId],
    queryFn: async () => {
      if (!schoolId) throw new Error("School ID is required");
      
      const { data, error } = await supabase
        .from('staff_details')
        .select(`
          id,
          employee_id,
          first_name,
          last_name,
          email,
          profile_id,
          is_teacher,
          employment_status,
          school_id
        `)
        .eq('school_id', schoolId)
        .eq('is_teacher', true)
        .eq('employment_status', 'Active');
        
      if (error) throw error;
      
      return data as Teacher[];
    },
    enabled: !!schoolId
  });

  return {
    teachers: teachersQuery.data || [],
    isLoading: teachersQuery.isLoading,
    error: teachersQuery.error
  };
}
