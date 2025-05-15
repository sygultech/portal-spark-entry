import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface AcademicSettings {
  id: string;
  school_id: string;
  default_academic_year_id: string | null;
  enable_audit_log: boolean;
  student_self_enroll: boolean;
  teacher_edit_subjects: boolean;
  created_at: string;
  updated_at: string;
}

interface AuditLog {
  id: string;
  user_id: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  entity_type: string;
  entity_id: string;
  previous_data: any;
  new_data: any;
  school_id: string;
  created_at: string;
}

export function useAcademicSettings(schoolId?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  
  // Ensure we have a schoolId
  const effectiveSchoolId = schoolId || profile?.school_id;
  
  // Fetch academic settings
  const settingsQuery = useQuery({
    queryKey: ['academicSettings', effectiveSchoolId],
    queryFn: async () => {
      if (!effectiveSchoolId) throw new Error("School ID is required");
      
      const { data, error } = await supabase
        .from('academic_settings')
        .select('*')
        .eq('school_id', effectiveSchoolId)
        .maybeSingle();
        
      if (error) throw error;
      
      // If no settings exist yet for this school, return default settings
      if (!data) {
        return {
          id: '',
          school_id: effectiveSchoolId,
          default_academic_year_id: null,
          enable_audit_log: true,
          student_self_enroll: false,
          teacher_edit_subjects: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } as AcademicSettings;
      }
      
      return data as AcademicSettings;
    },
    enabled: !!effectiveSchoolId
  });

  // Create academic settings
  const createSettingsMutation = useMutation({
    mutationFn: async (settings: Omit<AcademicSettings, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('academic_settings')
        .insert(settings)
        .select()
        .single();
        
      if (error) throw error;
      return data as AcademicSettings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academicSettings', effectiveSchoolId] });
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
    mutationFn: async ({ id, settings }: { id: string, settings: Partial<AcademicSettings> }) => {
      const { data, error } = await supabase
        .from('academic_settings')
        .update(settings)
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      return data as AcademicSettings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academicSettings', effectiveSchoolId] });
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
    mutationFn: async ({ settingsId, academicYearId }: { settingsId: string, academicYearId: string }) => {
      // If settings don't exist yet, create them
      if (!settingsId) {
        const { data, error } = await supabase
          .from('academic_settings')
          .insert({
            school_id: effectiveSchoolId,
            default_academic_year_id: academicYearId
          })
          .select()
          .single();
          
        if (error) throw error;
        return data as AcademicSettings;
      }
      
      // Otherwise update existing settings
      const { data, error } = await supabase
        .from('academic_settings')
        .update({ default_academic_year_id: academicYearId })
        .eq('id', settingsId)
        .select()
        .single();
        
      if (error) throw error;
      return data as AcademicSettings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academicSettings', effectiveSchoolId] });
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
      queryKey: ['academicAuditLogs', effectiveSchoolId, filters],
      queryFn: async () => {
        if (!effectiveSchoolId) throw new Error("School ID is required");
        
        let query = supabase
          .from('academic_audit_logs')
          .select('*')
          .eq('school_id', effectiveSchoolId)
          .order('created_at', { ascending: false });
          
        // Apply filters if provided
        if (filters?.entityType) {
          query = query.eq('entity_type', filters.entityType);
        }
        
        if (filters?.userId) {
          query = query.eq('user_id', filters.userId);
        }
        
        if (filters?.startDate) {
          query = query.gte('created_at', filters.startDate);
        }
        
        if (filters?.endDate) {
          query = query.lte('created_at', filters.endDate);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        return data as AuditLog[];
      },
      enabled: !!effectiveSchoolId && !!settingsQuery.data?.enable_audit_log
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
