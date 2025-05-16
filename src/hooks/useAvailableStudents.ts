
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useBatchStudents } from './useBatchStudents';

export const useAvailableStudents = (batchId: string | null) => {
  const { profile } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { students: assignedStudents, isLoading: loadingAssigned } = useBatchStudents(batchId);

  useEffect(() => {
    const fetchStudents = async () => {
      if (!profile?.school_id) {
        setStudents([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Get all students from the school, use table alias to avoid ambiguity
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('school_id', profile.school_id)
          .eq('role', 'student');

        if (error) throw error;

        // Filter out students who are already in the batch
        const assignedStudentIds = assignedStudents.map(student => student.id);
        const availableStudents = data.filter(student => 
          !assignedStudentIds.includes(student.id)
        );
        
        setStudents(availableStudents);
      } catch (err: any) {
        console.error('Error in useAvailableStudents:', err);
        setError(err.message);
        toast({
          title: 'Error',
          description: `Failed to fetch available students: ${err.message}`,
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (!loadingAssigned) {
      fetchStudents();
    }
  }, [profile?.school_id, assignedStudents, batchId, loadingAssigned]);

  return {
    students,
    isLoading: isLoading || loadingAssigned,
    error,
    refreshStudents: async () => {
      setIsLoading(true);
      try {
        // Re-fetch all students from the school with explicit table alias
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('school_id', profile?.school_id)
          .eq('role', 'student');

        if (error) throw error;

        // Filter out students who are already in the batch
        const assignedStudentIds = assignedStudents.map(student => student.id);
        const availableStudents = data.filter(student => 
          !assignedStudentIds.includes(student.id)
        );
        
        setStudents(availableStudents);
      } catch (err: any) {
        console.error('Error refreshing available students:', err);
        toast({
          title: 'Error',
          description: `Failed to refresh student list: ${err.message}`,
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    }
  };
};
