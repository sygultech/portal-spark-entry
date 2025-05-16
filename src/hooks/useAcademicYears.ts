
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface AcademicYear {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  is_locked: boolean;
  school_id: string;
  created_at: string;
  updated_at: string;
}

export function useAcademicYears() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const schoolId = profile?.school_id;
  
  // Fetch academic years
  const academicYearsQuery = useQuery({
    queryKey: ['academic-years', schoolId],
    queryFn: async () => {
      if (!schoolId) return [];
      
      const { data, error } = await supabase
        .from('academic_years')
        .select('*')
        .eq('school_id', schoolId)
        .order('start_date', { ascending: false });
        
      if (error) throw error;
      return data as AcademicYear[];
    },
    enabled: !!schoolId
  });

  // Create academic year
  const createMutation = useMutation({
    mutationFn: async (academicYear: Omit<AcademicYear, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('academic_years')
        .insert(academicYear)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-years', schoolId] });
      toast({
        title: "Success",
        description: "Academic year created successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create academic year",
        variant: "destructive"
      });
    }
  });
  
  // Update academic year
  const updateMutation = useMutation({
    mutationFn: async (academicYear: Partial<AcademicYear> & { id: string }) => {
      const { data, error } = await supabase
        .from('academic_years')
        .update(academicYear)
        .eq('id', academicYear.id)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-years', schoolId] });
      toast({
        title: "Success",
        description: "Academic year updated successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update academic year",
        variant: "destructive"
      });
    }
  });
  
  // Delete academic year
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('academic_years')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-years', schoolId] });
      toast({
        title: "Success",
        description: "Academic year deleted successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete academic year",
        variant: "destructive"
      });
    }
  });
  
  // Set current academic year
  const setCurrentMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!schoolId) throw new Error("School ID is required");
      
      // First, clear current status of all academic years
      const { error: clearError } = await supabase
        .from('academic_years')
        .update({ is_current: false })
        .eq('school_id', schoolId);
        
      if (clearError) throw clearError;
      
      // Then, set the selected year as current
      const { data, error: setError } = await supabase
        .from('academic_years')
        .update({ is_current: true })
        .eq('id', id)
        .select()
        .single();
        
      if (setError) throw setError;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-years', schoolId] });
      toast({
        title: "Success",
        description: "Current academic year updated successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to set current academic year",
        variant: "destructive"
      });
    }
  });

  // Toggle lock status of academic year
  const toggleLockMutation = useMutation({
    mutationFn: async ({ id, isLocked }: { id: string, isLocked: boolean }) => {
      const { data, error } = await supabase
        .from('academic_years')
        .update({ is_locked: isLocked })
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['academic-years', schoolId] });
      toast({
        title: "Success",
        description: `Academic year ${data.is_locked ? 'locked' : 'unlocked'} successfully`
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update lock status",
        variant: "destructive"
      });
    }
  });

  return {
    academicYears: academicYearsQuery.data || [],
    isLoading: academicYearsQuery.isLoading,
    error: academicYearsQuery.error,
    createAcademicYear: createMutation.mutate,
    updateAcademicYear: updateMutation.mutate,
    deleteAcademicYear: deleteMutation.mutate,
    setCurrentAcademicYear: setCurrentMutation.mutate,
    toggleLockStatus: toggleLockMutation.mutate
  };
}
