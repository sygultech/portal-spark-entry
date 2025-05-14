
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { 
  fetchBatches, 
  fetchBatch, 
  createBatch, 
  updateBatch, 
  deleteBatch,
  archiveBatch,
  assignSubjectToBatch,
  updateBatchSubjectTeacher,
  removeSubjectFromBatch,
  fetchBatchSubjects
} from '@/services/batchService';
import type { Batch } from '@/types/academic';

export function useBatches(courseId?: string, academicYearId?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch all batches
  const batchesQuery = useQuery({
    queryKey: ['batches', courseId, academicYearId],
    queryFn: () => fetchBatches(courseId, academicYearId),
    enabled: (!!(courseId || academicYearId))
  });

  // Fetch a single batch with details
  const getBatch = (id: string) => {
    return useQuery({
      queryKey: ['batch', id],
      queryFn: () => fetchBatch(id),
      enabled: !!id
    });
  };

  // Create a new batch
  const createBatchMutation = useMutation({
    mutationFn: (newBatch: Omit<Batch, 'id' | 'created_at' | 'updated_at'>) => 
      createBatch(newBatch),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      if (data.course_id) {
        queryClient.invalidateQueries({ queryKey: ['batches', data.course_id] });
      }
      if (data.academic_year_id) {
        queryClient.invalidateQueries({ queryKey: ['batches', undefined, data.academic_year_id] });
      }
      toast({
        title: "Batch Created",
        description: "The batch has been created successfully."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create batch",
        variant: "destructive"
      });
    }
  });

  // Update a batch
  const updateBatchMutation = useMutation({
    mutationFn: ({ id, batch }: { id: string, batch: Partial<Batch> }) => 
      updateBatch(id, batch),
    onSuccess: (data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      queryClient.invalidateQueries({ queryKey: ['batch', id] });
      if (data.course_id) {
        queryClient.invalidateQueries({ queryKey: ['batches', data.course_id] });
      }
      if (data.academic_year_id) {
        queryClient.invalidateQueries({ queryKey: ['batches', undefined, data.academic_year_id] });
      }
      toast({
        title: "Batch Updated",
        description: "The batch has been updated successfully."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update batch",
        variant: "destructive"
      });
    }
  });

  // Delete a batch
  const deleteBatchMutation = useMutation({
    mutationFn: (id: string) => deleteBatch(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      toast({
        title: "Batch Deleted",
        description: "The batch has been deleted successfully."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete batch",
        variant: "destructive"
      });
    }
  });

  // Archive a batch
  const archiveBatchMutation = useMutation({
    mutationFn: (id: string) => archiveBatch(id),
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      queryClient.invalidateQueries({ queryKey: ['batch', id] });
      if (data.course_id) {
        queryClient.invalidateQueries({ queryKey: ['batches', data.course_id] });
      }
      toast({
        title: "Batch Archived",
        description: "The batch has been archived successfully."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to archive batch",
        variant: "destructive"
      });
    }
  });

  // Assign subject to batch
  const assignSubjectMutation = useMutation({
    mutationFn: ({ batchId, subjectId, teacherId }: 
      { batchId: string, subjectId: string, teacherId?: string }) => 
      assignSubjectToBatch(batchId, subjectId, teacherId),
    onSuccess: (_, { batchId }) => {
      queryClient.invalidateQueries({ queryKey: ['batchSubjects', batchId] });
      toast({
        title: "Subject Assigned",
        description: "The subject has been assigned to the batch."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to assign subject",
        variant: "destructive"
      });
    }
  });

  // Update teacher for a batch subject
  const updateTeacherMutation = useMutation({
    mutationFn: ({ batchId, subjectId, teacherId }: 
      { batchId: string, subjectId: string, teacherId: string }) => 
      updateBatchSubjectTeacher(batchId, subjectId, teacherId),
    onSuccess: (_, { batchId }) => {
      queryClient.invalidateQueries({ queryKey: ['batchSubjects', batchId] });
      toast({
        title: "Teacher Updated",
        description: "The teacher has been updated for the subject."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update teacher",
        variant: "destructive"
      });
    }
  });

  // Remove subject from batch
  const removeSubjectMutation = useMutation({
    mutationFn: ({ batchId, subjectId }: { batchId: string, subjectId: string }) => 
      removeSubjectFromBatch(batchId, subjectId),
    onSuccess: (_, { batchId }) => {
      queryClient.invalidateQueries({ queryKey: ['batchSubjects', batchId] });
      toast({
        title: "Subject Removed",
        description: "The subject has been removed from the batch."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove subject",
        variant: "destructive"
      });
    }
  });

  // Fetch subjects for a batch
  const getBatchSubjects = (batchId: string) => {
    return useQuery({
      queryKey: ['batchSubjects', batchId],
      queryFn: () => fetchBatchSubjects(batchId),
      enabled: !!batchId
    });
  };

  return {
    batches: batchesQuery.data || [],
    isLoading: batchesQuery.isLoading,
    error: batchesQuery.error,
    getBatch,
    createBatch: createBatchMutation.mutate,
    updateBatch: updateBatchMutation.mutate,
    deleteBatch: deleteBatchMutation.mutate,
    archiveBatch: archiveBatchMutation.mutate,
    assignSubject: assignSubjectMutation.mutate,
    updateTeacher: updateTeacherMutation.mutate,
    removeSubject: removeSubjectMutation.mutate,
    getBatchSubjects,
    isCreating: createBatchMutation.isPending,
    isUpdating: updateBatchMutation.isPending,
    isDeleting: deleteBatchMutation.isPending,
    isArchiving: archiveBatchMutation.isPending
  };
}
