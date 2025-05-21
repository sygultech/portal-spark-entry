
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useTimeSlots(subjectTeacherId?: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const fetchTimeSlots = async () => {
    if (!subjectTeacherId) return [];
    
    const { data, error } = await supabase
      .from('subject_time_slots')
      .select('*')
      .eq('subject_teacher_id', subjectTeacherId)
      .order('day_of_week')
      .order('start_time');
    
    if (error) {
      console.error('Error fetching time slots:', error);
      throw error;
    }
    
    return data;
  };
  
  const timeSlotsQuery = useQuery({
    queryKey: ['time-slots', subjectTeacherId],
    queryFn: fetchTimeSlots,
    enabled: !!subjectTeacherId
  });

  const addTimeSlotMutation = useMutation({
    mutationFn: async (timeSlot: {
      subject_teacher_id: string;
      day_of_week: number;
      start_time: string;
      end_time: string;
      room_number?: string;
    }) => {
      const { data, error } = await supabase
        .from('subject_time_slots')
        .insert(timeSlot)
        .select()
        .single();
      
      if (error) {
        console.error('Error adding time slot:', error);
        toast({
          title: "Error",
          description: `Failed to add time slot: ${error.message}`,
          variant: "destructive"
        });
        throw error;
      }
      
      toast({
        title: "Success",
        description: "Time slot added successfully"
      });
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-slots', subjectTeacherId] });
    }
  });

  const updateTimeSlotMutation = useMutation({
    mutationFn: async (timeSlot: {
      id: string;
      day_of_week?: number;
      start_time?: string;
      end_time?: string;
      room_number?: string;
    }) => {
      const { id, ...updateData } = timeSlot;
      
      const { data, error } = await supabase
        .from('subject_time_slots')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating time slot:', error);
        toast({
          title: "Error",
          description: `Failed to update time slot: ${error.message}`,
          variant: "destructive"
        });
        throw error;
      }
      
      toast({
        title: "Success",
        description: "Time slot updated successfully"
      });
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-slots', subjectTeacherId] });
    }
  });

  const deleteTimeSlotMutation = useMutation({
    mutationFn: async (timeSlotId: string) => {
      const { error } = await supabase
        .from('subject_time_slots')
        .delete()
        .eq('id', timeSlotId);
      
      if (error) {
        console.error('Error deleting time slot:', error);
        toast({
          title: "Error",
          description: `Failed to delete time slot: ${error.message}`,
          variant: "destructive"
        });
        throw error;
      }
      
      toast({
        title: "Success",
        description: "Time slot deleted successfully"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-slots', subjectTeacherId] });
    }
  });

  return {
    timeSlots: timeSlotsQuery.data || [],
    isLoading: timeSlotsQuery.isLoading,
    error: timeSlotsQuery.error,
    addTimeSlot: addTimeSlotMutation.mutate,
    updateTimeSlot: updateTimeSlotMutation.mutate,
    deleteTimeSlot: deleteTimeSlotMutation.mutate
  };
}

// force update

// force update
