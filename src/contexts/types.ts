import { Session } from "@supabase/supabase-js";
import { Profile } from "@/types/common";

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roles: UserRole[];
  schoolId?: string;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'super_admin' | 'school_admin' | 'teacher' | 'student';
