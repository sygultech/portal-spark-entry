
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export interface SpecialClass {
  id: string;
  school_id: string;
  title: string;
  description?: string;
  class_type: 'exam' | 'event' | 'assembly' | 'sports' | 'extra_curricular' | 'makeup' | 'guest_lecture';
  batch_ids: string[];
  teacher_id?: string;
  room_id?: string;
  date: string;
  start_time: string;
  end_time: string;
  is_recurring: boolean;
  recurrence_pattern?: any;
  recurrence_end_date?: string;
  replaces_regular_class: boolean;
  replaced_schedule_ids?: string[];
  status: 'scheduled' | 'completed' | 'cancelled';
  created_by: string;
  created_at: string;
  updated_at: string;
  
  // Relations
  teacher?: {
    first_name: string;
    last_name: string;
  };
  room?: {
    name: string;
    code: string;
  };
  created_by_user?: {
    first_name: string;
    last_name: string;
  };
}

export interface CreateSpecialClassData {
  school_id: string;
  title: string;
  description?: string;
  class_type: SpecialClass['class_type'];
  batch_ids: string[];
  teacher_id?: string;
  room_id?: string;
  date: string;
  start_time: string;
  end_time: string;
  is_recurring?: boolean;
  recurrence_pattern?: any;
  recurrence_end_date?: string;
  replaces_regular_class?: boolean;
  replaced_schedule_ids?: string[];
}

export const useSpecialClasses = (schoolId: string) => {
  const [specialClasses, setSpecialClasses] = useState<SpecialClass[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSpecialClasses = useCallback(async (dateRange?: { from: string; to: string }) => {
    if (!schoolId) return;
    
    setIsLoading(true);
    try {
      let query = supabase
        .from('special_classes')
        .select(`
          *,
          teacher:profiles!special_classes_teacher_id_fkey(first_name, last_name),
          room:rooms(name, code),
          created_by_user:profiles!special_classes_created_by_fkey(first_name, last_name)
        `)
        .eq('school_id', schoolId);

      if (dateRange) {
        query = query
          .gte('date', dateRange.from)
          .lte('date', dateRange.to);
      }

      const { data, error } = await query.order('date').order('start_time');

      if (error) throw error;
      setSpecialClasses(data || []);
    } catch (error: any) {
      console.error('Error fetching special classes:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch special classes',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [schoolId]);

  const createSpecialClass = useCallback(async (classData: CreateSpecialClassData) => {
    try {
      const { data, error } = await supabase
        .from('special_classes')
        .insert([{
          ...classData,
          created_by: (await supabase.auth.getUser()).data.user?.id || '',
          status: 'scheduled'
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Special class created successfully'
      });

      await fetchSpecialClasses();
      return data;
    } catch (error: any) {
      console.error('Error creating special class:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create special class',
        variant: 'destructive'
      });
      return null;
    }
  }, [fetchSpecialClasses]);

  const updateSpecialClass = useCallback(async (id: string, updates: Partial<CreateSpecialClassData>) => {
    try {
      const { data, error } = await supabase
        .from('special_classes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Special class updated successfully'
      });

      await fetchSpecialClasses();
      return data;
    } catch (error: any) {
      console.error('Error updating special class:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update special class',
        variant: 'destructive'
      });
      return null;
    }
  }, [fetchSpecialClasses]);

  const cancelSpecialClass = useCallback(async (id: string, reason?: string) => {
    try {
      const { error } = await supabase
        .from('special_classes')
        .update({ 
          status: 'cancelled',
          description: reason ? `Cancelled: ${reason}` : 'Cancelled'
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Special class cancelled successfully'
      });

      await fetchSpecialClasses();
      return true;
    } catch (error: any) {
      console.error('Error cancelling special class:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to cancel special class',
        variant: 'destructive'
      });
      return false;
    }
  }, [fetchSpecialClasses]);

  const getSpecialClassesForDate = useCallback((date: string) => {
    return specialClasses.filter(sc => sc.date === date);
  }, [specialClasses]);

  const getSpecialClassesForBatch = useCallback((batchId: string) => {
    return specialClasses.filter(sc => sc.batch_ids.includes(batchId));
  }, [specialClasses]);

  return {
    specialClasses,
    isLoading,
    fetchSpecialClasses,
    createSpecialClass,
    updateSpecialClass,
    cancelSpecialClass,
    getSpecialClassesForDate,
    getSpecialClassesForBatch
  };
};
