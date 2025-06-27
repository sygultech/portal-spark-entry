
import { UserRole } from '@/types/common';

export interface UserProfile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  roles?: string[];
  school_id?: string;
  primary_school_id?: string; // Added missing property
  created_at: string;
  updated_at: string;
}

// Add Profile alias for compatibility
export interface Profile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  roles: UserRole[];
  school_id?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthContextType {
  user: any;
  profile: UserProfile | null;
  loading: boolean;
  isLoading: boolean; // Added missing property
  signOut: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>; // Added missing method
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<void>; // Added missing method
  switchSchool: (schoolId: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

// Export UserRole for compatibility
export { UserRole };
