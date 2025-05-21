import { UserRole } from './common';

export interface UserSchoolRole {
  id: string;
  user_id: string;
  school_id: string;
  role: UserRole;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  roles: UserSchoolRole[];
  primary_school_id: string | null;
  avatar_url: string | null;
}

export interface AuthUser {
  id: string;
  email: string;
  user_metadata: {
    first_name?: string;
    last_name?: string;
    role?: UserRole;
    school_id?: string;
  };
} 