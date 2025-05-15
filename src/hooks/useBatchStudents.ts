
import { useState, useEffect } from 'react';
import { getStudentsByBatch, assignStudentsToBatch, removeStudentFromBatch } from '@/services/batchStudentService';
import { toast } from '@/hooks/use-toast';

export const useBatchStudents = (batchId: string | null) => {
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudents = async () => {
      if (!batchId) {
        setStudents([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const data = await getStudentsByBatch(batchId);
        setStudents(data || []);
      } catch (err: any) {
        console.error('Error in useBatchStudents:', err);
        setError(err.message);
        toast({
          title: 'Error',
          description: `Failed to fetch students: ${err.message}`,
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, [batchId]);

  const addStudents = async (studentIds: string[]) => {
    if (!batchId) return false;
    
    try {
      setIsLoading(true);
      const success = await assignStudentsToBatch(batchId, studentIds);
      
      if (success) {
        // Refresh the student list
        const data = await getStudentsByBatch(batchId);
        setStudents(data || []);
      }
      
      return success;
    } catch (err: any) {
      console.error('Error adding students to batch:', err);
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const removeStudent = async (studentId: string) => {
    if (!batchId) return false;
    
    try {
      setIsLoading(true);
      const success = await removeStudentFromBatch(batchId, studentId);
      
      if (success) {
        // Update local state by removing the student
        setStudents(students.filter(student => student.id !== studentId));
      }
      
      return success;
    } catch (err: any) {
      console.error('Error removing student from batch:', err);
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    students,
    isLoading,
    error,
    addStudents,
    removeStudent,
    refreshStudents: () => getStudentsByBatch(batchId || '').then(data => setStudents(data || [])),
  };
};
