
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export interface SubjectTeacher {
  id: string;
  subject_id: string;
  teacher_id: string;
  batch_id: string;
  academic_year_id: string;
  created_at: string;
  updated_at: string;
  
  // Relations - using staff_details instead of profiles
  teacher?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    employee_id: string;
  };
  subject?: {
    name: string;
    code: string;
  };
  batch?: {
    name: string;
  };
}

export const useSubjectTeachers = (subjectId?: string, batchId?: string, academicYearId?: string) => {
  const [subjectTeachers, setSubjectTeachers] = useState<SubjectTeacher[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSubjectTeachers = useCallback(async () => {
    if (!subjectId || !batchId || !academicYearId) {
      console.log('Missing required parameters for fetchSubjectTeachers:', { subjectId, batchId, academicYearId });
      setSubjectTeachers([]);
      return;
    }

    setIsLoading(true);
    try {
      console.log('Fetching subject teachers with params:', { subjectId, batchId, academicYearId });

      // Query subject_teachers and join with staff_details, subjects, and batches
      const { data, error } = await supabase
        .from('subject_teachers')
        .select(`
          *,
          teacher:staff_details!subject_teachers_teacher_id_fkey(
            id,
            first_name,
            last_name,
            email,
            employee_id
          ),
          subject:subjects(
            name,
            code
          ),
          batch:batches(
            name
          )
        `)
        .eq('subject_id', subjectId)
        .eq('batch_id', batchId)
        .eq('academic_year_id', academicYearId);

      if (error) {
        console.error('Error fetching subject teachers:', error);
        throw error;
      }

      console.log('Raw subject teachers data:', data);

      // Filter out any entries where teacher data is null (teacher not found in staff_details)
      const validSubjectTeachers = data?.filter(st => st.teacher !== null) || [];
      
      console.log('Valid subject teachers after filtering:', validSubjectTeachers);
      setSubjectTeachers(validSubjectTeachers);
    } catch (error: any) {
      console.error('Error fetching subject teachers:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch subject teachers',
        variant: 'destructive'
      });
      setSubjectTeachers([]);
    } finally {
      setIsLoading(false);
    }
  }, [subjectId, batchId, academicYearId]);

  useEffect(() => {
    fetchSubjectTeachers();
  }, [fetchSubjectTeachers]);

  const addSubjectTeacher = useCallback(async (teacherId: string) => {
    if (!subjectId || !batchId || !academicYearId) {
      toast({
        title: 'Error',
        description: 'Missing required parameters',
        variant: 'destructive'
      });
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('subject_teachers')
        .insert([{
          subject_id: subjectId,
          teacher_id: teacherId,
          batch_id: batchId,
          academic_year_id: academicYearId
        }])
        .select(`
          *,
          teacher:staff_details!subject_teachers_teacher_id_fkey(
            id,
            first_name,
            last_name,
            email,
            employee_id
          ),
          subject:subjects(
            name,
            code
          ),
          batch:batches(
            name
          )
        `)
        .single();

      if (error) throw error;

      // Only add if teacher data exists
      if (data && data.teacher) {
        setSubjectTeachers(prev => [...prev, data]);
        toast({
          title: 'Success',
          description: 'Teacher assigned to subject successfully'
        });
        return true;
      } else {
        toast({
          title: 'Error',
          description: 'Teacher not found in staff details',
          variant: 'destructive'
        });
        return false;
      }
    } catch (error: any) {
      console.error('Error adding subject teacher:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to assign teacher to subject',
        variant: 'destructive'
      });
      return false;
    }
  }, [subjectId, batchId, academicYearId]);

  const removeSubjectTeacher = useCallback(async (subjectTeacherId: string) => {
    try {
      const { error } = await supabase
        .from('subject_teachers')
        .delete()
        .eq('id', subjectTeacherId);

      if (error) throw error;

      setSubjectTeachers(prev => prev.filter(st => st.id !== subjectTeacherId));
      toast({
        title: 'Success',
        description: 'Teacher removed from subject successfully'
      });
      return true;
    } catch (error: any) {
      console.error('Error removing subject teacher:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove teacher from subject',
        variant: 'destructive'
      });
      return false;
    }
  }, []);

  // Add aliases for backward compatibility with existing components
  const assignTeacher = useCallback(async (assignment: any) => {
    return addSubjectTeacher(assignment.teacher_id);
  }, [addSubjectTeacher]);

  const removeTeacher = useCallback(async (assignmentId: string) => {
    return removeSubjectTeacher(assignmentId);
  }, [removeSubjectTeacher]);

  return {
    subjectTeachers,
    isLoading,
    fetchSubjectTeachers,
    addSubjectTeacher,
    removeSubjectTeacher,
    assignTeacher, // Alias for backward compatibility
    removeTeacher  // Alias for backward compatibility
  };
};
