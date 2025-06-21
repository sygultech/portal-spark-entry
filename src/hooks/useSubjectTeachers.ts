import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { SubjectTeacher } from '@/types/academic';
import { useToast } from '@/hooks/use-toast';

export function useSubjectTeachers(subjectId?: string, batchId?: string, academicYearId?: string) {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const schoolId = profile?.school_id;

  const fetchSubjectTeachers = async () => {
    if (!schoolId) return [];
    
    let query = supabase
      .from('subject_teachers')
      .select(`
        *,
        teacher:staff_details(
          id,
          first_name,
          last_name,
          email,
          employee_id
        ),
        subject:subjects(id, name, code),
        batch:batches(id, name, code)
      `);
    
    if (subjectId) {
      query = query.eq('subject_id', subjectId);
    }
    
    if (batchId) {
      query = query.eq('batch_id', batchId);
    }
    
    if (academicYearId) {
      query = query.eq('academic_year_id', academicYearId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching subject teachers:', error);
      throw error;
    }
    
    return data;
  };
  
  const subjectTeachersQuery = useQuery({
    queryKey: ['subject-teachers', schoolId, subjectId, batchId, academicYearId],
    queryFn: fetchSubjectTeachers,
    enabled: !!schoolId
  });

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
