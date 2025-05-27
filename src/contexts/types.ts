
import { Session, User } from "@supabase/supabase-js";
import { UserRole, Profile } from "@/types/common";

export type { UserRole, Profile };

export interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  signOut: () => Promise<void>;
}
