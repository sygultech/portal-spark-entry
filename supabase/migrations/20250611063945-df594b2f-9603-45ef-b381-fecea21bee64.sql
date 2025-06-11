
-- Create timetable_schedules table for the actual schedule entries
CREATE TABLE public.timetable_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL,
    academic_year_id UUID NOT NULL,
    batch_id UUID NOT NULL,
    subject_id UUID NOT NULL,
    teacher_id UUID NOT NULL,
    room_id UUID,
    day_of_week TEXT NOT NULL CHECK (day_of_week IN ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')),
    period_number INTEGER NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    valid_from DATE NOT NULL,
    valid_to DATE,
    fortnight_week INTEGER CHECK (fortnight_week IN (1, 2)),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    -- Ensure no overlapping schedules for same batch/period/day
    CONSTRAINT unique_batch_schedule UNIQUE (batch_id, day_of_week, period_number, fortnight_week, valid_from)
);

-- Create special_classes table for one-time or recurring special sessions
CREATE TABLE public.special_classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    class_type TEXT NOT NULL CHECK (class_type IN ('exam', 'event', 'assembly', 'sports', 'extra_curricular', 'makeup', 'guest_lecture')),
    batch_ids UUID[] NOT NULL,
    teacher_id UUID,
    room_id UUID,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_recurring BOOLEAN DEFAULT false,
    recurrence_pattern JSONB, -- {type: 'weekly', interval: 1, days: ['monday']}
    recurrence_end_date DATE,
    replaces_regular_class BOOLEAN DEFAULT false,
    replaced_schedule_ids UUID[],
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
    created_by UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create holidays table
CREATE TABLE public.holidays (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    holiday_type TEXT NOT NULL CHECK (holiday_type IN ('national', 'school', 'religious', 'exam', 'vacation')),
    affects_batches UUID[], -- If NULL, affects all batches
    is_recurring BOOLEAN DEFAULT false,
    recurrence_pattern JSONB, -- {type: 'yearly', month: 1, day: 26}
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    CONSTRAINT unique_school_holiday_date UNIQUE (school_id, date, name)
);

-- Create timetable_overrides table for temporary changes
CREATE TABLE public.timetable_overrides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL,
    original_schedule_id UUID NOT NULL,
    override_type TEXT NOT NULL CHECK (override_type IN ('substitute_teacher', 'room_change', 'time_change', 'cancellation')),
    date DATE NOT NULL,
    
    -- Override data
    substitute_teacher_id UUID,
    new_room_id UUID,
    new_start_time TIME,
    new_end_time TIME,
    
    reason TEXT NOT NULL,
    notes TEXT,
    
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    created_by UUID NOT NULL,
    approved_by UUID,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    CONSTRAINT unique_schedule_override_date UNIQUE (original_schedule_id, date)
);

