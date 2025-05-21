import { Json } from "@/integrations/supabase/types";

export interface Student {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url?: string | null;
  school_id: string;
  role: "student";
  created_at: string;
  updated_at: string;
}

export interface Teacher {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url?: string | null;
  school_id: string;
  role: "teacher";
  created_at: string;
  updated_at: string;
}

export interface School {
  id: string;
  name: string;
  admin_email?: string;
  contact_number?: string;
  domain?: string;
  status?: 'active' | 'suspended' | 'expired' | 'pending';
  created_at: string;
  updated_at: string;
  region?: string;
  timezone?: string;
  plan?: string;
  storage_limit?: number;
  user_limit?: number;
  modules?: SchoolModules | Json;
}

export interface SchoolFormData {
  id?: string;
  name: string;
  domain?: string;
  admin_email: string;
  admin_first_name: string;
  admin_last_name: string;
  admin_password?: string;
  contact_number?: string;
  region?: string;
  status?: 'active' | 'suspended' | 'expired' | 'pending' | string;
}

export interface SchoolModules {
  students?: boolean;
  teachers?: boolean;
  finances?: boolean;
  communications?: boolean;
  facilities?: boolean;
  library?: boolean;
  transport?: boolean;
  finance?: boolean;
  inventory?: boolean;
  alumni?: boolean;
  online_classes?: boolean;
}

export interface StudentExtended extends Student {
  admission_number?: string;
  roll_number?: string;
  batch_id?: string;
  course_id?: string;
  status?: 'active' | 'transferred' | 'graduated';
  admission_date?: string;
  address?: string;
  gender?: string;
  date_of_birth?: string;
  phone?: string;
  blood_group?: string;
  religion?: string;
  nationality?: string;
  category?: string;
  guardian?: Guardian[];
}

export interface Guardian {
  id: string;
  student_id: string;
  name: string;
  relation: string;
  email?: string;
  phone?: string;
  address?: string;
  occupation?: string;
  is_primary?: boolean;
  created_at: string;
  updated_at: string;
}

export interface StudentCategory {
  id: string;
  name: string;
  description?: string;
  school_id: string;
  created_at: string;
  updated_at: string;
}

export interface StudentDocument {
  id: string;
  student_id: string;
  name: string;
  type: string;
  file_path: string;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
}

export interface StudentAttendance {
  id: string;
  student_id: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface DisciplinaryRecord {
  id: string;
  student_id: string;
  incident_date: string;
  incident_type: string;
  description: string;
  action_taken?: string;
  status: 'open' | 'resolved' | 'escalated';
  staff_id: string;
  created_at: string;
  updated_at: string;
}

// force update
