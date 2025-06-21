import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export interface Room {
  id: string;
  name: string;
  code?: string;
  capacity?: number;
  type?: string;
  location?: string;
  description?: string;
  facilities?: string[];
  school_id: string;
  created_at: string;
  updated_at: string;
}

export function useRooms(schoolId: string) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch all rooms for the school
  const fetchRooms = useCallback(async () => {
    if (!schoolId) {
      console.log('No schoolId provided for fetchRooms');
      return;
    }
    
    setIsLoading(true);
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('school_id', schoolId)
      .order('name');
    setIsLoading(false);
    if (error) {
      console.error('Error fetching rooms:', error);
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }
    console.log('Fetched rooms:', data);
    setRooms(data || []);
  }, [schoolId]);

  // Automatically fetch rooms when schoolId changes
  useEffect(() => {
    if (schoolId) {
      console.log('Fetching rooms for school:', schoolId);
      fetchRooms();
    }
  }, [schoolId, fetchRooms]);

  // Add a new room
  const addRoom = async (room: Omit<Room, 'id' | 'created_at' | 'updated_at'>) => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('rooms')
      .insert(room)
      .select()
      .single();
    setIsLoading(false);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return null;
    }
    setRooms((prev) => [...prev, data]);
    toast({ title: 'Success', description: 'Room added successfully' });
    return data;
  };

  // Update a room
  const updateRoom = async (id: string, updates: Partial<Room>) => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('rooms')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    setIsLoading(false);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return null;
    }
    setRooms((prev) => prev.map((room) => (room.id === id ? data : room)));
    toast({ title: 'Success', description: 'Room updated successfully' });
    return data;
  };

  // Delete a room
  const deleteRoom = async (id: string) => {
    setIsLoading(true);
    const { error } = await supabase
      .from('rooms')
      .delete()
      .eq('id', id);
    setIsLoading(false);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return false;
    }
    setRooms((prev) => prev.filter((room) => room.id !== id));
    toast({ title: 'Success', description: 'Room deleted successfully' });
    return true;
  };

  return {
    rooms,
    isLoading,
    fetchRooms,
    addRoom,
    updateRoom,
    deleteRoom,
  };
} 