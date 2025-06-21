import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export interface Teacher {
  id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  profile_id?: string;
  department_id: string;
  designation_id: string;
  employment_status: string;
  school_id: string;
  join_date: string;
  created_at: string;
  updated_at: string;
  is_teacher: boolean;
  // Relations
  department?: {
    id: string;
    name: string;
  };
  designation?: {
    id: string;
    name: string;
  };
  profile?: {
    id: string;
    roles: string[];
  };
}

export function useTeachersFromStaff(schoolId: string) {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch teachers from staff_details where is_teacher is true
  const fetchTeachers = useCallback(async () => {
    if (!schoolId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('staff_details')
        .select(`
          *,
          department:departments(id, name),
          designation:designations(id, name),
          profile:profiles(id, roles)
        `)
        .eq('school_id', schoolId)
        .eq('employment_status', 'Active')
        .eq('is_teacher', true);

      if (error) {
        throw error;
      }

      setTeachers(data || []);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch teachers',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [schoolId]);

  return {
    teachers,
    isLoading,
    fetchTeachers
  };
}
