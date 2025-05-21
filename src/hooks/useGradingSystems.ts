
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { GradingSystem, GradeThreshold } from '@/types/academic';
import { useToast } from '@/hooks/use-toast';
import {
  fetchGradingSystems,
  fetchGradingSystem,
  createGradingSystem,
  updateGradingSystem,
  deleteGradingSystem,
  setDefaultGradingSystem,
  getGradingSystemUsage,
  assignGradingSystemToBatches
} from '@/services/gradingSystemService';

export function useGradingSystems() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const schoolId = profile?.school_id;
  
  // Fetch all grading systems for the school
  const gradingSystemsQuery = useQuery({
    queryKey: ['gradingSystems', schoolId],
    queryFn: () => schoolId ? fetchGradingSystems(schoolId) : Promise.resolve([]),
    enabled: !!schoolId
  });

  // Fetch a single grading system by ID
  const fetchGradingSystemById = async (id: string) => {
    return await fetchGradingSystem(id);
  };

  // Create a grading system
  const createGradingSystemMutation = useMutation({
    mutationFn: async (newSystem: {
      name: string;
      type: 'marks' | 'grades' | 'hybrid';
      description?: string;
      passing_score: number;
      thresholds: Array<{
        grade: string;
        name: string;
        min_score: number;
        max_score: number;
        grade_point?: number;
      }>;
    }) => {
      if (!schoolId) {
        throw new Error('School ID is required');
      }
      
      return createGradingSystem({
        ...newSystem,
        school_id: schoolId
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gradingSystems', schoolId] });
      toast({
        title: 'Success',
        description: 'Grading system created successfully.'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `Failed to create grading system: ${error.message}`,
        variant: 'destructive'
      });
    }
  });

  // Update a grading system
  const updateGradingSystemMutation = useMutation({
    mutationFn: async ({
      id,
      data
    }: {
      id: string;
      data: Partial<Omit<GradingSystem, 'id' | 'created_at' | 'updated_at'>> & {
        thresholds?: Array<GradeThreshold>;
      };
    }) => {
      return updateGradingSystem(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gradingSystems', schoolId] });
      toast({
        title: 'Success',
        description: 'Grading system updated successfully.'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `Failed to update grading system: ${error.message}`,
        variant: 'destructive'
      });
    }
  });

  // Delete a grading system
  const deleteGradingSystemMutation = useMutation({
    mutationFn: async (id: string) => {
      return deleteGradingSystem(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gradingSystems', schoolId] });
      toast({
        title: 'Success',
        description: 'Grading system deleted successfully.'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `Failed to delete grading system: ${error.message}`,
        variant: 'destructive'
      });
    }
  });

  // Set default grading system for the school
  const setDefaultGradingSystemMutation = useMutation({
    mutationFn: async (gradingSystemId: string) => {
      if (!schoolId) {
        throw new Error('School ID is required');
      }
      
      return setDefaultGradingSystem(schoolId, gradingSystemId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gradingSystems', schoolId] });
      queryClient.invalidateQueries({ queryKey: ['school', schoolId] });
      toast({
        title: 'Success',
        description: 'Default grading system updated successfully.'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `Failed to set default grading system: ${error.message}`,
        variant: 'destructive'
      });
    }
  });

  // Get usage statistics for a grading system
  const getGradingSystemUsageMutation = useMutation({
    mutationFn: async (gradingSystemId: string) => {
      return getGradingSystemUsage(gradingSystemId);
    }
  });

  // Assign grading system to batches
  const assignGradingSystemToBatchesMutation = useMutation({
    mutationFn: async ({
      gradingSystemId,
      batchIds
    }: {
      gradingSystemId: string;
      batchIds: string[];
    }) => {
      return assignGradingSystemToBatches(gradingSystemId, batchIds);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      toast({
        title: 'Success',
        description: 'Grading system assigned to batches successfully.'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `Failed to assign grading system to batches: ${error.message}`,
        variant: 'destructive'
      });
    }
  });

  return {
    gradingSystems: gradingSystemsQuery.data || [],
    isLoading: gradingSystemsQuery.isLoading,
    error: gradingSystemsQuery.error,
    fetchGradingSystem: fetchGradingSystemById,
    createGradingSystem: createGradingSystemMutation.mutateAsync,
    updateGradingSystem: updateGradingSystemMutation.mutateAsync,
    deleteGradingSystem: deleteGradingSystemMutation.mutateAsync,
    setDefaultGradingSystem: setDefaultGradingSystemMutation.mutateAsync,
    getGradingSystemUsage: getGradingSystemUsageMutation.mutateAsync,
    assignGradingSystemToBatches: assignGradingSystemToBatchesMutation.mutateAsync
  };
}

// force update

// force update
