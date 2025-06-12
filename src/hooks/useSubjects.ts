import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Subject } from '@/types/academic';
import { useToast } from '@/hooks/use-toast';

export function useSubjects(academicYearId?: string, categoryId?: string, includeArchived: boolean = false) {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const schoolId = profile?.school_id;
  
  const fetchSubjects = async () => {
    if (!schoolId) return [];
    
    let query = supabase
      .from('subjects')
      .select(`
        *,
        category:subject_categories(id, name),
        batch_assignments:batch_subjects(
          id,
          batch_id,
          is_mandatory
        )
      `)
      .eq('school_id', schoolId);
    
    // Temporarily remove filters for debugging
    // if (!includeArchived) {
    //   query = query.eq('is_archived', false);
    // }
    
    if (academicYearId) {
      query = query.eq('academic_year_id', academicYearId);
    }
    
    // if (categoryId) {
    //   query = query.eq('category_id', categoryId);
    // }
    
    const { data, error } = await query.order('name');
    console.log('Supabase subjects response:', data, error);
    if (error) {
      console.error('Error fetching subjects:', error);
      throw error;
    }
    
    return data as Subject[];
  };

  const fetchSubject = async (id: string) => {
    const { data, error } = await supabase
      .from('subjects')
      .select(`
        *,
        category:subject_categories(id, name),
        batch_assignments:batch_subjects(
          id,
          batch_id,
          is_mandatory
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching subject:', error);
      throw error;
    }
    
    return data as Subject;
  };
  
  const subjectsQuery = useQuery({
    queryKey: ['subjects', schoolId, academicYearId, categoryId, includeArchived],
    queryFn: fetchSubjects,
    enabled: !!schoolId
  });

  const createSubjectMutation = useMutation({
    mutationFn: async (data: {
      name: string;
      code?: string;
      description?: string;
      category_id?: string;
      subject_type?: string;
      academic_year_id: string;
      school_id: string;
      batch_assignments?: Array<{
        batch_id: string;
        is_mandatory: boolean;
      }>;
    }) => {
      // Extract batch assignments and remove any extra fields
      const { batch_assignments, ...subjectData } = data;

      // First, create the subject with only valid subject fields
      const { data: newSubject, error: subjectError } = await supabase
        .from('subjects')
        .insert({
          name: subjectData.name,
          code: subjectData.code,
          description: subjectData.description,
          category_id: subjectData.category_id,
          subject_type: subjectData.subject_type,
          academic_year_id: subjectData.academic_year_id,
          school_id: subjectData.school_id
        })
        .select()
        .single();
      
      if (subjectError) {
        console.error('Error creating subject:', subjectError);
        toast({
          title: "Error",
          description: `Failed to create subject: ${subjectError.message}`,
          variant: "destructive"
        });
        throw subjectError;
      }

      // If we have batch assignments, create them
      if (batch_assignments && batch_assignments.length > 0) {
        const { error: batchError } = await supabase
          .from('batch_subjects')
          .insert(
            batch_assignments.map(assignment => ({
              subject_id: newSubject.id,
              batch_id: assignment.batch_id,
              is_mandatory: assignment.is_mandatory
            }))
          );

        if (batchError) {
          console.error('Error creating batch assignments:', batchError);
          // Clean up the subject if batch assignments fail
          await supabase.from('subjects').delete().eq('id', newSubject.id);
          toast({
            title: "Error",
            description: `Failed to assign subject to batch: ${batchError.message}`,
            variant: "destructive"
          });
          throw batchError;
        }
      }
      
      toast({
        title: "Success",
        description: "Subject created successfully"
      });
      
      // Fetch the complete subject with its relationships
      return await fetchSubject(newSubject.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects', schoolId, academicYearId, categoryId, includeArchived] });
    }
  });

  const updateSubjectMutation = useMutation({
    mutationFn: async (subject: Partial<Subject> & { id: string }) => {
      const { id, batch_assignments, category, ...updateData } = subject;
      
      const { data, error } = await supabase
        .from('subjects')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating subject:', error);
        toast({
          title: "Error",
          description: `Failed to update subject: ${error.message}`,
          variant: "destructive"
        });
        throw error;
      }
      
      toast({
        title: "Success",
        description: "Subject updated successfully"
      });
      
      return data as Subject;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects', schoolId, academicYearId, categoryId, includeArchived] });
    }
  });

  const deleteSubjectMutation = useMutation({
    mutationFn: async (subjectId: string) => {
      // First delete all batch assignments
      const { error: batchError } = await supabase
        .from('batch_subjects')
        .delete()
        .eq('subject_id', subjectId);

      if (batchError) {
        console.error('Error deleting batch assignments:', batchError);
        toast({
          title: "Error",
          description: `Failed to delete batch assignments: ${batchError.message}`,
          variant: "destructive"
        });
        throw batchError;
      }

      // Then delete the subject
      const { error } = await supabase
        .from('subjects')
        .delete()
        .eq('id', subjectId);
      
      if (error) {
        console.error('Error deleting subject:', error);
        toast({
          title: "Error",
          description: `Failed to delete subject: ${error.message}`,
          variant: "destructive"
        });
        throw error;
      }
      
      toast({
        title: "Success",
        description: "Subject deleted successfully"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects', schoolId, academicYearId, categoryId, includeArchived] });
    }
  });

  return {
    subjects: subjectsQuery.data || [],
    isLoading: subjectsQuery.isLoading,
    error: subjectsQuery.error,
    fetchSubject,
    createSubject: createSubjectMutation.mutateAsync,
    updateSubject: updateSubjectMutation.mutateAsync,
    deleteSubject: deleteSubjectMutation.mutateAsync
  };
}
