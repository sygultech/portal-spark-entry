
-- Create attendance_configurations table for per-batch attendance mode settings
CREATE TABLE IF NOT EXISTS public.attendance_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL,
  batch_id UUID NOT NULL,
  academic_year_id UUID NOT NULL,
  attendance_mode TEXT NOT NULL CHECK (attendance_mode IN ('daily', 'period_wise', 'session_based', 'event_based')),
  auto_absent_enabled BOOLEAN DEFAULT false,
  auto_absent_time TIME DEFAULT '16:00:00', -- Time after which unmarked students are auto-marked absent
  notification_enabled BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(batch_id, academic_year_id, school_id)
);

-- Create attendance_records table for storing attendance data
CREATE TABLE IF NOT EXISTS public.attendance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL,
  student_id UUID NOT NULL,
  batch_id UUID NOT NULL,
  academic_year_id UUID NOT NULL,
  attendance_date DATE NOT NULL,
  attendance_mode TEXT NOT NULL CHECK (attendance_mode IN ('daily', 'period_wise', 'session_based', 'event_based')),
  
  -- For daily attendance
  status TEXT CHECK (status IN ('present', 'absent', 'late', 'excused')) DEFAULT 'present',
  
  -- For period-wise attendance
  subject_id UUID NULL,
  period_number INTEGER NULL,
  schedule_id UUID NULL, -- Reference to timetable_schedules
  
  -- For session-based attendance
  session_type TEXT NULL CHECK (session_type IN ('morning', 'afternoon', 'evening')),
  
  -- For event-based attendance
  event_name TEXT NULL,
  event_type TEXT NULL,
  
  -- Common fields
  marked_by UUID NOT NULL, -- Teacher/staff who marked attendance
  marked_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  absence_reason TEXT NULL,
  notes TEXT NULL,
  is_auto_marked BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Ensure no duplicate attendance for same student/date/context
  UNIQUE(student_id, attendance_date, subject_id, period_number, session_type, event_name)
);

-- Create attendance_leave_requests table for leave applications
CREATE TABLE IF NOT EXISTS public.attendance_leave_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL,
  student_id UUID NOT NULL,
  requested_by UUID NOT NULL, -- Parent/Guardian who requested
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  leave_type TEXT NOT NULL CHECK (leave_type IN ('sick', 'personal', 'medical', 'family_emergency', 'other')),
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_by UUID NULL,
  approved_at TIMESTAMP WITH TIME ZONE NULL,
  rejection_reason TEXT NULL,
  documents JSONB NULL, -- Store file paths for medical certificates, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create attendance_notifications table for tracking sent notifications
CREATE TABLE IF NOT EXISTS public.attendance_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL,
  student_id UUID NOT NULL,
  attendance_record_id UUID NOT NULL,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('sms', 'email', 'app_push')),
  recipient_contact TEXT NOT NULL, -- Phone/email of parent/guardian
  message_content TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'delivered')),
  sent_at TIMESTAMP WITH TIME ZONE NULL,
  error_message TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies for attendance_configurations
ALTER TABLE public.attendance_configurations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "School admins can manage attendance configurations"
ON public.attendance_configurations
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_role_cache urc
    WHERE urc.user_id = auth.uid()
    AND urc.school_id = attendance_configurations.school_id
    AND urc.user_role = 'school_admin'
  )
);

CREATE POLICY "Teachers can view attendance configurations for their school"
ON public.attendance_configurations
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_role_cache urc
    WHERE urc.user_id = auth.uid()
    AND urc.school_id = attendance_configurations.school_id
    AND urc.user_role IN ('teacher', 'school_admin')
  )
);

-- Add RLS policies for attendance_records
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "School staff can manage attendance records"
ON public.attendance_records
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_role_cache urc
    WHERE urc.user_id = auth.uid()
    AND urc.school_id = attendance_records.school_id
    AND urc.user_role IN ('teacher', 'school_admin')
  )
);

CREATE POLICY "Students can view their own attendance"
ON public.attendance_records
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.student_details sd
    WHERE sd.profile_id = auth.uid()
    AND sd.id = attendance_records.student_id
    AND sd.school_id = attendance_records.school_id
  )
);

CREATE POLICY "Parents can view their children's attendance"
ON public.attendance_records
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.student_guardians sg
    JOIN public.guardians g ON g.id = sg.guardian_id
    JOIN public.student_details sd ON sd.id = sg.student_id
    JOIN public.profiles p ON p.id = auth.uid()
    WHERE g.email = p.email
    AND sd.id = attendance_records.student_id
    AND sd.school_id = attendance_records.school_id
  )
);

-- Add RLS policies for attendance_leave_requests
ALTER TABLE public.attendance_leave_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "School staff can manage leave requests"
ON public.attendance_leave_requests
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_role_cache urc
    WHERE urc.user_id = auth.uid()
    AND urc.school_id = attendance_leave_requests.school_id
    AND urc.user_role IN ('teacher', 'school_admin')
  )
);

CREATE POLICY "Parents can manage their children's leave requests"
ON public.attendance_leave_requests
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.student_guardians sg
    JOIN public.guardians g ON g.id = sg.guardian_id
    JOIN public.student_details sd ON sd.id = sg.student_id
    JOIN public.profiles p ON p.id = auth.uid()
    WHERE g.email = p.email
    AND sd.id = attendance_leave_requests.student_id
    AND sd.school_id = attendance_leave_requests.school_id
  )
);

-- Add RLS policies for attendance_notifications
ALTER TABLE public.attendance_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "School staff can manage attendance notifications"
ON public.attendance_notifications
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_role_cache urc
    WHERE urc.user_id = auth.uid()
    AND urc.school_id = attendance_notifications.school_id
    AND urc.user_role IN ('teacher', 'school_admin')
  )
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_attendance_records_student_date ON public.attendance_records(student_id, attendance_date);
CREATE INDEX IF NOT EXISTS idx_attendance_records_batch_date ON public.attendance_records(batch_id, attendance_date);
CREATE INDEX IF NOT EXISTS idx_attendance_records_school_date ON public.attendance_records(school_id, attendance_date);
CREATE INDEX IF NOT EXISTS idx_attendance_configurations_batch ON public.attendance_configurations(batch_id, academic_year_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_student_dates ON public.attendance_leave_requests(student_id, start_date, end_date);

-- Create triggers for updated_at timestamps (only if function exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
    CREATE TRIGGER update_attendance_configurations_updated_at
      BEFORE UPDATE ON public.attendance_configurations
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();

    CREATE TRIGGER update_attendance_records_updated_at
      BEFORE UPDATE ON public.attendance_records
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();

    CREATE TRIGGER update_attendance_leave_requests_updated_at
      BEFORE UPDATE ON public.attendance_leave_requests
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;
