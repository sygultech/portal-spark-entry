
export type AcademicYear = {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  is_archived: boolean;
  school_id: string;
  created_at: string;
  updated_at: string;
};

export type Course = {
  id: string;
  name: string;
  description: string | null;
  academic_year_id: string;
  school_id: string;
  created_at: string;
  updated_at: string;
};

export type Batch = {
  id: string;
  name: string;
  course_id: string;
  capacity: number;
  class_teacher_id: string | null;
  academic_year_id: string;
  is_active: boolean;
  is_archived: boolean;
  school_id: string;
  created_at: string;
  updated_at: string;
};

export type SubjectCategory = {
  id: string;
  name: string;
  school_id: string;
  created_at: string;
  updated_at: string;
};

export type Subject = {
  id: string;
  name: string;
  code: string | null;
  description: string | null;
  category_id: string | null;
  is_core: boolean;
  is_language: boolean;
  max_marks: number | null;
  pass_marks: number | null;
  academic_year_id: string;
  school_id: string;
  created_at: string;
  updated_at: string;
};

export type CourseSubject = {
  id: string;
  course_id: string;
  subject_id: string;
  created_at: string;
};

export type BatchSubject = {
  id: string;
  batch_id: string;
  subject_id: string;
  teacher_id: string | null;
  created_at: string;
};

export type GradingSystem = {
  id: string;
  name: string;
  description: string | null;
  type: 'marks' | 'grade' | 'hybrid';
  academic_year_id: string;
  school_id: string;
  created_at: string;
  updated_at: string;
};

export type GradeScale = {
  id: string;
  grading_system_id: string;
  grade: string;
  min_marks: number;
  max_marks: number;
  grade_point: number | null;
  description: string | null;
  created_at: string;
  updated_at: string;
};

export type ElectiveGroup = {
  id: string;
  name: string;
  description: string | null;
  course_id: string;
  max_selections: number;
  enrollment_deadline: string | null;
  is_active: boolean;
  academic_year_id: string;
  school_id: string;
  created_at: string;
  updated_at: string;
};

export type ElectiveSubject = {
  id: string;
  elective_group_id: string;
  subject_id: string;
  capacity: number | null;
  teacher_id: string | null;
  created_at: string;
  updated_at: string;
};

export type AcademicSettings = {
  id: string;
  school_id: string;
  default_academic_year_id: string | null;
  enable_audit_log: boolean;
  student_self_enroll: boolean;
  teacher_edit_subjects: boolean;
  created_at: string;
  updated_at: string;
};

export type AcademicAuditLog = {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  previous_data: any | null;
  new_data: any | null;
  school_id: string;
  created_at: string;
};

export type CloneStructureOptions = {
  source_year_id: string;
  target_year_id: string;
  clone_courses?: boolean;
  clone_batches?: boolean; 
  clone_subjects?: boolean;
  clone_grading?: boolean;
  clone_electives?: boolean;
};

export type CloneStructureResult = {
  courses_cloned: number;
  subjects_cloned: number;
  batches_cloned: number;
  grading_systems_cloned: number;
  elective_groups_cloned: number;
};
