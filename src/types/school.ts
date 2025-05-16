
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

export interface SchoolModules {
  students: boolean;
  teachers: boolean;
  finances: boolean;
  communications: boolean;
  facilities: boolean;
}
