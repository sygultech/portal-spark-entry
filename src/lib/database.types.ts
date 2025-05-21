export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          first_name: string | null;
          last_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          first_name?: string | null;
          last_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          first_name?: string | null;
          last_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      schools: {
        Row: {
          id: string;
          name: string;
          code: string;
          address: string | null;
          phone: string | null;
          email: string | null;
          website: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          code: string;
          address?: string | null;
          phone?: string | null;
          email?: string | null;
          website?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          code?: string;
          address?: string | null;
          phone?: string | null;
          email?: string | null;
          website?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_role_cache: {
        Row: {
          id: string;
          user_id: string;
          school_id: string;
          role: string;
          is_primary: boolean;
          avatar_url: string | null;
          last_updated: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          school_id: string;
          role: string;
          is_primary: boolean;
          avatar_url?: string | null;
          last_updated?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          school_id?: string;
          role?: string;
          is_primary?: boolean;
          avatar_url?: string | null;
          last_updated?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      refresh_user_roles: {
        Args: {
          p_user_id: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      user_role: 'super_admin' | 'school_admin' | 'teacher' | 'student' | 'parent';
    };
  };
} 
// force update
