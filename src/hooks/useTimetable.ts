import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

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

  // Fetch timetable for a batch
  const getBatchTimetable = async (batchId: string) => {
    setIsLoading(true);
    try {
      const { data: subjectTeachers, error: stError } = await supabase
        .from('subject_teachers')
        .select(`
          id,
          subject:subjects(name, code),
          teacher:profiles(first_name, last_name)
        `)
        .eq('batch_id', batchId);

      if (stError) throw stError;

      const { data: timeSlots, error: tsError } = await supabase
        .from('subject_time_slots')
        .select('*')
        .in('subject_teacher_id', subjectTeachers.map(st => st.id));

      if (tsError) throw tsError;

      // Combine the data
      const timetable = timeSlots.map(slot => {
        const subjectTeacher = subjectTeachers.find(st => st.id === slot.subject_teacher_id);
        return {
          ...slot,
          subject: subjectTeacher?.subject,
          teacher: subjectTeacher?.teacher
        };
      });

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

  // Create a new time slot
  const createTimeSlot = async (data: Omit<TimeSlot, 'id' | 'created_at' | 'updated_at'>) => {
    setIsLoading(true);
    try {
      // Check for scheduling conflicts
      const { data: conflicts, error: conflictError } = await supabase
        .from('subject_time_slots')
        .select('*')
        .eq('day_of_week', data.day_of_week)
        .or(`and(start_time.lte.${data.end_time},end_time.gte.${data.start_time})`);

      if (conflictError) throw conflictError;

      if (conflicts && conflicts.length > 0) {
        toast({
          title: 'Scheduling conflict',
          description: 'This time slot overlaps with an existing slot',
          variant: 'destructive'
        });
        return null;
      }

      const { data: newSlot, error } = await supabase
        .from('subject_time_slots')
        .insert([data])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Time slot created successfully'
      });

      return newSlot;
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

  // Update a time slot
  const updateTimeSlot = async (id: string, data: Partial<TimeSlot>) => {
    setIsLoading(true);
    try {
      const { data: updatedSlot, error } = await supabase
        .from('subject_time_slots')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Time slot updated successfully'
      });

      return updatedSlot;
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

  // Delete a time slot
  const deleteTimeSlot = async (id: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('subject_time_slots')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Time slot deleted successfully'
      });

      return true;
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

  // Assign teacher to subject
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