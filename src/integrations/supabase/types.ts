export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      academic_audit_logs: {
        Row: {
          action: string
          created_at: string | null
          entity_id: string
          entity_type: string
          id: string
          new_data: Json | null
          previous_data: Json | null
          school_id: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string | null
          entity_id: string
          entity_type: string
          id?: string
          new_data?: Json | null
          previous_data?: Json | null
          school_id: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          new_data?: Json | null
          previous_data?: Json | null
          school_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "academic_audit_logs_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academic_audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      academic_settings: {
        Row: {
          created_at: string | null
          default_academic_year_id: string | null
          enable_audit_log: boolean | null
          id: string
          school_id: string
          student_self_enroll: boolean | null
          teacher_edit_subjects: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          default_academic_year_id?: string | null
          enable_audit_log?: boolean | null
          id?: string
          school_id: string
          student_self_enroll?: boolean | null
          teacher_edit_subjects?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          default_academic_year_id?: string | null
          enable_audit_log?: boolean | null
          id?: string
          school_id?: string
          student_self_enroll?: boolean | null
          teacher_edit_subjects?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "academic_settings_default_academic_year_id_fkey"
            columns: ["default_academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academic_settings_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: true
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      academic_years: {
        Row: {
          created_at: string | null
          end_date: string
          id: string
          is_active: boolean | null
          is_archived: boolean | null
          name: string
          school_id: string
          start_date: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          end_date: string
          id?: string
          is_active?: boolean | null
          is_archived?: boolean | null
          name: string
          school_id: string
          start_date: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          end_date?: string
          id?: string
          is_active?: boolean | null
          is_archived?: boolean | null
          name?: string
          school_id?: string
          start_date?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "academic_years_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      batch_subjects: {
        Row: {
          batch_id: string
          created_at: string | null
          id: string
          subject_id: string
          teacher_id: string | null
        }
        Insert: {
          batch_id: string
          created_at?: string | null
          id?: string
          subject_id: string
          teacher_id?: string | null
        }
        Update: {
          batch_id?: string
          created_at?: string | null
          id?: string
          subject_id?: string
          teacher_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "batch_subjects_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "batch_subjects_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "batch_subjects_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      batches: {
        Row: {
          academic_year_id: string
          capacity: number
          class_teacher_id: string | null
          course_id: string
          created_at: string | null
          id: string
          is_active: boolean | null
          is_archived: boolean | null
          name: string
          school_id: string
          updated_at: string | null
        }
        Insert: {
          academic_year_id: string
          capacity?: number
          class_teacher_id?: string | null
          course_id: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_archived?: boolean | null
          name: string
          school_id: string
          updated_at?: string | null
        }
        Update: {
          academic_year_id?: string
          capacity?: number
          class_teacher_id?: string | null
          course_id?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_archived?: boolean | null
          name?: string
          school_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "batches_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "batches_class_teacher_id_fkey"
            columns: ["class_teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "batches_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "batches_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      course_subjects: {
        Row: {
          course_id: string
          created_at: string | null
          id: string
          subject_id: string
        }
        Insert: {
          course_id: string
          created_at?: string | null
          id?: string
          subject_id: string
        }
        Update: {
          course_id?: string
          created_at?: string | null
          id?: string
          subject_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_subjects_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_subjects_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          academic_year_id: string
          created_at: string | null
          description: string | null
          id: string
          name: string
          school_id: string
          updated_at: string | null
        }
        Insert: {
          academic_year_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          school_id: string
          updated_at?: string | null
        }
        Update: {
          academic_year_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          school_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "courses_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "courses_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      elective_groups: {
        Row: {
          academic_year_id: string
          course_id: string
          created_at: string | null
          description: string | null
          enrollment_deadline: string | null
          id: string
          is_active: boolean | null
          max_selections: number | null
          name: string
          school_id: string
          updated_at: string | null
        }
        Insert: {
          academic_year_id: string
          course_id: string
          created_at?: string | null
          description?: string | null
          enrollment_deadline?: string | null
          id?: string
          is_active?: boolean | null
          max_selections?: number | null
          name: string
          school_id: string
          updated_at?: string | null
        }
        Update: {
          academic_year_id?: string
          course_id?: string
          created_at?: string | null
          description?: string | null
          enrollment_deadline?: string | null
          id?: string
          is_active?: boolean | null
          max_selections?: number | null
          name?: string
          school_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "elective_groups_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "elective_groups_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "elective_groups_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      elective_subjects: {
        Row: {
          capacity: number | null
          created_at: string | null
          elective_group_id: string
          id: string
          subject_id: string
          teacher_id: string | null
          updated_at: string | null
        }
        Insert: {
          capacity?: number | null
          created_at?: string | null
          elective_group_id: string
          id?: string
          subject_id: string
          teacher_id?: string | null
          updated_at?: string | null
        }
        Update: {
          capacity?: number | null
          created_at?: string | null
          elective_group_id?: string
          id?: string
          subject_id?: string
          teacher_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "elective_subjects_elective_group_id_fkey"
            columns: ["elective_group_id"]
            isOneToOne: false
            referencedRelation: "elective_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "elective_subjects_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "elective_subjects_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      grade_scales: {
        Row: {
          created_at: string | null
          description: string | null
          grade: string
          grade_point: number | null
          grading_system_id: string
          id: string
          max_marks: number
          min_marks: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          grade: string
          grade_point?: number | null
          grading_system_id: string
          id?: string
          max_marks: number
          min_marks: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          grade?: string
          grade_point?: number | null
          grading_system_id?: string
          id?: string
          max_marks?: number
          min_marks?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "grade_scales_grading_system_id_fkey"
            columns: ["grading_system_id"]
            isOneToOne: false
            referencedRelation: "grading_systems"
            referencedColumns: ["id"]
          },
        ]
      }
      grading_systems: {
        Row: {
          academic_year_id: string
          created_at: string | null
          description: string | null
          id: string
          name: string
          school_id: string
          type: string
          updated_at: string | null
        }
        Insert: {
          academic_year_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          school_id: string
          type: string
          updated_at?: string | null
        }
        Update: {
          academic_year_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          school_id?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "grading_systems_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grading_systems_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          role: Database["public"]["Enums"]["user_role"]
          school_id: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          first_name?: string | null
          id: string
          last_name?: string | null
          role: Database["public"]["Enums"]["user_role"]
          school_id?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          school_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      schools: {
        Row: {
          admin_email: string | null
          contact_number: string | null
          created_at: string
          domain: string | null
          id: string
          modules: Json | null
          name: string
          plan: string | null
          region: string | null
          status: string | null
          storage_limit: number | null
          timezone: string | null
          updated_at: string
          user_limit: number | null
        }
        Insert: {
          admin_email?: string | null
          contact_number?: string | null
          created_at?: string
          domain?: string | null
          id?: string
          modules?: Json | null
          name: string
          plan?: string | null
          region?: string | null
          status?: string | null
          storage_limit?: number | null
          timezone?: string | null
          updated_at?: string
          user_limit?: number | null
        }
        Update: {
          admin_email?: string | null
          contact_number?: string | null
          created_at?: string
          domain?: string | null
          id?: string
          modules?: Json | null
          name?: string
          plan?: string | null
          region?: string | null
          status?: string | null
          storage_limit?: number | null
          timezone?: string | null
          updated_at?: string
          user_limit?: number | null
        }
        Relationships: []
      }
      subject_categories: {
        Row: {
          created_at: string | null
          id: string
          name: string
          school_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          school_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          school_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subject_categories_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          academic_year_id: string
          category_id: string | null
          code: string | null
          created_at: string | null
          description: string | null
          id: string
          is_core: boolean | null
          is_language: boolean | null
          max_marks: number | null
          name: string
          pass_marks: number | null
          school_id: string
          updated_at: string | null
        }
        Insert: {
          academic_year_id: string
          category_id?: string | null
          code?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_core?: boolean | null
          is_language?: boolean | null
          max_marks?: number | null
          name: string
          pass_marks?: number | null
          school_id: string
          updated_at?: string | null
        }
        Update: {
          academic_year_id?: string
          category_id?: string | null
          code?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_core?: boolean | null
          is_language?: boolean | null
          max_marks?: number | null
          name?: string
          pass_marks?: number | null
          school_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subjects_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subjects_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "subject_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subjects_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      auto_confirm_email: {
        Args: { target_email: string }
        Returns: boolean
      }
      clone_academic_structure: {
        Args: {
          source_year_id: string
          target_year_id: string
          clone_courses?: boolean
          clone_batches?: boolean
          clone_subjects?: boolean
          clone_grading?: boolean
          clone_electives?: boolean
        }
        Returns: Json
      }
      create_and_confirm_admin_user: {
        Args: {
          admin_email: string
          admin_password: string
          admin_first_name: string
          admin_last_name: string
          admin_school_id: string
        }
        Returns: string
      }
      create_profile_for_existing_user: {
        Args: {
          user_id: string
          user_email: string
          user_role?: Database["public"]["Enums"]["user_role"]
        }
        Returns: boolean
      }
      create_user_profile: {
        Args: {
          user_id: string
          user_email: string
          user_first_name: string
          user_last_name: string
          user_role: Database["public"]["Enums"]["user_role"]
        }
        Returns: undefined
      }
      get_auth_user_details: {
        Args: { p_user_id: string }
        Returns: Json
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["user_role"]
      }
      get_current_user_school_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_metadata_by_email: {
        Args: { email_address: string }
        Returns: Json
      }
      is_email_confirmed: {
        Args: { email_address: string }
        Returns: boolean
      }
      is_super_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      manually_confirm_email: {
        Args: { email_address: string }
        Returns: boolean
      }
      update_admin_user: {
        Args: {
          p_email: string
          p_first_name: string
          p_last_name: string
          p_password?: string
          p_school_id?: string
        }
        Returns: Json
      }
      update_auth_user: {
        Args: {
          p_user_id: string
          p_email?: string
          p_phone?: string
          p_email_confirmed?: boolean
          p_phone_confirmed?: boolean
          p_banned?: boolean
        }
        Returns: Json
      }
      update_school_details: {
        Args: {
          p_school_id: string
          p_name: string
          p_domain: string
          p_contact_number: string
          p_region: string
          p_status: string
          p_admin_email: string
        }
        Returns: Json
      }
    }
    Enums: {
      user_role:
        | "super_admin"
        | "school_admin"
        | "teacher"
        | "student"
        | "parent"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      user_role: [
        "super_admin",
        "school_admin",
        "teacher",
        "student",
        "parent",
      ],
    },
  },
} as const
