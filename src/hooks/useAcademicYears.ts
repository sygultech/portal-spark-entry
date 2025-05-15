
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { 
  fetchAcademicYears, 
  fetchAcademicYear, 
  createAcademicYear, 
  updateAcademicYear, 
  deleteAcademicYear,
  setActiveAcademicYear,
  archiveAcademicYear,
  cloneAcademicStructure
} from '@/services/academicYearService';
import type { AcademicYear, CloneStructureOptions } from '@/types/academic';

export function useAcademicYears() {
  const { toast } = useToast();
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  
  const schoolId = profile?.school_id;

  // Fetch all academic years
  const academicYearsQuery = useQuery({
    queryKey: ['academicYears', schoolId],
    queryFn: () => fetchAcademicYears(schoolId),
    enabled: !!schoolId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch a single academic year
  const getAcademicYear = (id: string) => {
    return useQuery({
      queryKey: ['academicYear', id],
      queryFn: () => fetchAcademicYear(id),
      enabled: !!id
    });
  };

  // Create a new academic year
  const createAcademicYearMutation = useMutation({
    mutationFn: (newAcademicYear: Omit<AcademicYear, 'id' | 'created_at' | 'updated_at'>) => 
      createAcademicYear(newAcademicYear),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academicYears', schoolId] });
      toast({
        title: "Academic Year Created",
        description: "The academic year has been created successfully."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create academic year",
        variant: "destructive"
      });
    }
  });

  // Update an academic year
  const updateAcademicYearMutation = useMutation({
    mutationFn: ({ id, academicYear }: { id: string, academicYear: Partial<AcademicYear> }) => 
      updateAcademicYear(id, academicYear),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['academicYears', schoolId] });
      queryClient.invalidateQueries({ queryKey: ['academicYear', id] });
      toast({
        title: "Academic Year Updated",
        description: "The academic year has been updated successfully."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update academic year",
        variant: "destructive"
      });
    }
  });

  // Delete an academic year
  const deleteAcademicYearMutation = useMutation({
    mutationFn: (id: string) => deleteAcademicYear(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academicYears', schoolId] });
      toast({
        title: "Academic Year Deleted",
        description: "The academic year has been deleted successfully."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete academic year",
        variant: "destructive"
      });
    }
  });

  // Set active academic year
  const setActiveAcademicYearMutation = useMutation({
    mutationFn: (id: string) => {
      if (!schoolId) throw new Error("School ID is required");
      return setActiveAcademicYear(id, schoolId);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['academicYears', schoolId] });
      // Update the context after setting active
      if (data) {
        toast({
          title: "Academic Year Activated",
          description: `"${data.name}" has been set as the active academic year.`
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to set active academic year",
        variant: "destructive"
      });
    }
  });

  // Archive an academic year
  const archiveAcademicYearMutation = useMutation({
    mutationFn: (id: string) => archiveAcademicYear(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['academicYears', schoolId] });
      
      if (data) {
        toast({
          title: "Academic Year Archived",
          description: `"${data.name}" has been archived successfully.`
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to archive academic year",
        variant: "destructive"
      });
    }
  });

  // Clone academic structure
  const cloneStructureMutation = useMutation({
    mutationFn: (options: CloneStructureOptions) => cloneAcademicStructure(options),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['academicYears', schoolId] });
      // Invalidate other potentially affected queries
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      queryClient.invalidateQueries({ queryKey: ['gradingSystems'] });
      queryClient.invalidateQueries({ queryKey: ['electiveGroups'] });
      
      toast({
        title: "Academic Structure Cloned",
        description: `Successfully cloned academic structure with ${data.courses_cloned} courses, ${data.batches_cloned} batches, ${data.subjects_cloned} subjects, ${data.grading_systems_cloned} grading systems, and ${data.elective_groups_cloned} elective groups.`
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to clone academic structure",
        variant: "destructive"
      });
    }
  });

  return {
    academicYears: academicYearsQuery.data || [],
    isLoading: academicYearsQuery.isLoading,
    error: academicYearsQuery.error,
    getAcademicYear,
    createAcademicYear: createAcademicYearMutation.mutate,
    updateAcademicYear: updateAcademicYearMutation.mutate,
    deleteAcademicYear: deleteAcademicYearMutation.mutate,
    setActiveAcademicYear: setActiveAcademicYearMutation.mutate,
    archiveAcademicYear: archiveAcademicYearMutation.mutate,
    cloneStructure: cloneStructureMutation.mutate,
    isCreating: createAcademicYearMutation.isPending,
    isUpdating: updateAcademicYearMutation.isPending,
    isDeleting: deleteAcademicYearMutation.isPending,
    isActivating: setActiveAcademicYearMutation.isPending,
    isArchiving: archiveAcademicYearMutation.isPending,
    isCloning: cloneStructureMutation.isPending,
    refetch: academicYearsQuery.refetch
  };
}
