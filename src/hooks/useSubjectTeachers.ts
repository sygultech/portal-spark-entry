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
        teacher:profiles!subject_teachers_teacher_id_fkey(
          id,
          first_name,
          last_name,
          email,
          staff:staff_details(
            id,
            employee_id
          )
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

  const assignTeacherMutation = useMutation({
    mutationFn: async (assignment: Omit<SubjectTeacher, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('subject_teachers')
        .insert(assignment)
        .select()
        .single();
      
      if (error) {
        console.error('Error assigning subject teacher:', error);
        toast({
          title: "Error",
          description: `Failed to assign teacher: ${error.message}`,
          variant: "destructive"
        });
        throw error;
      }
      
      toast({
        title: "Success",
        description: "Teacher assigned successfully to subject"
      });
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subject-teachers', schoolId, subjectId, batchId, academicYearId] });
    }
  });

  const removeTeacherMutation = useMutation({
    mutationFn: async (assignmentId: string) => {
      const { error } = await supabase
        .from('subject_teachers')
        .delete()
        .eq('id', assignmentId);
      
      if (error) {
        console.error('Error removing subject teacher:', error);
        toast({
          title: "Error",
          description: `Failed to remove teacher assignment: ${error.message}`,
          variant: "destructive"
        });
        throw error;
      }
      
      toast({
        title: "Success",
        description: "Teacher assignment removed successfully"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subject-teachers', schoolId, subjectId, batchId, academicYearId] });
    }
  });

  return {
    subjectTeachers: subjectTeachersQuery.data || [],
    isLoading: subjectTeachersQuery.isLoading,
    error: subjectTeachersQuery.error,
    assignTeacher: assignTeacherMutation.mutate,
    removeTeacher: removeTeacherMutation.mutate
  };
}
