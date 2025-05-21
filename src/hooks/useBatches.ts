
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { 
  fetchBatches, 
  createBatch, 
  updateBatch, 
  deleteBatch,
  toggleBatchArchiveStatus,
  fetchBatchStudents,
  addStudentToBatch,
  removeStudentFromBatch,
  ensureBatchStudentsTable
} from '@/services/batchService';
import { Batch } from '@/types/academic';

export function useBatches(academicYearId?: string, courseId?: string) {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const schoolId = profile?.school_id;
  
  const batchesQuery = useQuery({
    queryKey: ['batches', schoolId, academicYearId, courseId],
    queryFn: () => schoolId ? fetchBatches(schoolId, academicYearId, courseId) : Promise.resolve([]),
    enabled: !!schoolId
  });

  const createMutation = useMutation({
    mutationFn: (batch: Omit<Batch, 'id' | 'created_at' | 'updated_at'>) => 
      createBatch(batch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batches', schoolId, academicYearId, courseId] });
    }
  });
  
  const updateMutation = useMutation({
    mutationFn: (batch: Partial<Batch> & { id: string }) => 
      updateBatch(batch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batches', schoolId, academicYearId, courseId] });
    }
  });
  
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteBatch(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batches', schoolId, academicYearId, courseId] });
    }
  });

  const toggleArchiveMutation = useMutation({
    mutationFn: ({ id, isArchived }: { id: string; isArchived: boolean }) => 
      toggleBatchArchiveStatus(id, isArchived),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batches', schoolId, academicYearId, courseId] });
    }
  });

  return {
    batches: batchesQuery.data || [],
    isLoading: batchesQuery.isLoading,
    error: batchesQuery.error,
    createBatch: createMutation.mutate,
    updateBatch: updateMutation.mutate,
    deleteBatch: deleteMutation.mutate,
    toggleArchiveStatus: toggleArchiveMutation.mutate
  };
}

export function useBatchStudents(batchId: string | undefined) {
  const queryClient = useQueryClient();
  
  const studentsQuery = useQuery({
    queryKey: ['batch-students', batchId],
    queryFn: () => batchId ? fetchBatchStudents(batchId) : Promise.resolve([]),
    enabled: !!batchId
  });

  const addStudentMutation = useMutation({
    mutationFn: ({ studentId, rollNumber }: { studentId: string, rollNumber?: string }) => 
      batchId ? addStudentToBatch(batchId, studentId, rollNumber) : Promise.resolve(null),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batch-students', batchId] });
    }
  });
  
  const removeStudentMutation = useMutation({
    mutationFn: (batchStudentId: string) => removeStudentFromBatch(batchStudentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batch-students', batchId] });
    }
  });

  const ensureTableMutation = useMutation({
    mutationFn: ({
      operation,
      data,
      conditions
    }: {
      operation: 'insert' | 'delete';
      data?: any;
      conditions?: any;
    }) => ensureBatchStudentsTable(operation, data, conditions)
  });

  return {
    students: studentsQuery.data || [],
    isLoading: studentsQuery.isLoading,
    error: studentsQuery.error,
    addStudent: addStudentMutation.mutate,
    removeStudent: removeStudentMutation.mutate,
    ensureTable: ensureTableMutation.mutate
  };
}

// force update

// force update
