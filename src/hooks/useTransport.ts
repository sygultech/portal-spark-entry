import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { Vehicle, TransportRoute, TransportStop, TransportDriver, VehicleRouteAssignment, StudentTransportAssignment, TransportFeeStructure, VehicleMaintenanceLog, TransportTripLog } from '@/types/transport';

// Vehicles hooks
export const useVehicles = () => {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ['vehicles', profile?.school_id],
    queryFn: async () => {
      if (!profile?.school_id) return [];
      
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('school_id', profile.school_id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Vehicle[];
    },
    enabled: !!profile?.school_id,
  });
};

export const useCreateVehicle = () => {
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  
  return useMutation({
    mutationFn: async (vehicleData: Partial<Vehicle>) => {
      const { data, error } = await supabase
        .from('vehicles')
        .insert({
          ...vehicleData,
          school_id: profile?.school_id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      toast.success('Vehicle created successfully');
    },
    onError: (error) => {
      console.error('Error creating vehicle:', error);
      toast.error('Failed to create vehicle');
    },
  });
};

export const useUpdateVehicle = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Vehicle> & { id: string }) => {
      const { data, error } = await supabase
        .from('vehicles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      toast.success('Vehicle updated successfully');
    },
    onError: (error) => {
      console.error('Error updating vehicle:', error);
      toast.error('Failed to update vehicle');
    },
  });
};

export const useCreateVehicleRouteAssignment = () => {
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  
  return useMutation({
    mutationFn: async (assignmentData: any) => {
      const { data, error } = await supabase
        .from('vehicle_route_assignments')
        .insert({
          ...assignmentData,
          school_id: profile?.school_id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-route-assignments'] });
      toast.success('Vehicle assignment created successfully');
    },
    onError: (error) => {
      console.error('Error creating vehicle assignment:', error);
      toast.error('Failed to create vehicle assignment');
    },
  });
};

// Routes hooks
export const useTransportRoutes = () => {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ['transport-routes', profile?.school_id],
    queryFn: async () => {
      if (!profile?.school_id) return [];
      
      const { data, error } = await supabase
        .from('transport_routes')
        .select('*')
        .eq('school_id', profile.school_id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as TransportRoute[];
    },
    enabled: !!profile?.school_id,
  });
};

export const useCreateTransportRoute = () => {
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  
  return useMutation({
    mutationFn: async (routeData: Partial<TransportRoute>) => {
      const { data, error } = await supabase
        .from('transport_routes')
        .insert({
          ...routeData,
          school_id: profile?.school_id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transport-routes'] });
      toast.success('Route created successfully');
    },
    onError: (error) => {
      console.error('Error creating route:', error);
      toast.error('Failed to create route');
    },
  });
};

// Drivers hooks
export const useTransportDrivers = () => {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ['transport-drivers', profile?.school_id],
    queryFn: async () => {
      if (!profile?.school_id) return [];
      
      const { data, error } = await supabase
        .from('transport_drivers')
        .select('*')
        .eq('school_id', profile.school_id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as TransportDriver[];
    },
    enabled: !!profile?.school_id,
  });
};

export const useCreateTransportDriver = () => {
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  
  return useMutation({
    mutationFn: async (driverData: Partial<TransportDriver>) => {
      const { data, error } = await supabase
        .from('transport_drivers')
        .insert({
          ...driverData,
          school_id: profile?.school_id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transport-drivers'] });
      toast.success('Driver created successfully');
    },
    onError: (error) => {
      console.error('Error creating driver:', error);
      toast.error('Failed to create driver');
    },
  });
};

// Transport stops hooks
export const useTransportStops = (routeId?: string) => {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ['transport-stops', profile?.school_id, routeId],
    queryFn: async () => {
      if (!profile?.school_id) return [];
      
      let query = supabase
        .from('transport_stops')
        .select('*')
        .eq('school_id', profile.school_id);
      
      if (routeId) {
        query = query.eq('route_id', routeId);
      }
      
      const { data, error } = await query.order('stop_order', { ascending: true });
      
      if (error) throw error;
      return data as TransportStop[];
    },
    enabled: !!profile?.school_id,
  });
};

// Student transport assignments
export const useStudentTransportAssignments = () => {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ['student-transport-assignments', profile?.school_id],
    queryFn: async () => {
      if (!profile?.school_id) return [];
      
      const { data, error } = await supabase
        .from('student_transport_assignments')
        .select(`
          *,
          student_details!inner(first_name, last_name, admission_number),
          transport_routes!inner(route_name),
          transport_stops!inner(stop_name)
        `)
        .eq('school_id', profile.school_id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.school_id,
  });
};

// Vehicle route assignments
export const useVehicleRouteAssignments = () => {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ['vehicle-route-assignments', profile?.school_id],
    queryFn: async () => {
      if (!profile?.school_id) return [];
      
      const { data, error } = await supabase
        .from('vehicle_route_assignments')
        .select(`
          *,
          vehicles!inner(vehicle_number, registration_number),
          transport_routes!inner(route_name),
          transport_drivers!vehicle_route_assignments_driver_id_fkey(driver_name)
        `)
        .eq('school_id', profile.school_id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.school_id,
  });
};
