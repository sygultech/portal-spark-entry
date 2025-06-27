
import { UserRole } from '@/types/common';

export interface UserProfile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  roles?: UserRole[]; // Changed from string[] to UserRole[]
  school_id?: string;
  primary_school_id?: string; // Added missing property
  created_at: string;
  updated_at: string;
}

// Updated Profile interface to match UserProfile structure
export interface Profile {
  id: string;
  email: string;
  first_name?: string; // Made optional to match UserProfile
  last_name?: string;  // Made optional to match UserProfile
  avatar_url?: string;
  roles?: UserRole[];  // Changed from UserRole[] to optional UserRole[]
  school_id?: string;
  primary_school_id?: string; // Added to match UserProfile
  created_at: string;
  updated_at: string;
}

export interface AuthContextType {
  user: any;
  profile: UserProfile | null;
  loading: boolean;
  isLoading: boolean;
  signOut: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  switchSchool: (schoolId: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

// Fixed export type syntax
export type { UserRole };
