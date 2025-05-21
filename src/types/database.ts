
import { Database } from '@/lib/database.types';
import { UserRole } from '@/types/common';

export type Tables = Database['public']['Tables'];
export type Enums = Database['public']['Enums'];

// Add user_role_cache to the database types
export type UserRoleCache = {
  id: string;
  user_id: string;
  school_id: string;
  role: UserRole;
  is_primary: boolean;
  avatar_url?: string;
  last_updated: string;
};

// Export specific table types
export type Profile = Tables['profiles']['Row'];
export type School = Tables['schools']['Row'];

// We don't modify the Database interface directly since it can cause conflicts
// Instead, we can create an extended version if needed for project use
