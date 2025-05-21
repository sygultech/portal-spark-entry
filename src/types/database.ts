import { Database } from '@/lib/database.types';

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

// Add the user_role_cache type to the Database interface
declare module '@/lib/database.types' {
  interface Database {
    public: {
      Tables: {
        user_role_cache: {
          Row: UserRoleCache;
          Insert: Omit<UserRoleCache, 'id' | 'last_updated'>;
          Update: Partial<Omit<UserRoleCache, 'id'>>;
        };
      };
    };
  }
} 
// force update

// force update
