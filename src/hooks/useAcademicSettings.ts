
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

// Mock data for academic settings
const mockAcademicSettings = {
  id: '1',
  school_id: '1',
  default_academic_year_id: '1',
  enable_audit_log: true,
  student_self_enroll: false,
  teacher_edit_subjects: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

// Mock data for audit logs
const mockAuditLogs = [
  {
    id: '1',
    user_id: '1',
    action: 'CREATE',
    entity_type: 'academic_years',
    entity_id: '1',
    previous_data: null,
    new_data: { name: 'Academic Year 2024-2025' },
    school_id: '1',
    created_at: new Date().toISOString()
  }
];

export function useAcademicSettings(schoolId?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch academic settings
  const settingsQuery = useQuery({
    queryKey: ['academicSettings', schoolId],
    queryFn: () => {
      if (!schoolId) throw new Error("School ID is required");
      console.log('Mocked fetchAcademicSettings called with schoolId:', schoolId);
      return Promise.resolve(mockAcademicSettings);
    },
    enabled: !!schoolId
  });

  // Create academic settings
  const createSettingsMutation = useMutation({
    mutationFn: (settings: any) => {
      console.log('Mocked createAcademicSettings called with:', settings);
      return Promise.resolve({
        ...mockAcademicSettings,
        ...settings
      });
    },
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
    mutationFn: ({ id, settings }: { id: string, settings: any }) => {
      console.log('Mocked updateAcademicSettings called with id:', id, 'and settings:', settings);
      return Promise.resolve({
        ...mockAcademicSettings,
        ...settings,
        updated_at: new Date().toISOString()
      });
    },
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
    mutationFn: ({ settingsId, academicYearId }: { settingsId: string, academicYearId: string }) => {
      console.log('Mocked setDefaultAcademicYear called with settingsId:', settingsId, 'and academicYearId:', academicYearId);
      return Promise.resolve({
        ...mockAcademicSettings,
        default_academic_year_id: academicYearId,
        updated_at: new Date().toISOString()
      });
    },
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
        console.log('Mocked fetchAcademicAuditLogs called with schoolId:', schoolId, 'and filters:', filters);
        return Promise.resolve(mockAuditLogs);
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
