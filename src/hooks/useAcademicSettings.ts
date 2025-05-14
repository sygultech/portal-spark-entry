
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { 
  fetchAcademicSettings,
  createAcademicSettings,
  updateAcademicSettings,
  fetchAcademicAuditLogs
} from '@/services/academicSettingsService';
import type { AcademicSettings } from '@/types/academic';

export function useAcademicSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  
  const schoolId = profile?.school_id;
  
  // Fetch academic settings for the current school
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
    mutationFn: (newSettings: Omit<AcademicSettings, 'id' | 'created_at' | 'updated_at'>) => 
      createAcademicSettings(newSettings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academicSettings', schoolId] });
      toast({
        title: "Settings Created",
        description: "The academic settings have been created successfully."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create academic settings",
        variant: "destructive"
      });
    }
  });

  // Update academic settings
  const updateSettingsMutation = useMutation({
    mutationFn: ({ id, settings }: { id: string, settings: Partial<AcademicSettings> }) => 
      updateAcademicSettings(id, settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academicSettings', schoolId] });
      toast({
        title: "Settings Updated",
        description: "The academic settings have been updated successfully."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update academic settings",
        variant: "destructive"
      });
    }
  });

  // Fetch audit logs
  const getAuditLogs = (entityType?: string, entityId?: string, limit = 50, offset = 0) => {
    return useQuery({
      queryKey: ['academicAuditLogs', schoolId, entityType, entityId, limit, offset],
      queryFn: () => {
        if (!schoolId) throw new Error("School ID is required");
        return fetchAcademicAuditLogs(schoolId, entityType, entityId, limit, offset);
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
    getAuditLogs,
    isCreating: createSettingsMutation.isPending,
    isUpdating: updateSettingsMutation.isPending
  };
}
