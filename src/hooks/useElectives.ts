
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { 
  fetchElectiveGroups,
  fetchElectiveGroup,
  createElectiveGroup,
  updateElectiveGroup,
  deleteElectiveGroup,
  fetchElectiveSubjects,
  addSubjectToElectiveGroup,
  updateElectiveSubject,
  removeSubjectFromElectiveGroup
} from '@/services/electiveService';
import type { ElectiveGroup, ElectiveSubject } from '@/types/academic';

export function useElectiveGroups(academicYearId?: string, courseId?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch all elective groups
  const groupsQuery = useQuery({
    queryKey: ['electiveGroups', academicYearId, courseId],
    queryFn: () => fetchElectiveGroups(academicYearId, courseId),
    enabled: (!!(academicYearId || courseId))
  });

  // Fetch a single elective group
  const getElectiveGroup = (id: string) => {
    return useQuery({
      queryKey: ['electiveGroup', id],
      queryFn: () => fetchElectiveGroup(id),
      enabled: !!id
    });
  };

  // Create a new elective group
  const createElectiveGroupMutation = useMutation({
    mutationFn: (newGroup: Omit<ElectiveGroup, 'id' | 'created_at' | 'updated_at'>) => 
      createElectiveGroup(newGroup),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['electiveGroups'] });
      queryClient.invalidateQueries({ queryKey: ['electiveGroups', data.academic_year_id] });
      queryClient.invalidateQueries({ queryKey: ['electiveGroups', undefined, data.course_id] });
      toast({
        title: "Elective Group Created",
        description: "The elective group has been created successfully."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create elective group",
        variant: "destructive"
      });
    }
  });

  // Update an elective group
  const updateElectiveGroupMutation = useMutation({
    mutationFn: ({ id, group }: { id: string, group: Partial<ElectiveGroup> }) => 
      updateElectiveGroup(id, group),
    onSuccess: (data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['electiveGroups'] });
      queryClient.invalidateQueries({ queryKey: ['electiveGroup', id] });
      queryClient.invalidateQueries({ queryKey: ['electiveGroups', data.academic_year_id] });
      queryClient.invalidateQueries({ queryKey: ['electiveGroups', undefined, data.course_id] });
      toast({
        title: "Elective Group Updated",
        description: "The elective group has been updated successfully."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update elective group",
        variant: "destructive"
      });
    }
  });

  // Delete an elective group
  const deleteElectiveGroupMutation = useMutation({
    mutationFn: (id: string) => deleteElectiveGroup(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['electiveGroups'] });
      toast({
        title: "Elective Group Deleted",
        description: "The elective group has been deleted successfully."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete elective group",
        variant: "destructive"
      });
    }
  });

  return {
    groups: groupsQuery.data || [],
    isLoading: groupsQuery.isLoading,
    error: groupsQuery.error,
    getElectiveGroup,
    createElectiveGroup: createElectiveGroupMutation.mutate,
    updateElectiveGroup: updateElectiveGroupMutation.mutate,
    deleteElectiveGroup: deleteElectiveGroupMutation.mutate,
    isCreating: createElectiveGroupMutation.isPending,
    isUpdating: updateElectiveGroupMutation.isPending,
    isDeleting: deleteElectiveGroupMutation.isPending
  };
}

export function useElectiveSubjects(electiveGroupId: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch subjects for an elective group
  const subjectsQuery = useQuery({
    queryKey: ['electiveSubjects', electiveGroupId],
    queryFn: () => fetchElectiveSubjects(electiveGroupId),
    enabled: !!electiveGroupId
  });

  // Add a subject to an elective group
  const addSubjectMutation = useMutation({
    mutationFn: (newElectiveSubject: Omit<ElectiveSubject, 'id' | 'created_at' | 'updated_at'>) => 
      addSubjectToElectiveGroup(newElectiveSubject),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['electiveSubjects', variables.elective_group_id] });
      toast({
        title: "Subject Added",
        description: "The subject has been added to the elective group."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add subject to the elective group",
        variant: "destructive"
      });
    }
  });

  // Update an elective subject
  const updateElectiveSubjectMutation = useMutation({
    mutationFn: ({ id, electiveSubject }: { id: string, electiveSubject: Partial<ElectiveSubject> }) => 
      updateElectiveSubject(id, electiveSubject),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['electiveSubjects', electiveGroupId] });
      toast({
        title: "Elective Subject Updated",
        description: "The elective subject has been updated successfully."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update elective subject",
        variant: "destructive"
      });
    }
  });

  // Remove a subject from an elective group
  const removeSubjectMutation = useMutation({
    mutationFn: (id: string) => removeSubjectFromElectiveGroup(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['electiveSubjects', electiveGroupId] });
      toast({
        title: "Subject Removed",
        description: "The subject has been removed from the elective group."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove subject from the elective group",
        variant: "destructive"
      });
    }
  });

  return {
    subjects: subjectsQuery.data || [],
    isLoading: subjectsQuery.isLoading,
    error: subjectsQuery.error,
    addSubject: addSubjectMutation.mutate,
    updateElectiveSubject: updateElectiveSubjectMutation.mutate,
    removeSubject: removeSubjectMutation.mutate,
    isAdding: addSubjectMutation.isPending,
    isUpdating: updateElectiveSubjectMutation.isPending,
    isRemoving: removeSubjectMutation.isPending
  };
}
