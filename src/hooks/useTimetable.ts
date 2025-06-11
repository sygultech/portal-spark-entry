
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

// Legacy interfaces for backward compatibility
export interface TimeSlot {
  id: string;
  subject_teacher_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  room_number?: string;
  created_at: string;
  updated_at: string;
  subject?: {
    name: string;
    code: string;
  };
  teacher?: {
    first_name: string;
    last_name: string;
  };
}

export interface SubjectTeacher {
  id: string;
  subject_id: string;
  teacher_id: string;
  batch_id: string;
  academic_year_id: string;
  subject: {
    name: string;
    code: string;
  };
  teacher: {
    first_name: string;
    last_name: string;
  };
}

export const useTimetable = () => {
  const [isLoading, setIsLoading] = useState(false);

  // Fetch timetable for a batch using new structure
  const getBatchTimetable = async (batchId: string) => {
    setIsLoading(true);
    try {
      const { data: schedules, error } = await supabase
        .from('timetable_schedules')
        .select(`
          *,
          subject:subjects(name, code),
          teacher:profiles(first_name, last_name),
          room:rooms(name, code)
        `)
        .eq('batch_id', batchId)
        .eq('is_active', true);

      if (error) throw error;

      // Convert to legacy format for backward compatibility
      const timetable = schedules.map(schedule => ({
        id: schedule.id,
        subject_teacher_id: `${schedule.subject_id}-${schedule.teacher_id}`,
        day_of_week: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
          .indexOf(schedule.day_of_week.toLowerCase()),
        start_time: schedule.start_time,
        end_time: schedule.end_time,
        room_number: schedule.room?.name || schedule.room?.code,
        created_at: schedule.created_at,
        updated_at: schedule.updated_at,
        subject: schedule.subject,
        teacher: schedule.teacher
      }));

      return timetable;
    } catch (error: any) {
      toast({
        title: 'Error fetching timetable',
        description: error.message,
        variant: 'destructive'
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new time slot using new structure
  const createTimeSlot = async (data: Omit<TimeSlot, 'id' | 'created_at' | 'updated_at'>) => {
    setIsLoading(true);
    try {
      // This is now a legacy function - recommend using useTimetableSchedules instead
      console.warn('createTimeSlot is deprecated. Use useTimetableSchedules.createSchedule instead.');
      
      toast({
        title: 'Deprecated Function',
        description: 'Please use the new timetable schedule management',
        variant: 'destructive'
      });

      return null;
    } catch (error: any) {
      toast({
        title: 'Error creating time slot',
        description: error.message,
        variant: 'destructive'
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Update a time slot using new structure
  const updateTimeSlot = async (id: string, data: Partial<TimeSlot>) => {
    setIsLoading(true);
    try {
      console.warn('updateTimeSlot is deprecated. Use useTimetableSchedules.updateSchedule instead.');
      
      toast({
        title: 'Deprecated Function',
        description: 'Please use the new timetable schedule management',
        variant: 'destructive'
      });

      return null;
    } catch (error: any) {
      toast({
        title: 'Error updating time slot',
        description: error.message,
        variant: 'destructive'
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a time slot using new structure
  const deleteTimeSlot = async (id: string) => {
    setIsLoading(true);
    try {
      console.warn('deleteTimeSlot is deprecated. Use useTimetableSchedules.deleteSchedule instead.');
      
      toast({
        title: 'Deprecated Function',
        description: 'Please use the new timetable schedule management',
        variant: 'destructive'
      });

      return false;
    } catch (error: any) {
      toast({
        title: 'Error deleting time slot',
        description: error.message,
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Assign teacher to subject - still relevant
  const assignTeacherToSubject = async (data: Omit<SubjectTeacher, 'id' | 'created_at' | 'updated_at'>) => {
    setIsLoading(true);
    try {
      const { data: newAssignment, error } = await supabase
        .from('subject_teachers')
        .insert([data])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Teacher assigned successfully'
      });

      return newAssignment;
    } catch (error: any) {
      toast({
        title: 'Error assigning teacher',
        description: error.message,
        variant: 'destructive'
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    getBatchTimetable,
    createTimeSlot,
    updateTimeSlot,
    deleteTimeSlot,
    assignTeacherToSubject
  };
};
