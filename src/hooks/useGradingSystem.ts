
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { 
  fetchGradingSystems,
  fetchGradingSystem,
  createGradingSystem,
  updateGradingSystem,
  deleteGradingSystem,
  fetchGradeScales,
  createGradeScale,
  updateGradeScale,
  deleteGradeScale
} from '@/services/gradingService';
import type { GradingSystem, GradeScale } from '@/types/academic';

export function useGradingSystems(academicYearId?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch all grading systems
  const gradingSystemsQuery = useQuery({
    queryKey: ['gradingSystems', academicYearId],
    queryFn: () => fetchGradingSystems(academicYearId),
    enabled: !!academicYearId
  });

  // Fetch a single grading system
  const getGradingSystem = (id: string) => {
    return useQuery({
      queryKey: ['gradingSystem', id],
      queryFn: () => fetchGradingSystem(id),
      enabled: !!id
    });
  };

  // Create a new grading system
  const createGradingSystemMutation = useMutation({
    mutationFn: (newSystem: Omit<GradingSystem, 'id' | 'created_at' | 'updated_at'>) => 
      createGradingSystem(newSystem),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['gradingSystems'] });
      queryClient.invalidateQueries({ queryKey: ['gradingSystems', data.academic_year_id] });
      toast({
        title: "Grading System Created",
        description: "The grading system has been created successfully."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create grading system",
        variant: "destructive"
      });
    }
  });

  // Update a grading system
  const updateGradingSystemMutation = useMutation({
    mutationFn: ({ id, system }: { id: string, system: Partial<GradingSystem> }) => 
      updateGradingSystem(id, system),
    onSuccess: (data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['gradingSystems'] });
      queryClient.invalidateQueries({ queryKey: ['gradingSystem', id] });
      queryClient.invalidateQueries({ queryKey: ['gradingSystems', data.academic_year_id] });
      toast({
        title: "Grading System Updated",
        description: "The grading system has been updated successfully."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update grading system",
        variant: "destructive"
      });
    }
  });

  // Delete a grading system
  const deleteGradingSystemMutation = useMutation({
    mutationFn: (id: string) => deleteGradingSystem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gradingSystems'] });
      toast({
        title: "Grading System Deleted",
        description: "The grading system has been deleted successfully."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete grading system",
        variant: "destructive"
      });
    }
  });

  return {
    systems: gradingSystemsQuery.data || [],
    isLoading: gradingSystemsQuery.isLoading,
    error: gradingSystemsQuery.error,
    getGradingSystem,
    createGradingSystem: createGradingSystemMutation.mutate,
    updateGradingSystem: updateGradingSystemMutation.mutate,
    deleteGradingSystem: deleteGradingSystemMutation.mutate,
    isCreating: createGradingSystemMutation.isPending,
    isUpdating: updateGradingSystemMutation.isPending,
    isDeleting: deleteGradingSystemMutation.isPending
  };
}

export function useGradeScales(gradingSystemId: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch grade scales for a grading system
  const scalesQuery = useQuery({
    queryKey: ['gradeScales', gradingSystemId],
    queryFn: () => fetchGradeScales(gradingSystemId),
    enabled: !!gradingSystemId
  });

  // Create a new grade scale
  const createScaleMutation = useMutation({
    mutationFn: (newScale: Omit<GradeScale, 'id' | 'created_at' | 'updated_at'>) => 
      createGradeScale(newScale),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['gradeScales', variables.grading_system_id] });
      toast({
        title: "Grade Scale Created",
        description: "The grade scale has been created successfully."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create grade scale",
        variant: "destructive"
      });
    }
  });

  // Update a grade scale
  const updateScaleMutation = useMutation({
    mutationFn: ({ id, scale }: { id: string, scale: Partial<GradeScale> }) => 
      updateGradeScale(id, scale),
    onSuccess: (_, { scale }) => {
      if (scale.grading_system_id) {
        queryClient.invalidateQueries({ queryKey: ['gradeScales', scale.grading_system_id] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['gradeScales', gradingSystemId] });
      }
      toast({
        title: "Grade Scale Updated",
        description: "The grade scale has been updated successfully."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update grade scale",
        variant: "destructive"
      });
    }
  });

  // Delete a grade scale
  const deleteScaleMutation = useMutation({
    mutationFn: (id: string) => deleteGradeScale(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gradeScales', gradingSystemId] });
      toast({
        title: "Grade Scale Deleted",
        description: "The grade scale has been deleted successfully."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete grade scale",
        variant: "destructive"
      });
    }
  });

  return {
    scales: scalesQuery.data || [],
    isLoading: scalesQuery.isLoading,
    error: scalesQuery.error,
    createScale: createScaleMutation.mutate,
    updateScale: updateScaleMutation.mutate,
    deleteScale: deleteScaleMutation.mutate,
    isCreating: createScaleMutation.isPending,
    isUpdating: updateScaleMutation.isPending,
    isDeleting: deleteScaleMutation.isPending
  };
}
