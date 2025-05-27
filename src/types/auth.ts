import { UserRole } from './common';

export interface UserSchoolRole {
  school_id: string;
  roles: UserRole[];
}

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  roles: UserSchoolRole[];
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
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