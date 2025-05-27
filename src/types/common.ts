
export type UserRole = 'super_admin' | 'school_admin' | 'teacher' | 'student' | 'parent' | 'staff' | 'librarian';

// Add type for profile with array of roles
export interface Profile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  school_id?: string;
  role: UserRole[];  // Now an array of roles
  created_at: string;
  updated_at: string;
}
