
-- Create enum types for transport system
CREATE TYPE public.vehicle_type AS ENUM ('bus', 'van', 'mini_bus', 'car');
CREATE TYPE public.transport_trip_type AS ENUM ('one_way', 'round_trip', 'morning_only', 'evening_only');
CREATE TYPE public.vehicle_status AS ENUM ('active', 'inactive', 'maintenance', 'repair');
CREATE TYPE public.driver_status AS ENUM ('active', 'inactive', 'on_leave', 'suspended');
CREATE TYPE public.route_status AS ENUM ('active', 'inactive', 'suspended');

-- Vehicles table
CREATE TABLE public.vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    vehicle_number VARCHAR(50) NOT NULL,
    registration_number VARCHAR(50) NOT NULL,
    vehicle_type public.vehicle_type NOT NULL,
    model VARCHAR(100),
    capacity INTEGER NOT NULL DEFAULT 0,
    insurance_number VARCHAR(100),
    insurance_expiry DATE,
    last_maintenance_date DATE,
    next_maintenance_date DATE,
    status public.vehicle_status NOT NULL DEFAULT 'active',
    fuel_type VARCHAR(20),
    purchase_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(school_id, vehicle_number),
    UNIQUE(school_id, registration_number)
);

-- Transport routes table
CREATE TABLE public.transport_routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    route_name VARCHAR(100) NOT NULL,
    route_code VARCHAR(20),
    starting_point VARCHAR(200) NOT NULL,
    ending_point VARCHAR(200) NOT NULL,
    trip_type public.transport_trip_type NOT NULL DEFAULT 'round_trip',
    distance_km DECIMAL(8,2),
    estimated_duration_minutes INTEGER,
    status public.route_status NOT NULL DEFAULT 'active',
    morning_start_time TIME,
    evening_start_time TIME,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(school_id, route_name),
    UNIQUE(school_id, route_code)
);

-- Transport stops table
CREATE TABLE public.transport_stops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    route_id UUID NOT NULL REFERENCES public.transport_routes(id) ON DELETE CASCADE,
    stop_name VARCHAR(100) NOT NULL,
    stop_address TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    stop_order INTEGER NOT NULL,
    morning_pickup_time TIME,
    evening_drop_time TIME,
    zone VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Drivers table
CREATE TABLE public.transport_drivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    staff_id UUID REFERENCES public.staff_details(id),
    driver_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    license_number VARCHAR(50) NOT NULL,
    license_expiry DATE NOT NULL,
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    address TEXT,
    date_of_birth DATE,
    blood_group VARCHAR(10),
    status public.driver_status NOT NULL DEFAULT 'active',
    verification_status BOOLEAN DEFAULT false,
    joining_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(school_id, license_number)
);

-- Vehicle route assignments
CREATE TABLE public.vehicle_route_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
    route_id UUID NOT NULL REFERENCES public.transport_routes(id) ON DELETE CASCADE,
    driver_id UUID NOT NULL REFERENCES public.transport_drivers(id) ON DELETE CASCADE,
    attendant_id UUID REFERENCES public.transport_drivers(id),
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Student transport assignments
CREATE TABLE public.student_transport_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.student_details(id) ON DELETE CASCADE,
    route_id UUID NOT NULL REFERENCES public.transport_routes(id) ON DELETE CASCADE,
    stop_id UUID NOT NULL REFERENCES public.transport_stops(id) ON DELETE CASCADE,
    assignment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    transport_fee DECIMAL(10,2) DEFAULT 0,
    opt_in_status BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Transport fee structure
CREATE TABLE public.transport_fee_structure (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    route_id UUID REFERENCES public.transport_routes(id),
    zone VARCHAR(50),
    distance_range_from DECIMAL(8,2),
    distance_range_to DECIMAL(8,2),
    monthly_fee DECIMAL(10,2) NOT NULL,
    one_time_fee DECIMAL(10,2) DEFAULT 0,
    effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
    effective_to DATE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Vehicle maintenance logs
CREATE TABLE public.vehicle_maintenance_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
    maintenance_date DATE NOT NULL,
    maintenance_type VARCHAR(100) NOT NULL,
    description TEXT,
    cost DECIMAL(10,2),
    service_provider VARCHAR(100),
    next_service_date DATE,
    odometer_reading INTEGER,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Trip logs
CREATE TABLE public.transport_trip_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
    route_id UUID NOT NULL REFERENCES public.transport_routes(id) ON DELETE CASCADE,
    driver_id UUID NOT NULL REFERENCES public.transport_drivers(id) ON DELETE CASCADE,
    trip_date DATE NOT NULL,
    trip_type VARCHAR(20) NOT NULL, -- 'morning', 'evening'
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    start_odometer INTEGER,
    end_odometer INTEGER,
    fuel_consumed DECIMAL(8,2),
    students_count INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transport_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transport_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transport_drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_route_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_transport_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transport_fee_structure ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_maintenance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transport_trip_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for vehicles
CREATE POLICY "School admins can manage vehicles" ON public.vehicles
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_role_cache
            WHERE user_id = auth.uid()
            AND school_id = vehicles.school_id
            AND user_role IN ('school_admin', 'super_admin')
        )
    );

