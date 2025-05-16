
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
