
export interface UserProfile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  roles?: string[];
  school_id?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthContextType {
  user: any;
  profile: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  switchSchool: (schoolId: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}
