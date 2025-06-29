
export interface Vehicle {
  id: string;
  school_id: string;
  vehicle_number: string;
  registration_number: string;
  vehicle_type: 'bus' | 'van' | 'mini_bus' | 'car';
  model?: string;
  capacity: number;
  insurance_number?: string;
  insurance_expiry?: string;
  last_maintenance_date?: string;
  next_maintenance_date?: string;
  status: 'active' | 'inactive' | 'maintenance' | 'repair';
  fuel_type?: string;
  purchase_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface TransportRoute {
  id: string;
  school_id: string;
  route_name: string;
  route_code?: string;
  starting_point: string;
  ending_point: string;
  trip_type: 'one_way' | 'round_trip' | 'morning_only' | 'evening_only';
  distance_km?: number;
  estimated_duration_minutes?: number;
  status: 'active' | 'inactive' | 'suspended';
  morning_start_time?: string;
  evening_start_time?: string;
  created_at: string;
  updated_at: string;
}

export interface TransportStop {
  id: string;
  school_id: string;
  route_id: string;
  stop_name: string;
  stop_address?: string;
  latitude?: number;
  longitude?: number;
  stop_order: number;
  morning_pickup_time?: string;
  evening_drop_time?: string;
  zone?: string;
  created_at: string;
  updated_at: string;
}

export interface TransportDriver {
  id: string;
  school_id: string;
  staff_id?: string;
  driver_name: string;
  phone: string;
  email?: string;
  license_number: string;
  license_expiry: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  address?: string;
  date_of_birth?: string;
  blood_group?: string;
  status: 'active' | 'inactive' | 'on_leave' | 'suspended';
  verification_status: boolean;
  joining_date: string;
  created_at: string;
  updated_at: string;
}

export interface VehicleRouteAssignment {
  id: string;
  school_id: string;
  vehicle_id: string;
  route_id: string;
  driver_id: string;
  attendant_id?: string;
  start_date: string;
  end_date?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StudentTransportAssignment {
  id: string;
  school_id: string;
  student_id: string;
  route_id: string;
  stop_id: string;
  assignment_date: string;
  end_date?: string;
  is_active: boolean;
  transport_fee: number;
  opt_in_status: boolean;
  created_at: string;
  updated_at: string;
}

export interface TransportFeeStructure {
  id: string;
  school_id: string;
  route_id?: string;
  zone?: string;
  distance_range_from?: number;
  distance_range_to?: number;
  monthly_fee: number;
  one_time_fee: number;
  effective_from: string;
  effective_to?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface VehicleMaintenanceLog {
  id: string;
  school_id: string;
  vehicle_id: string;
  maintenance_date: string;
  maintenance_type: string;
  description?: string;
  cost?: number;
  service_provider?: string;
  next_service_date?: string;
  odometer_reading?: number;
  created_by?: string;
  created_at: string;
}

export interface TransportTripLog {
  id: string;
  school_id: string;
  vehicle_id: string;
  route_id: string;
  driver_id: string;
  trip_date: string;
  trip_type: string;
  start_time?: string;
  end_time?: string;
  start_odometer?: number;
  end_odometer?: number;
  fuel_consumed?: number;
  students_count: number;
  notes?: string;
  created_at: string;
}
