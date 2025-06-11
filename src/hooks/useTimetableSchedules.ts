
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export interface TimetableSchedule {
  id: string;
  school_id: string;
  academic_year_id: string;
  batch_id: string;
  subject_id: string;
  teacher_id: string;
  room_id?: string;
  day_of_week: string;
  period_number: number;
  start_time: string;
  end_time: string;
  valid_from: string;
  valid_to?: string;
  fortnight_week?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  
  // Relations
  subject?: {
    name: string;
    code: string;
  };
  teacher?: {
    first_name: string;
    last_name: string;
  };
  batch?: {
    name: string;
  };
  room?: {
    name: string;
    code: string;
  };
}

export interface CreateScheduleData {
  school_id: string;
  academic_year_id: string;
  batch_id: string;
  subject_id: string;
  teacher_id: string;
  room_id?: string;
  day_of_week: string;
  period_number: number;
  start_time: string;
  end_time: string;
  valid_from: string;
  valid_to?: string;
  fortnight_week?: number;
}

export const useTimetableSchedules = (schoolId: string, academicYearId?: string) => {
  const [schedules, setSchedules] = useState<TimetableSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSchedules = useCallback(async (batchId?: string) => {
    if (!schoolId) return;
    
    setIsLoading(true);
    try {
      let query = supabase
        .from('timetable_schedules')
        .select(`
          *,
          subject:subjects(name, code),
          teacher:profiles(first_name, last_name),
          batch:batches(name),
          room:rooms(name, code)
        `)
        .eq('school_id', schoolId)
        .eq('is_active', true);

      if (academicYearId) {
        query = query.eq('academic_year_id', academicYearId);
      }

      if (batchId) {
        query = query.eq('batch_id', batchId);
      }

      const { data, error } = await query.order('day_of_week').order('period_number');

      if (error) throw error;
      setSchedules(data || []);
    } catch (error: any) {
      console.error('Error fetching timetable schedules:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch timetable schedules',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [schoolId, academicYearId]);

  const createSchedule = useCallback(async (scheduleData: CreateScheduleData) => {
    try {
      // Check for conflicts first
      const { data: conflicts, error: conflictError } = await supabase
        .from('timetable_schedules')
        .select('id')
        .eq('school_id', scheduleData.school_id)
        .eq('batch_id', scheduleData.batch_id)
        .eq('day_of_week', scheduleData.day_of_week)
        .eq('period_number', scheduleData.period_number)
        .eq('is_active', true)
        .gte('valid_to', scheduleData.valid_from)
        .lte('valid_from', scheduleData.valid_to || '2099-12-31');

      if (conflictError) throw conflictError;

      if (conflicts && conflicts.length > 0) {
        toast({
          title: 'Scheduling Conflict',
          description: 'This time slot is already occupied for this batch',
          variant: 'destructive'
        });
        return null;
      }

      const { data, error } = await supabase
        .from('timetable_schedules')
        .insert([scheduleData])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Schedule created successfully'
      });

      await fetchSchedules();
      return data;
    } catch (error: any) {
      console.error('Error creating schedule:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create schedule',
        variant: 'destructive'
      });
      return null;
    }
  }, [fetchSchedules]);

  const updateSchedule = useCallback(async (id: string, updates: Partial<CreateScheduleData>) => {
    try {
      const { data, error } = await supabase
        .from('timetable_schedules')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Schedule updated successfully'
      });

      await fetchSchedules();
      return data;
    } catch (error: any) {
      console.error('Error updating schedule:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update schedule',
        variant: 'destructive'
      });
      return null;
    }
  }, [fetchSchedules]);

  const deleteSchedule = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('timetable_schedules')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Schedule deleted successfully'
      });

      await fetchSchedules();
      return true;
    } catch (error: any) {
      console.error('Error deleting schedule:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete schedule',
        variant: 'destructive'
      });
      return false;
    }
  }, [fetchSchedules]);

  const getScheduleByBatchAndDay = useCallback((batchId: string, dayOfWeek: string) => {
    return schedules.filter(
      schedule => 
        schedule.batch_id === batchId && 
        schedule.day_of_week === dayOfWeek
    ).sort((a, b) => a.period_number - b.period_number);
  }, [schedules]);

  const getTeacherSchedule = useCallback((teacherId: string, dayOfWeek?: string) => {
    let filtered = schedules.filter(schedule => schedule.teacher_id === teacherId);
    if (dayOfWeek) {
      filtered = filtered.filter(schedule => schedule.day_of_week === dayOfWeek);
    }
    return filtered.sort((a, b) => a.period_number - b.period_number);
  }, [schedules]);

  const getRoomSchedule = useCallback((roomId: string, dayOfWeek?: string) => {
    let filtered = schedules.filter(schedule => schedule.room_id === roomId);
    if (dayOfWeek) {
      filtered = filtered.filter(schedule => schedule.day_of_week === dayOfWeek);
    }
    return filtered.sort((a, b) => a.period_number - b.period_number);
  }, [schedules]);

  return {
    schedules,
    isLoading,
    fetchSchedules,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    getScheduleByBatchAndDay,
    getTeacherSchedule,
    getRoomSchedule
  };
};
