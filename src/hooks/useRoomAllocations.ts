
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export interface RoomAllocation {
  id: string;
  room_id: string;
  class_id: string;
  subject_id: string;
  day_of_week: string;
  time_slot: string;
  academic_year_id: string;
  term: string;
  school_id: string;
  created_at: string;
  updated_at: string;
  // Relations
  room?: {
    name: string;
    code?: string;
    type?: string;
    capacity?: number;
  };
  class?: {
    name: string;
  };
  subject?: {
    name: string;
  };
}

export interface RoomAllocationData {
  room_id: string;
  class_id: string;
  subject_id: string;
  day_of_week: string;
  time_slot: string;
  academic_year_id: string;
  term: string;
}

export function useRoomAllocations(schoolId: string) {
  const [allocations, setAllocations] = useState<RoomAllocation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch all room allocations for the school
  const fetchAllocations = useCallback(async (academicYearId?: string, term?: string) => {
    setIsLoading(true);
    let query = supabase
      .from('room_allocations')
      .select(`
        *,
        room:rooms(name, code, type, capacity),
        class:classes(name),
        subject:subjects(name)
      `)
      .eq('school_id', schoolId);

    if (academicYearId) {
      query = query.eq('academic_year_id', academicYearId);
    }

    if (term) {
      query = query.eq('term', term);
    }

    const { data, error } = await query.order('day_of_week').order('time_slot');
    
    setIsLoading(false);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }
    setAllocations(data || []);
  }, [schoolId]);

  // Add a new room allocation
  const addAllocation = async (allocation: RoomAllocationData & { school_id: string }) => {
    setIsLoading(true);
    
    // Check for conflicts first
    const { data: conflicts, error: conflictError } = await supabase
      .from('room_allocations')
      .select('*')
      .eq('room_id', allocation.room_id)
      .eq('day_of_week', allocation.day_of_week)
      .eq('time_slot', allocation.time_slot)
      .eq('academic_year_id', allocation.academic_year_id)
      .eq('term', allocation.term);

    if (conflictError) {
      setIsLoading(false);
      toast({ title: 'Error', description: conflictError.message, variant: 'destructive' });
      return null;
    }

    if (conflicts && conflicts.length > 0) {
      setIsLoading(false);
      toast({ 
        title: 'Conflict Detected', 
        description: 'This room is already allocated for the selected time slot.', 
        variant: 'destructive' 
      });
      return null;
    }

    const { data, error } = await supabase
      .from('room_allocations')
      .insert(allocation)
      .select(`
        *,
        room:rooms(name, code, type, capacity),
        class:classes(name),
        subject:subjects(name)
      `)
      .single();

    setIsLoading(false);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return null;
    }

    setAllocations((prev) => [...prev, data]);
    toast({ title: 'Success', description: 'Room allocated successfully' });
    return data;
  };

  // Update a room allocation
  const updateAllocation = async (id: string, updates: Partial<RoomAllocationData>) => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('room_allocations')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        room:rooms(name, code, type, capacity),
        class:classes(name),
        subject:subjects(name)
      `)
      .single();

    setIsLoading(false);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return null;
    }

    setAllocations((prev) => prev.map((allocation) => (allocation.id === id ? data : allocation)));
    toast({ title: 'Success', description: 'Room allocation updated successfully' });
    return data;
  };

  // Delete a room allocation
  const deleteAllocation = async (id: string) => {
    setIsLoading(true);
    const { error } = await supabase
      .from('room_allocations')
      .delete()
      .eq('id', id);

    setIsLoading(false);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return false;
    }

    setAllocations((prev) => prev.filter((allocation) => allocation.id !== id));
    toast({ title: 'Success', description: 'Room allocation deleted successfully' });
    return true;
  };

  return {
    allocations,
    isLoading,
    fetchAllocations,
    addAllocation,
    updateAllocation,
    deleteAllocation,
  };
}
