export type AttendanceMode = 'daily' | 'period' | 'session';

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'leave';

export interface AttendanceConfiguration {
  id: string;
  batch_id: string;
  school_id: string;
  academic_year_id: string;
  attendance_mode: AttendanceMode;
  auto_absent_enabled: boolean;
  auto_absent_time?: string;
  notification_enabled: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Student {
  id: string;
  admission_number: string;
  first_name: string;
  last_name: string;
  batch_id: string;
  roll_number?: string;
  photo_url?: string;
}

export interface AttendanceRecord {
  id: string;
  student_id: string;
  batch_id: string;
  date: string;
  mode: AttendanceMode;
  period_number?: number;
  session?: 'morning' | 'afternoon';
  status: AttendanceStatus;
  remarks?: string;
  marked_by: string;
  marked_at: string;
  school_id: string;
}

export interface AttendanceRecordInput {
  id: string;
  student_id: string;
  batch_id: string;
  date: string;
  mode: AttendanceMode;
  period_number?: number;
  session?: 'morning' | 'afternoon';
  status: AttendanceStatus;
  remarks?: string;
  school_id: string;
  marked_by?: string; // Optional: will be set by service
  marked_at?: string; // Optional: will be set by service
}

export interface PeriodSlot {
  period_number: number;
  start_time: string;
  end_time: string;
  subject_name?: string;
  teacher_name?: string;
}

export interface AttendanceEntry {
  id?: string; // Optional: only set for existing database records
  student_id: string;
  date: string;
  period_number?: number;
  session?: 'morning' | 'afternoon';
  status: AttendanceStatus;
  remarks?: string;
}

export interface AttendanceStats {
  total_students: number;
  present: number;
  absent: number;
  late: number;
  leave: number;
  attendance_percentage: number;
}