-- Create room_allocations table for tracking room usage
CREATE TABLE public.room_allocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL,
    room_id UUID NOT NULL,
    academic_year_id UUID NOT NULL,
    allocation_type TEXT NOT NULL CHECK (allocation_type IN ('regular_class', 'special_class', 'exam', 'maintenance', 'event')),
    
    -- Reference to what's allocated
    schedule_id UUID, -- For regular classes
    special_class_id UUID, -- For special classes
    
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    title TEXT NOT NULL,
    allocated_by UUID NOT NULL,
    
    status TEXT DEFAULT 'allocated' CHECK (status IN ('allocated', 'confirmed', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add foreign key constraints
ALTER TABLE timetable_schedules ADD CONSTRAINT fk_timetable_schedules_school FOREIGN KEY (school_id) REFERENCES schools(id);
ALTER TABLE timetable_schedules ADD CONSTRAINT fk_timetable_schedules_academic_year FOREIGN KEY (academic_year_id) REFERENCES academic_years(id);
ALTER TABLE timetable_schedules ADD CONSTRAINT fk_timetable_schedules_batch FOREIGN KEY (batch_id) REFERENCES batches(id);
ALTER TABLE timetable_schedules ADD CONSTRAINT fk_timetable_schedules_subject FOREIGN KEY (subject_id) REFERENCES subjects(id);
ALTER TABLE timetable_schedules ADD CONSTRAINT fk_timetable_schedules_room FOREIGN KEY (room_id) REFERENCES rooms(id);

ALTER TABLE special_classes ADD CONSTRAINT fk_special_classes_school FOREIGN KEY (school_id) REFERENCES schools(id);
ALTER TABLE special_classes ADD CONSTRAINT fk_special_classes_room FOREIGN KEY (room_id) REFERENCES rooms(id);
ALTER TABLE special_classes ADD CONSTRAINT fk_special_classes_created_by FOREIGN KEY (created_by) REFERENCES profiles(id);

ALTER TABLE holidays ADD CONSTRAINT fk_holidays_school FOREIGN KEY (school_id) REFERENCES schools(id);

ALTER TABLE timetable_overrides ADD CONSTRAINT fk_timetable_overrides_school FOREIGN KEY (school_id) REFERENCES schools(id);
ALTER TABLE timetable_overrides ADD CONSTRAINT fk_timetable_overrides_schedule FOREIGN KEY (original_schedule_id) REFERENCES timetable_schedules(id);
ALTER TABLE timetable_overrides ADD CONSTRAINT fk_timetable_overrides_room FOREIGN KEY (new_room_id) REFERENCES rooms(id);
ALTER TABLE timetable_overrides ADD CONSTRAINT fk_timetable_overrides_created_by FOREIGN KEY (created_by) REFERENCES profiles(id);
ALTER TABLE timetable_overrides ADD CONSTRAINT fk_timetable_overrides_approved_by FOREIGN KEY (approved_by) REFERENCES profiles(id);

ALTER TABLE room_allocations ADD CONSTRAINT fk_room_allocations_school FOREIGN KEY (school_id) REFERENCES schools(id);
ALTER TABLE room_allocations ADD CONSTRAINT fk_room_allocations_room FOREIGN KEY (room_id) REFERENCES rooms(id);
ALTER TABLE room_allocations ADD CONSTRAINT fk_room_allocations_academic_year FOREIGN KEY (academic_year_id) REFERENCES academic_years(id);
ALTER TABLE room_allocations ADD CONSTRAINT fk_room_allocations_schedule FOREIGN KEY (schedule_id) REFERENCES timetable_schedules(id);
ALTER TABLE room_allocations ADD CONSTRAINT fk_room_allocations_special_class FOREIGN KEY (special_class_id) REFERENCES special_classes(id);
ALTER TABLE room_allocations ADD CONSTRAINT fk_room_allocations_allocated_by FOREIGN KEY (allocated_by) REFERENCES profiles(id);

-- Enable RLS on all tables
ALTER TABLE timetable_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE special_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetable_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_allocations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for school-based access
CREATE POLICY "School users can view timetable schedules" ON timetable_schedules FOR SELECT 
USING (school_id IN (SELECT school_id FROM user_role_cache WHERE user_id = auth.uid()));

CREATE POLICY "School admins and teachers can manage timetable schedules" ON timetable_schedules FOR ALL 
USING (school_id IN (SELECT school_id FROM user_role_cache WHERE user_id = auth.uid() AND user_role IN ('school_admin', 'teacher')));

CREATE POLICY "School users can view special classes" ON special_classes FOR SELECT 
USING (school_id IN (SELECT school_id FROM user_role_cache WHERE user_id = auth.uid()));

CREATE POLICY "School admins and teachers can manage special classes" ON special_classes FOR ALL 
USING (school_id IN (SELECT school_id FROM user_role_cache WHERE user_id = auth.uid() AND user_role IN ('school_admin', 'teacher')));

CREATE POLICY "School users can view holidays" ON holidays FOR SELECT 
USING (school_id IN (SELECT school_id FROM user_role_cache WHERE user_id = auth.uid()));

CREATE POLICY "School admins can manage holidays" ON holidays FOR ALL 
USING (school_id IN (SELECT school_id FROM user_role_cache WHERE user_id = auth.uid() AND user_role = 'school_admin'));

CREATE POLICY "School users can view timetable overrides" ON timetable_overrides FOR SELECT 
USING (school_id IN (SELECT school_id FROM user_role_cache WHERE user_id = auth.uid()));

CREATE POLICY "School admins and teachers can manage timetable overrides" ON timetable_overrides FOR ALL 
USING (school_id IN (SELECT school_id FROM user_role_cache WHERE user_id = auth.uid() AND user_role IN ('school_admin', 'teacher')));

CREATE POLICY "School users can view room allocations" ON room_allocations FOR SELECT 
USING (school_id IN (SELECT school_id FROM user_role_cache WHERE user_id = auth.uid()));

CREATE POLICY "School admins and teachers can manage room allocations" ON room_allocations FOR ALL 
USING (school_id IN (SELECT school_id FROM user_role_cache WHERE user_id = auth.uid() AND user_role IN ('school_admin', 'teacher')));

-- Create indexes for better performance
CREATE INDEX idx_timetable_schedules_batch_day ON timetable_schedules (batch_id, day_of_week, valid_from, valid_to);
CREATE INDEX idx_timetable_schedules_teacher ON timetable_schedules (teacher_id, day_of_week, valid_from, valid_to);
CREATE INDEX idx_timetable_schedules_room ON timetable_schedules (room_id, day_of_week, valid_from, valid_to);
CREATE INDEX idx_special_classes_date ON special_classes (date, batch_ids);
CREATE INDEX idx_holidays_date ON holidays (school_id, date);
CREATE INDEX idx_timetable_overrides_date ON timetable_overrides (original_schedule_id, date);
CREATE INDEX idx_room_allocations_room_date ON room_allocations (room_id, date, start_time, end_time);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_timetable_schedules_updated_at BEFORE UPDATE ON timetable_schedules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_special_classes_updated_at BEFORE UPDATE ON special_classes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_holidays_updated_at BEFORE UPDATE ON holidays FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_timetable_overrides_updated_at BEFORE UPDATE ON timetable_overrides FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_room_allocations_updated_at BEFORE UPDATE ON room_allocations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
