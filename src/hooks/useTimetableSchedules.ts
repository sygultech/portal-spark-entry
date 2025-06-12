
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
    if (!schoolId) {
      console.log('No schoolId provided for fetchSchedules');
      return;
    }
    
    setIsLoading(true);
    try {
      console.log('Fetching schedules with params:', { 
        schoolId, 
        academicYearId, 
        batchId 
      });

      let query = supabase
        .from('timetable_schedules')
        .select(`
          *,
          subject:subjects(name, code),
          teacher:staff_details!timetable_schedules_teacher_id_fkey(first_name, last_name),
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

      if (error) {
        console.error('Error fetching timetable schedules:', error);
        throw error;
      }
      
      console.log('Fetched schedules data:', data);
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
      console.log('Creating schedule with data:', scheduleData);

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
        .select(`
          *,
          subject:subjects(name, code),
          teacher:staff_details!timetable_schedules_teacher_id_fkey(first_name, last_name),
          batch:batches(name),
          room:rooms(name, code)
        `)
        .single();

      if (error) {
        console.error('Error creating schedule:', error);
        throw error;
      }

      console.log('Created schedule:', data);

      toast({
        title: 'Success',
        description: 'Schedule created successfully'
      });

      // Immediately update the local state with the new schedule
      setSchedules(prev => [...prev, data]);
      
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
  }, []);

  const updateSchedule = useCallback(async (id: string, updates: Partial<CreateScheduleData>) => {
    try {
      const { data, error } = await supabase
        .from('timetable_schedules')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          subject:subjects(name, code),
          teacher:staff_details!timetable_schedules_teacher_id_fkey(first_name, last_name),
          batch:batches(name),
          room:rooms(name, code)
        `)
        .single();

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Schedule updated successfully'
      });

      // Update the local state
      setSchedules(prev => prev.map(schedule => 
        schedule.id === id ? data : schedule
      ));
      
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
  }, []);

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

      // Update the local state
      setSchedules(prev => prev.filter(schedule => schedule.id !== id));
      
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
  }, []);

  const getScheduleByBatchAndDay = useCallback((batchId: string, dayOfWeek: string) => {
    const filteredSchedules = schedules.filter(
      schedule => 
        schedule.batch_id === batchId && 
        schedule.day_of_week.toLowerCase() === dayOfWeek.toLowerCase()
    );
    
    console.log('getScheduleByBatchAndDay:', {
      batchId,
      dayOfWeek,
      allSchedules: schedules,
      filteredSchedules
    });
    
    return filteredSchedules.sort((a, b) => a.period_number - b.period_number);
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
