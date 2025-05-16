
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useBatchSubjects(batchId?: string) {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const schoolId = profile?.school_id;

  const fetchBatchSubjects = async () => {
    if (!schoolId || !batchId) return [];
    
    const { data, error } = await supabase
      .from('batch_subjects')
      .select(`
        *,
        subject:subjects(*)
      `)
      .eq('batch_id', batchId);
    
    if (error) {
      console.error('Error fetching batch subjects:', error);
      throw error;
    }
    
    return data;
  };
  
  const batchSubjectsQuery = useQuery({
    queryKey: ['batch-subjects', batchId],
    queryFn: fetchBatchSubjects,
    enabled: !!schoolId && !!batchId
  });

  const assignSubjectMutation = useMutation({
    mutationFn: async ({ subjectId, isMandatory = true }: { subjectId: string; isMandatory?: boolean }) => {
      if (!batchId) throw new Error("Batch ID is required");
      
      const { data, error } = await supabase
        .from('batch_subjects')
        .insert({
          batch_id: batchId,
          subject_id: subjectId,
          is_mandatory: isMandatory
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error assigning subject to batch:', error);
        toast({
          title: "Error",
          description: `Failed to assign subject to batch: ${error.message}`,
          variant: "destructive"
        });
        throw error;
      }
      
      toast({
        title: "Success",
        description: "Subject assigned to batch successfully"
      });
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batch-subjects', batchId] });
    }
  });

  const removeSubjectMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('batch_subjects')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error removing subject from batch:', error);
        toast({
          title: "Error",
          description: `Failed to remove subject from batch: ${error.message}`,
          variant: "destructive"
        });
        throw error;
      }
      
      toast({
        title: "Success",
        description: "Subject removed from batch successfully"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batch-subjects', batchId] });
    }
  });

  const updateBatchSubjectMutation = useMutation({
    mutationFn: async ({ id, isMandatory }: { id: string; isMandatory: boolean }) => {
      const { data, error } = await supabase
        .from('batch_subjects')
        .update({ is_mandatory: isMandatory })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating batch subject:', error);
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
      queryClient.invalidateQueries({ queryKey: ['batch-subjects', batchId] });
    }
  });

  return {
    batchSubjects: batchSubjectsQuery.data || [],
    isLoading: batchSubjectsQuery.isLoading,
    error: batchSubjectsQuery.error,
    assignSubject: assignSubjectMutation.mutate,
    removeSubject: removeSubjectMutation.mutate,
    updateBatchSubject: updateBatchSubjectMutation.mutate
  };
}
