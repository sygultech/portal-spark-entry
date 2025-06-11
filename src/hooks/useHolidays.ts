
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export interface Holiday {
  id: string;
  school_id: string;
  name: string;
  description?: string;
  date: string;
  holiday_type: 'national' | 'school' | 'religious' | 'exam' | 'vacation';
  affects_batches?: string[];
  is_recurring: boolean;
  recurrence_pattern?: any;
  created_at: string;
  updated_at: string;
}

export interface CreateHolidayData {
  school_id: string;
  name: string;
  description?: string;
  date: string;
  holiday_type: Holiday['holiday_type'];
  affects_batches?: string[];
  is_recurring?: boolean;
  recurrence_pattern?: any;
}

export const useHolidays = (schoolId: string) => {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchHolidays = useCallback(async (year?: number) => {
    if (!schoolId) return;
    
    setIsLoading(true);
    try {
      let query = supabase
        .from('holidays')
        .select('*')
        .eq('school_id', schoolId);

      if (year) {
        const startDate = `${year}-01-01`;
        const endDate = `${year}-12-31`;
        query = query.gte('date', startDate).lte('date', endDate);
      }

      const { data, error } = await query.order('date');

      if (error) throw error;
      setHolidays(data || []);
    } catch (error: any) {
      console.error('Error fetching holidays:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch holidays',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [schoolId]);

  const createHoliday = useCallback(async (holidayData: CreateHolidayData) => {
    try {
      const { data, error } = await supabase
        .from('holidays')
        .insert([holidayData])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Holiday created successfully'
      });

      await fetchHolidays();
      return data;
    } catch (error: any) {
      console.error('Error creating holiday:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create holiday',
        variant: 'destructive'
      });
      return null;
    }
  }, [fetchHolidays]);

  const updateHoliday = useCallback(async (id: string, updates: Partial<CreateHolidayData>) => {
    try {
      const { data, error } = await supabase
        .from('holidays')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Holiday updated successfully'
      });

      await fetchHolidays();
      return data;
    } catch (error: any) {
      console.error('Error updating holiday:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update holiday',
        variant: 'destructive'
      });
      return null;
    }
  }, [fetchHolidays]);

  const deleteHoliday = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('holidays')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Holiday deleted successfully'
      });

      await fetchHolidays();
      return true;
    } catch (error: any) {
      console.error('Error deleting holiday:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete holiday',
        variant: 'destructive'
      });
      return false;
    }
  }, [fetchHolidays]);

  const getHolidaysForDate = useCallback((date: string) => {
    return holidays.filter(holiday => holiday.date === date);
  }, [holidays]);

  const isHoliday = useCallback((date: string, batchId?: string) => {
    return holidays.some(holiday => {
      if (holiday.date !== date) return false;
      if (!holiday.affects_batches) return true; // Affects all batches
      if (batchId && holiday.affects_batches.includes(batchId)) return true;
      return false;
    });
  }, [holidays]);

  return {
    holidays,
    isLoading,
    fetchHolidays,
    createHoliday,
    updateHoliday,
    deleteHoliday,
    getHolidaysForDate,
    isHoliday
  };
};
