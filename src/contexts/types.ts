
import { Session, User } from "@supabase/supabase-js";

// Define profile type based on our database structure
export type UserRole = "super_admin" | "school_admin" | "teacher" | "student" | "parent";

export interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  avatar_url: string | null;
  school_id: string | null;
  role: UserRole;
}

export interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  signOut: () => Promise<void>;
}

// force update
