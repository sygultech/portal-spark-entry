
export interface AttendanceConfiguration {
  id: string;
  school_id: string;
  batch_id: string;
  academic_year_id: string;
  attendance_mode: 'daily' | 'period_wise' | 'session_based' | 'event_based';
  auto_absent_enabled: boolean;
  auto_absent_time: string;
  notification_enabled: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AttendanceRecord {
  id: string;
  school_id: string;
  student_id: string;
  batch_id: string;
  academic_year_id: string;
  attendance_date: string;
  attendance_mode: 'daily' | 'period_wise' | 'session_based' | 'event_based';
  status: 'present' | 'absent' | 'late' | 'excused';
  subject_id?: string;
  period_number?: number;
  schedule_id?: string;
  session_type?: 'morning' | 'afternoon' | 'evening';
  event_name?: string;
  event_type?: string;
  marked_by: string;
  marked_at: string;
  absence_reason?: string;
  notes?: string;
  is_auto_marked: boolean;
  created_at: string;
  updated_at: string;
}

export interface AttendanceLeaveRequest {
  id: string;
  school_id: string;
  student_id: string;
  requested_by: string;
  start_date: string;
  end_date: string;
  leave_type: 'sick' | 'personal' | 'medical' | 'family_emergency' | 'other';
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
  documents?: any;
  created_at: string;
  updated_at: string;
}

export interface AttendanceNotification {
  id: string;
  school_id: string;
  student_id: string;
  attendance_record_id: string;
  notification_type: 'sms' | 'email' | 'app_push';
  recipient_contact: string;
  message_content: string;
  status: 'pending' | 'sent' | 'failed' | 'delivered';
  sent_at?: string;
  error_message?: string;
  created_at: string;
}

export interface AttendanceStats {
  total_days: number;
  present_days: number;
  absent_days: number;
  late_days: number;
  excused_days: number;
  attendance_percentage: number;
}

export interface BatchAttendanceStats {
  batch_id: string;
  batch_name: string;
  total_students: number;
  present_students: number;
  absent_students: number;
  late_students: number;
  attendance_percentage: number;
}
