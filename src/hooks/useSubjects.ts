
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Subject } from '@/types/academic';
import { useToast } from '@/hooks/use-toast';

export function useSubjects(academicYearId?: string, categoryId?: string) {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const schoolId = profile?.school_id;
  
  const fetchSubjects = async (): Promise<Subject[]> => {
    if (!schoolId) return [];
    
    let query = supabase
      .from('subjects')
      .select(`
        *,
        category:subject_categories(id, name)
      `)
      .eq('school_id', schoolId);
    
    if (academicYearId) {
      query = query.eq('academic_year_id', academicYearId);
    }
    
    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }
    
    const { data, error } = await query.order('name');
    
    if (error) {
      console.error('Error fetching subjects:', error);
      throw error;
    }
    
    return data;
  };

  const fetchSubject = async (id: string): Promise<Subject> => {
    const { data, error } = await supabase
      .from('subjects')
      .select(`
        *,
        category:subject_categories(id, name)
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching subject:', error);
      throw error;
    }
    
    return data;
  };
  
  const subjectsQuery = useQuery({
    queryKey: ['subjects', schoolId, academicYearId, categoryId],
    queryFn: fetchSubjects,
    enabled: !!schoolId
  });

  const createSubjectMutation = useMutation({
    mutationFn: async (subject: Omit<Subject, 'id' | 'created_at' | 'updated_at' | 'category'>) => {
      const { data, error } = await supabase
        .from('subjects')
        .insert(subject)
        .select()
        .single();
      
      if (error) {
        console.error('Error creating subject:', error);
        toast({
          title: "Error",
          description: `Failed to create subject: ${error.message}`,
          variant: "destructive"
        });
        throw error;
      }
      
      toast({
        title: "Success",
        description: "Subject created successfully"
      });
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects', schoolId, academicYearId, categoryId] });
    }
  });

  const updateSubjectMutation = useMutation({
    mutationFn: async (subject: Partial<Subject> & { id: string }) => {
      const { id, ...updateData } = subject;
      // Remove category from update data if it exists
      if ('category' in updateData) {
        delete (updateData as any).category;
      }
      
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
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects', schoolId, academicYearId, categoryId] });
    }
  });

  const deleteSubjectMutation = useMutation({
    mutationFn: async (subjectId: string) => {
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
      queryClient.invalidateQueries({ queryKey: ['subjects', schoolId, academicYearId, categoryId] });
    }
  });

  return {
    subjects: subjectsQuery.data || [],
    isLoading: subjectsQuery.isLoading,
    error: subjectsQuery.error,
    fetchSubject,
    createSubject: createSubjectMutation.mutate,
    updateSubject: updateSubjectMutation.mutate,
    deleteSubject: deleteSubjectMutation.mutate
  };
}
