
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { 
  fetchAcademicSettings,
  updateAcademicSettings,
  setDefaultAcademicYear,
  fetchAcademicAuditLogs,
  createAcademicSettings
} from '@/services/academicSettingsService';

export function useAcademicSettings(schoolId?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch academic settings
  const settingsQuery = useQuery({
    queryKey: ['academicSettings', schoolId],
    queryFn: () => {
      if (!schoolId) throw new Error("School ID is required");
      return fetchAcademicSettings(schoolId);
    },
    enabled: !!schoolId
  });

  // Create academic settings
  const createSettingsMutation = useMutation({
    mutationFn: (settings: any) => 
      createAcademicSettings(schoolId!, settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academicSettings'] });
      toast({
        title: "Settings Created",
        description: "Academic settings have been created successfully."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create settings",
        variant: "destructive"
      });
    }
  });

  // Update academic settings
  const updateSettingsMutation = useMutation({
    mutationFn: ({ id, settings }: { id: string, settings: any }) => 
      updateAcademicSettings(id, settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academicSettings'] });
      toast({
        title: "Settings Updated",
        description: "Academic settings have been updated successfully."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update settings",
        variant: "destructive"
      });
    }
  });

  // Set default academic year
  const setDefaultYearMutation = useMutation({
    mutationFn: ({ settingsId, academicYearId }: { settingsId: string, academicYearId: string }) => 
      setDefaultAcademicYear(settingsId, academicYearId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academicSettings'] });
      toast({
        title: "Default Year Updated",
        description: "Default academic year has been set successfully."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to set default year",
        variant: "destructive"
      });
    }
  });

  // Fetch audit logs
  const useAuditLogs = (filters?: {
    entityType?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    return useQuery({
      queryKey: ['academicAuditLogs', schoolId, filters],
      queryFn: () => {
        if (!schoolId) throw new Error("School ID is required");
        return fetchAcademicAuditLogs(schoolId, filters);
      },
      enabled: !!schoolId
    });
  };

  return {
    settings: settingsQuery.data,
    isLoading: settingsQuery.isLoading,
    error: settingsQuery.error,
    createSettings: createSettingsMutation.mutate,
    updateSettings: updateSettingsMutation.mutate,
    setDefaultYear: setDefaultYearMutation.mutate,
    useAuditLogs,
    isUpdating: updateSettingsMutation.isPending || createSettingsMutation.isPending
  };
}
