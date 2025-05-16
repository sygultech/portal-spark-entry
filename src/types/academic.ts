import { Json } from "@/integrations/supabase/types";

// Basic types for academic features
export interface Subject {
  id: string;
  name: string;
  code?: string;
  description?: string;
  category_id?: string;
  subject_type?: string;
  grading_system_id?: string;
  grading_type?: string;
  max_marks?: number;
  weightage?: number;
  academic_year_id: string;
  school_id: string;
  created_at: string;
  updated_at: string;
  category?: {
    id: string;
    name: string;
  };
  batch_assignments?: Array<{
    id: string;
    batch_id: string;
    is_mandatory: boolean;
  }>;
  grading_system?: GradingSystem;
}

export interface SubjectCategory {
  id: string;
  name: string;
  description?: string;
  school_id: string;
  created_at: string;
  updated_at: string;
}

export interface AcademicYear {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  is_locked: boolean;
  school_id: string;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  name: string;
  code?: string;
  duration?: number;
  duration_unit?: 'years' | 'months' | 'days';
  department_id?: string;
  school_id: string;
  academic_year_id: string;
  created_at: string;
  updated_at: string;
}

export interface Batch {
  id: string;
  name: string;
  code?: string;
  capacity?: number;
  course_id: string;
  class_teacher_id?: string;
  grading_system_id?: string;
  academic_year_id: string;
  school_id: string;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  grading_system?: GradingSystem;
}

export interface BatchStudent {
  id: string;
  batch_id: string;
  student_id: string;
  roll_number?: string;
  created_at: string;
  updated_at: string;
}

export interface GradeThreshold {
  id?: string;
  grade: string;
  name: string;  // descriptive name for the grade
  min_score: number;
  max_score: number;
  grading_system_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface GradingSystem {
  id: string;
  name: string;
  type: 'marks' | 'grades' | 'hybrid';
  description?: string;
  passing_score: number;
  school_id: string;
  thresholds: GradeThreshold[];
  created_at?: string;
  updated_at?: string;
}

export interface GradeScale {
  id: string;
  grade: string;
  min_score: number;
  max_score: number;
  description?: string;
  grading_system_id: string;
}

export interface Elective {
  id: string;
  subject_id: string;
  batch_id: string;
  max_students?: number;
  created_at: string;
  updated_at: string;
}

export interface SubjectTeacher {
  id: string;
  subject_id: string;
  teacher_id: string;
  batch_id: string;
  academic_year_id: string;
  created_at: string;
  updated_at: string;
}

export interface Exam {
  id: string;
  name: string;
  description?: string;
  exam_group_id: string;
  subject_id: string;
  batch_id: string;
  max_marks: number;
  min_marks?: number;
  exam_date: string;
  duration_minutes?: number;
  venue?: string;
  evaluator_id?: string;
  is_published: boolean;
  school_id: string;
  academic_year_id: string;
  created_at: string;
  updated_at: string;
}

export interface ExamGroup {
  id: string;
  name: string;
  description?: string;
  weightage?: number;
  academic_year_id: string;
  school_id: string;
  created_at: string;
  updated_at: string;
}

export interface Timetable {
  id: string;
  title: string;
  batch_id: string;
  academic_year_id: string;
  is_active: boolean;
  effective_from: string;
  effective_to?: string;
  school_id: string;
  created_at: string;
  updated_at: string;
}

export interface TimetableSlot {
  id: string;
  timetable_id: string;
  day_of_week: number; // 1 = Monday, 7 = Sunday
  period_number: number;
  start_time: string;
  end_time: string;
  subject_id?: string;
  teacher_id?: string;
  room_id?: string;
  created_at: string;
  updated_at: string;
}

export interface AcademicSettings {
  id: string;
  school_id: string;
  default_academic_year_id?: string;
  enable_audit_log: boolean;
  student_self_enroll: boolean;
  teacher_edit_subjects: boolean;
  created_at: string;
  updated_at: string;
}

export interface SchoolSettings {
  id: string;
  school_id: string;
  default_grading_system_id?: string;
  created_at: string;
  updated_at: string;
}