-- RLS Policies for transport_routes
CREATE POLICY "School admins can manage routes" ON public.transport_routes
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_role_cache
            WHERE user_id = auth.uid()
            AND school_id = transport_routes.school_id
            AND user_role IN ('school_admin', 'super_admin')
        )
    );

-- RLS Policies for transport_stops
CREATE POLICY "School admins can manage stops" ON public.transport_stops
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_role_cache
            WHERE user_id = auth.uid()
            AND school_id = transport_stops.school_id
            AND user_role IN ('school_admin', 'super_admin')
        )
    );

-- RLS Policies for transport_drivers
CREATE POLICY "School admins can manage drivers" ON public.transport_drivers
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_role_cache
            WHERE user_id = auth.uid()
            AND school_id = transport_drivers.school_id
            AND user_role IN ('school_admin', 'super_admin')
        )
    );

-- RLS Policies for vehicle_route_assignments
CREATE POLICY "School admins can manage assignments" ON public.vehicle_route_assignments
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_role_cache
            WHERE user_id = auth.uid()
            AND school_id = vehicle_route_assignments.school_id
            AND user_role IN ('school_admin', 'super_admin')
        )
    );

-- RLS Policies for student_transport_assignments
CREATE POLICY "School staff can manage student transport" ON public.student_transport_assignments
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_role_cache
            WHERE user_id = auth.uid()
            AND school_id = student_transport_assignments.school_id
            AND user_role IN ('school_admin', 'teacher', 'super_admin')
        )
    );

-- RLS Policies for transport_fee_structure
CREATE POLICY "School admins can manage fee structure" ON public.transport_fee_structure
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_role_cache
            WHERE user_id = auth.uid()
            AND school_id = transport_fee_structure.school_id
            AND user_role IN ('school_admin', 'super_admin')
        )
    );

-- RLS Policies for vehicle_maintenance_logs
CREATE POLICY "School admins can manage maintenance logs" ON public.vehicle_maintenance_logs
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_role_cache
            WHERE user_id = auth.uid()
            AND school_id = vehicle_maintenance_logs.school_id
            AND user_role IN ('school_admin', 'super_admin')
        )
    );

-- RLS Policies for transport_trip_logs
CREATE POLICY "School staff can manage trip logs" ON public.transport_trip_logs
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_role_cache
            WHERE user_id = auth.uid()
            AND school_id = transport_trip_logs.school_id
            AND user_role IN ('school_admin', 'teacher', 'super_admin')
        )
    );

-- Add indexes for performance
CREATE INDEX idx_vehicles_school_id ON public.vehicles(school_id);
CREATE INDEX idx_transport_routes_school_id ON public.transport_routes(school_id);
CREATE INDEX idx_transport_stops_route_id ON public.transport_stops(route_id);
CREATE INDEX idx_transport_drivers_school_id ON public.transport_drivers(school_id);
CREATE INDEX idx_vehicle_route_assignments_school_id ON public.vehicle_route_assignments(school_id);
CREATE INDEX idx_student_transport_assignments_school_id ON public.student_transport_assignments(school_id);
CREATE INDEX idx_student_transport_assignments_student_id ON public.student_transport_assignments(student_id);

-- Create triggers for updated_at timestamps
CREATE TRIGGER set_updated_at_vehicles
    BEFORE UPDATE ON public.vehicles
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at_transport_routes
    BEFORE UPDATE ON public.transport_routes
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at_transport_stops
    BEFORE UPDATE ON public.transport_stops
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at_transport_drivers
    BEFORE UPDATE ON public.transport_drivers
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at_vehicle_route_assignments
    BEFORE UPDATE ON public.vehicle_route_assignments
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at_student_transport_assignments
    BEFORE UPDATE ON public.student_transport_assignments
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at_transport_fee_structure
    BEFORE UPDATE ON public.transport_fee_structure
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
