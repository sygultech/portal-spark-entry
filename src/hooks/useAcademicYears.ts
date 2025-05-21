
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { AcademicYear } from '@/types/academic';
import { useToast } from '@/hooks/use-toast';

export function useAcademicYears() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const schoolId = profile?.school_id;

  const fetchAcademicYears = async (): Promise<AcademicYear[]> => {
    if (!schoolId) return [];
    
    const { data, error } = await supabase
      .from('academic_years')
      .select('*')
      .eq('school_id', schoolId)
      .order('start_date', { ascending: false });
    
    if (error) {
      console.error('Error fetching academic years:', error);
      throw error;
    }
    
    return data;
  };

  const academicYearsQuery = useQuery({
    queryKey: ['academic-years', schoolId],
    queryFn: fetchAcademicYears,
    enabled: !!schoolId
  });

  const createAcademicYearMutation = useMutation({
    mutationFn: async (year: Omit<AcademicYear, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('academic_years')
        .insert(year)
        .select()
        .single();
      
      if (error) {
        console.error('Error creating academic year:', error);
        toast({
          title: "Error",
          description: `Failed to create academic year: ${error.message}`,
          variant: "destructive"
        });
        throw error;
      }
      
      toast({
        title: "Success",
        description: "Academic year created successfully"
      });
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-years', schoolId] });
    }
  });

  const updateAcademicYearMutation = useMutation({
    mutationFn: async (year: Partial<AcademicYear> & { id: string }) => {
      const { data, error } = await supabase
        .from('academic_years')
        .update({
          ...year,
          updated_at: new Date().toISOString()
        })
        .eq('id', year.id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating academic year:', error);
        toast({
          title: "Error",
          description: `Failed to update academic year: ${error.message}`,
          variant: "destructive"
        });
        throw error;
      }
      
      toast({
        title: "Success",
        description: "Academic year updated successfully"
      });
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-years', schoolId] });
    }
  });

  const deleteAcademicYearMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('academic_years')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting academic year:', error);
        toast({
          title: "Error",
          description: `Failed to delete academic year: ${error.message}`,
          variant: "destructive"
        });
        throw error;
      }
      
      toast({
        title: "Success",
        description: "Academic year deleted successfully"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-years', schoolId] });
    }
  });

  const setCurrentAcademicYearMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('academic_years')
        .update({ is_current: true, updated_at: new Date().toISOString() })
        .eq('id', id);
      
      if (error) {
        console.error('Error setting current academic year:', error);
        toast({
          title: "Error",
          description: `Failed to set current academic year: ${error.message}`,
          variant: "destructive"
        });
        throw error;
      }
      
      toast({
        title: "Success",
        description: "Current academic year updated successfully"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-years', schoolId] });
    }
  });

  const toggleLockStatusMutation = useMutation({
    mutationFn: async ({ id, isLocked }: { id: string; isLocked: boolean }) => {
      const { error } = await supabase
        .from('academic_years')
        .update({ 
          is_locked: isLocked,
          updated_at: new Date().toISOString() 
        })
        .eq('id', id);
      
      if (error) {
        console.error('Error toggling lock status:', error);
        toast({
          title: "Error",
          description: `Failed to update lock status: ${error.message}`,
          variant: "destructive"
        });
        throw error;
      }
      
      toast({
        title: "Success",
        description: `Academic year ${isLocked ? 'locked' : 'unlocked'} successfully`
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-years', schoolId] });
    }
  });

  return {
    academicYears: academicYearsQuery.data || [],
    isLoading: academicYearsQuery.isLoading,
    error: academicYearsQuery.error,
    createAcademicYear: createAcademicYearMutation.mutate,
    updateAcademicYear: updateAcademicYearMutation.mutate,
    deleteAcademicYear: deleteAcademicYearMutation.mutate,
    setCurrentAcademicYear: setCurrentAcademicYearMutation.mutate,
    toggleLockStatus: toggleLockStatusMutation.mutate
  };
}

// force update

// force update
