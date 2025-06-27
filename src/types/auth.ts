
import { UserRole } from './common';

export interface UserSchoolRole {
  school_id: string;
  roles: UserRole[];
}

export interface User {
  id: string;
  email: string;
  first_name?: string; // Made optional
  last_name?: string;  // Made optional
  avatar_url?: string;
  roles?: UserSchoolRole[]; // Made optional
  primary_school_id?: string; // Added missing property
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
  first_name?: string;
  last_name?: string;
  roles?: UserSchoolRole[]; // Made optional
  school_id?: string;
  primary_school_id?: string; // Added missing property
  avatar_url?: string;
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
