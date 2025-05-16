
import { Json } from "@/integrations/supabase/types";

// Basic types for academic features
export interface Subject {
  id: string;
  name: string;
  code?: string;
  description?: string;
  category_id?: string;
  academic_year_id?: string;
  school_id: string;
  created_at: string;
  updated_at: string;
  category?: SubjectCategory;
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
  school_id: string;
  created_at: string;
  updated_at: string;
}

export interface GradingSystem {
  id: string;
  name: string;
  description?: string;
  school_id: string;
  created_at: string;
  updated_at: string;
  grades?: GradeScale[];
}

export interface GradeScale {
  id: string;
  grade: string;
  min_score: number;
  max_score: number;
  description?: string;
  grading_system_id: string;
}

export interface Batch {
  id: string;
  name: string;
  academic_year_id: string;
  school_id: string;
  created_at: string;
  updated_at: string;
}

export interface BatchStudent {
  id: string;
  batch_id: string;
  student_id: string;
  created_at: string;
  updated_at: string;
}

export interface Elective {
  id: string;
  subject_id: string;
  batch_id: string;
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
