
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface SchoolSettings {
  id: string;
  name: string;
  domain?: string;
  contact_number?: string;
  region?: string;
  status?: string;
  admin_email?: string;
  timezone?: string;
  plan?: string;
  storage_limit?: number;
  user_limit?: number;
  modules?: any;
  default_grading_system_id?: string;
  created_at: string;
  updated_at: string;
}

export function useSchoolSettings(schoolId?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  
  // Ensure we have a schoolId
  const effectiveSchoolId = schoolId || profile?.school_id;
  
  // Fetch school
  const schoolQuery = useQuery({
    queryKey: ['school', effectiveSchoolId],
    queryFn: async () => {
      if (!effectiveSchoolId) throw new Error("School ID is required");
      
      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .eq('id', effectiveSchoolId)
        .maybeSingle();
        
      if (error) throw error;
      return data as SchoolSettings;
    },
    enabled: !!effectiveSchoolId
  });

  // Update school settings
  const updateSchoolMutation = useMutation({
    mutationFn: async ({ id, settings }: { id: string, settings: Partial<SchoolSettings> }) => {
      const { data, error } = await supabase
        .from('schools')
        .update(settings)
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      return data as SchoolSettings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school', effectiveSchoolId] });
      toast({
        title: "Settings Updated",
        description: "School settings have been updated successfully."
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

  return {
    school: schoolQuery.data,
    isLoading: schoolQuery.isLoading,
    error: schoolQuery.error,
    updateSchool: updateSchoolMutation.mutate,
    isUpdating: updateSchoolMutation.isPending
  };
}

// force update

// force update
