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
      academic_settings: {
        Row: {
          created_at: string
          default_academic_year_id: string | null
          enable_audit_log: boolean | null
          id: string
          school_id: string
          student_self_enroll: boolean | null
          teacher_edit_subjects: boolean | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          default_academic_year_id?: string | null
          enable_audit_log?: boolean | null
          id?: string
          school_id: string
          student_self_enroll?: boolean | null
          teacher_edit_subjects?: boolean | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          default_academic_year_id?: string | null
          enable_audit_log?: boolean | null
          id?: string
          school_id?: string
          student_self_enroll?: boolean | null
          teacher_edit_subjects?: boolean | null
          updated_at?: string
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
          created_at: string
          end_date: string
          id: string
          is_current: boolean | null
          is_locked: boolean | null
          name: string
          school_id: string
          start_date: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          is_current?: boolean | null
          is_locked?: boolean | null
          name: string
          school_id: string
          start_date: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          is_current?: boolean | null
          is_locked?: boolean | null
          name?: string
          school_id?: string
          start_date?: string
          updated_at?: string
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
      batch_configuration_mapping: {
        Row: {
          batch_id: string
          configuration_id: string
          created_at: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          batch_id: string
          configuration_id: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
        }
        Update: {
          batch_id?: string
          configuration_id?: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "batch_configuration_mapping_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "batch_configuration_mapping_configuration_id_fkey"
            columns: ["configuration_id"]
            isOneToOne: false
            referencedRelation: "timetable_configurations"
            referencedColumns: ["id"]
          },
        ]
      }
      batch_students: {
        Row: {
          batch_id: string
          created_at: string
          id: string
          roll_number: string | null
          student_id: string
          updated_at: string
        }
        Insert: {
          batch_id: string
          created_at?: string
          id?: string
          roll_number?: string | null
          student_id: string
          updated_at?: string
        }
        Update: {
          batch_id?: string
          created_at?: string
          id?: string
          roll_number?: string | null
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "batch_students_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "batch_students_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      batch_subjects: {
        Row: {
          batch_id: string
          created_at: string
          id: string
          is_mandatory: boolean
          subject_id: string
          updated_at: string
        }
        Insert: {
          batch_id: string
          created_at?: string
          id?: string
          is_mandatory?: boolean
          subject_id: string
          updated_at?: string
        }
        Update: {
          batch_id?: string
          created_at?: string
          id?: string
          is_mandatory?: boolean
          subject_id?: string
          updated_at?: string
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
        ]
      }
      batches: {
        Row: {
          academic_year_id: string
          capacity: number | null
          class_teacher_id: string | null
          code: string | null
          course_id: string
          created_at: string
          grading_system_id: string | null
          id: string
          is_archived: boolean | null
          name: string
          school_id: string
          updated_at: string
        }
        Insert: {
          academic_year_id: string
          capacity?: number | null
          class_teacher_id?: string | null
          code?: string | null
          course_id: string
          created_at?: string
          grading_system_id?: string | null
          id?: string
          is_archived?: boolean | null
          name: string
          school_id: string
          updated_at?: string
        }
        Update: {
          academic_year_id?: string
          capacity?: number | null
          class_teacher_id?: string | null
          code?: string | null
          course_id?: string
          created_at?: string
          grading_system_id?: string | null
          id?: string
          is_archived?: boolean | null
          name?: string
          school_id?: string
          updated_at?: string
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
            foreignKeyName: "batches_grading_system_id_fkey"
            columns: ["grading_system_id"]
            isOneToOne: false
            referencedRelation: "grading_systems"
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
      certificates: {
        Row: {
          created_at: string | null
          data: Json | null
          id: string
          issued_by: string
          issued_date: string
          school_id: string
          serial_number: string
          status: string
          student_id: string
          template_id: string
          type: string
          updated_at: string | null
          valid_until: string | null
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          id?: string
          issued_by: string
          issued_date?: string
          school_id: string
          serial_number: string
          status?: string
          student_id: string
          template_id: string
          type: string
          updated_at?: string | null
          valid_until?: string | null
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          id?: string
          issued_by?: string
          issued_date?: string
          school_id?: string
          serial_number?: string
          status?: string
          student_id?: string
          template_id?: string
          type?: string
          updated_at?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "certificates_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          academic_year_id: string
          code: string | null
          created_at: string
          department_id: string | null
          duration: number | null
          duration_unit: string | null
          id: string
          name: string
          school_id: string
          updated_at: string
        }
        Insert: {
          academic_year_id: string
          code?: string | null
          created_at?: string
          department_id?: string | null
          duration?: number | null
          duration_unit?: string | null
          id?: string
          name: string
          school_id: string
          updated_at?: string
        }
        Update: {
          academic_year_id?: string
          code?: string | null
          created_at?: string
          department_id?: string | null
          duration?: number | null
          duration_unit?: string | null
          id?: string
          name?: string
          school_id?: string
          updated_at?: string
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
            foreignKeyName: "courses_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
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
      departments: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          school_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          school_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          school_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "departments_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      designations: {
        Row: {
          created_at: string
          department_id: string
          description: string | null
          id: string
          name: string
          school_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          department_id: string
          description?: string | null
          id?: string
          name: string
          school_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          department_id?: string
          description?: string | null
          id?: string
          name?: string
          school_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "designations_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "designations_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      disciplinary_evidence: {
        Row: {
          disciplinary_record_id: string
          file_path: string
          id: string
          school_id: string
          type: string
          uploaded_at: string | null
        }
        Insert: {
          disciplinary_record_id: string
          file_path: string
          id?: string
          school_id: string
          type: string
          uploaded_at?: string | null
        }
        Update: {
          disciplinary_record_id?: string
          file_path?: string
          id?: string
          school_id?: string
          type?: string
          uploaded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "disciplinary_evidence_disciplinary_record_id_fkey"
            columns: ["disciplinary_record_id"]
            isOneToOne: false
            referencedRelation: "disciplinary_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disciplinary_evidence_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      disciplinary_records: {
        Row: {
          action_taken: string | null
          created_at: string | null
          date: string
          description: string
          id: string
          incident_type: string
          reported_by: string
          school_id: string
          severity: string
          status: string
          student_id: string
          updated_at: string | null
        }
        Insert: {
          action_taken?: string | null
          created_at?: string | null
          date: string
          description: string
          id?: string
          incident_type: string
          reported_by: string
          school_id: string
          severity: string
          status?: string
          student_id: string
          updated_at?: string | null
        }
        Update: {
          action_taken?: string | null
          created_at?: string | null
          date?: string
          description?: string
          id?: string
          incident_type?: string
          reported_by?: string
          school_id?: string
          severity?: string
          status?: string
          student_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "disciplinary_records_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      grade_thresholds: {
        Row: {
          created_at: string
          grade: string
          grade_point: number | null
          grading_system_id: string
          id: string
          max_score: number
          min_score: number
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          grade: string
          grade_point?: number | null
          grading_system_id: string
          id?: string
          max_score: number
          min_score: number
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          grade?: string
          grade_point?: number | null
          grading_system_id?: string
          id?: string
          max_score?: number
          min_score?: number
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "grade_thresholds_grading_system_id_fkey"
            columns: ["grading_system_id"]
            isOneToOne: false
            referencedRelation: "grading_systems"
            referencedColumns: ["id"]
          },
        ]
      }
      grading_systems: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          passing_score: number
          school_id: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          passing_score: number
          school_id: string
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          passing_score?: number
          school_id?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "grading_systems_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      guardian_notification_preferences: {
        Row: {
          created_at: string | null
          email_notifications: boolean | null
          guardian_id: string
          id: string
          notification_types: string[] | null
          push_notifications: boolean | null
          sms_notifications: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email_notifications?: boolean | null
          guardian_id: string
          id?: string
          notification_types?: string[] | null
          push_notifications?: boolean | null
          sms_notifications?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email_notifications?: boolean | null
          guardian_id?: string
          id?: string
          notification_types?: string[] | null
          push_notifications?: boolean | null
          sms_notifications?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "guardian_notification_preferences_guardian_id_fkey"
            columns: ["guardian_id"]
            isOneToOne: true
            referencedRelation: "guardians"
            referencedColumns: ["id"]
          },
        ]
      }
      guardians: {
        Row: {
          address: string | null
          can_pickup: boolean | null
          created_at: string | null
          email: string | null
          first_name: string
          id: string
          is_emergency_contact: boolean | null
          last_name: string | null
          occupation: string | null
          phone: string
          relation: string
          school_id: string
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          can_pickup?: boolean | null
          created_at?: string | null
          email?: string | null
          first_name: string
          id?: string
          is_emergency_contact?: boolean | null
          last_name?: string | null
          occupation?: string | null
          phone: string
          relation: string
          school_id: string
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          can_pickup?: boolean | null
          created_at?: string | null
          email?: string | null
          first_name?: string
          id?: string
          is_emergency_contact?: boolean | null
          last_name?: string | null
          occupation?: string | null
          phone?: string
          relation?: string
          school_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "guardians_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      holidays: {
        Row: {
          affects_batches: string[] | null
          created_at: string | null
          date: string
          description: string | null
          holiday_type: string
          id: string
          is_recurring: boolean | null
          name: string
          recurrence_pattern: Json | null
          school_id: string
          updated_at: string | null
        }
        Insert: {
          affects_batches?: string[] | null
          created_at?: string | null
          date: string
          description?: string | null
          holiday_type: string
          id?: string
          is_recurring?: boolean | null
          name: string
          recurrence_pattern?: Json | null
          school_id: string
          updated_at?: string | null
        }
        Update: {
          affects_batches?: string[] | null
          created_at?: string | null
          date?: string
          description?: string | null
          holiday_type?: string
          id?: string
          is_recurring?: boolean | null
          name?: string
          recurrence_pattern?: Json | null
          school_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_holidays_school"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      library_resources: {
        Row: {
          author: string | null
          category: string | null
          created_at: string | null
          id: string
          isbn: string | null
          school_id: string
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          author?: string | null
          category?: string | null
          created_at?: string | null
          id?: string
          isbn?: string | null
          school_id: string
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          author?: string | null
          category?: string | null
          created_at?: string | null
          id?: string
          isbn?: string | null
          school_id?: string
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "library_resources_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      parent_meetings: {
        Row: {
          attendees: string
          created_at: string | null
          date: string
          disciplinary_record_id: string
          discussion: string
          follow_up_date: string | null
          id: string
          outcome: string | null
          school_id: string
          updated_at: string | null
        }
        Insert: {
          attendees: string
          created_at?: string | null
          date: string
          disciplinary_record_id: string
          discussion: string
          follow_up_date?: string | null
          id?: string
          outcome?: string | null
          school_id: string
          updated_at?: string | null
        }
        Update: {
          attendees?: string
          created_at?: string | null
          date?: string
          disciplinary_record_id?: string
          discussion?: string
          follow_up_date?: string | null
          id?: string
          outcome?: string | null
          school_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "parent_meetings_disciplinary_record_id_fkey"
            columns: ["disciplinary_record_id"]
            isOneToOne: false
            referencedRelation: "disciplinary_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parent_meetings_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      period_settings: {
        Row: {
          configuration_id: string
          created_at: string | null
          day_of_week: string | null
          end_time: string
          fortnight_week: number | null
          id: string
          label: string | null
          period_number: number
          start_time: string
          type: string
          updated_at: string | null
        }
        Insert: {
          configuration_id: string
          created_at?: string | null
          day_of_week?: string | null
          end_time: string
          fortnight_week?: number | null
          id?: string
          label?: string | null
          period_number: number
          start_time: string
          type: string
          updated_at?: string | null
        }
        Update: {
          configuration_id?: string
          created_at?: string | null
          day_of_week?: string | null
          end_time?: string
          fortnight_week?: number | null
          id?: string
          label?: string | null
          period_number?: number
          start_time?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "period_settings_configuration_id_fkey"
            columns: ["configuration_id"]
            isOneToOne: false
            referencedRelation: "timetable_configurations"
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
          roles: Database["public"]["Enums"]["user_role"][] | null
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
          roles?: Database["public"]["Enums"]["user_role"][] | null
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
          roles?: Database["public"]["Enums"]["user_role"][] | null
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
      room_allocations: {
        Row: {
          academic_year_id: string
          allocated_by: string
          allocation_type: string
          created_at: string | null
          date: string
          end_time: string
          id: string
          room_id: string
          schedule_id: string | null
          school_id: string
          special_class_id: string | null
          start_time: string
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          academic_year_id: string
          allocated_by: string
          allocation_type: string
          created_at?: string | null
          date: string
          end_time: string
          id?: string
          room_id: string
          schedule_id?: string | null
          school_id: string
          special_class_id?: string | null
          start_time: string
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          academic_year_id?: string
          allocated_by?: string
          allocation_type?: string
          created_at?: string | null
          date?: string
          end_time?: string
          id?: string
          room_id?: string
          schedule_id?: string | null
          school_id?: string
          special_class_id?: string | null
          start_time?: string
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_room_allocations_academic_year"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_room_allocations_allocated_by"
            columns: ["allocated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_room_allocations_room"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_room_allocations_schedule"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "timetable_schedules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_room_allocations_school"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_room_allocations_special_class"
            columns: ["special_class_id"]
            isOneToOne: false
            referencedRelation: "special_classes"
            referencedColumns: ["id"]
          },
        ]
      }
      rooms: {
        Row: {
          capacity: number | null
          code: string | null
          created_at: string
          description: string | null
          facilities: string[] | null
          id: string
          location: string | null
          name: string
          school_id: string
          type: string | null
          updated_at: string
        }
        Insert: {
          capacity?: number | null
          code?: string | null
          created_at?: string
          description?: string | null
          facilities?: string[] | null
          id?: string
          location?: string | null
          name: string
          school_id: string
          type?: string | null
          updated_at?: string
        }
        Update: {
          capacity?: number | null
          code?: string | null
          created_at?: string
          description?: string | null
          facilities?: string[] | null
          id?: string
          location?: string | null
          name?: string
          school_id?: string
          type?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      school_settings: {
        Row: {
          created_at: string
          default_grading_system_id: string | null
          id: string
          school_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          default_grading_system_id?: string | null
          id?: string
          school_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          default_grading_system_id?: string | null
          id?: string
          school_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "school_settings_default_grading_system_id_fkey"
            columns: ["default_grading_system_id"]
            isOneToOne: false
            referencedRelation: "grading_systems"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "school_settings_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: true
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
          default_grading_system_id: string | null
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
          default_grading_system_id?: string | null
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
          default_grading_system_id?: string | null
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
        Relationships: [
          {
            foreignKeyName: "schools_default_grading_system_id_fkey"
            columns: ["default_grading_system_id"]
            isOneToOne: false
            referencedRelation: "grading_systems"
            referencedColumns: ["id"]
          },
        ]
      }
      special_classes: {
        Row: {
          batch_ids: string[]
          class_type: string
          created_at: string | null
          created_by: string
          date: string
          description: string | null
          end_time: string
          id: string
          is_recurring: boolean | null
          recurrence_end_date: string | null
          recurrence_pattern: Json | null
          replaced_schedule_ids: string[] | null
          replaces_regular_class: boolean | null
          room_id: string | null
          school_id: string
          start_time: string
          status: string | null
          teacher_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          batch_ids: string[]
          class_type: string
          created_at?: string | null
          created_by: string
          date: string
          description?: string | null
          end_time: string
          id?: string
          is_recurring?: boolean | null
          recurrence_end_date?: string | null
          recurrence_pattern?: Json | null
          replaced_schedule_ids?: string[] | null
          replaces_regular_class?: boolean | null
          room_id?: string | null
          school_id: string
          start_time: string
          status?: string | null
          teacher_id?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          batch_ids?: string[]
          class_type?: string
          created_at?: string | null
          created_by?: string
          date?: string
          description?: string | null
          end_time?: string
          id?: string
          is_recurring?: boolean | null
          recurrence_end_date?: string | null
          recurrence_pattern?: Json | null
          replaced_schedule_ids?: string[] | null
          replaces_regular_class?: boolean | null
          room_id?: string | null
          school_id?: string
          start_time?: string
          status?: string | null
          teacher_id?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_special_classes_created_by"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_special_classes_room"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_special_classes_school"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_details: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          date_of_birth: string | null
          department_id: string
          designation_id: string
          email: string
          employee_id: string
          employment_status: string
          first_name: string
          gender: string | null
          id: string
          join_date: string
          last_name: string
          phone: string | null
          postal_code: string | null
          profile_id: string | null
          profile_image_url: string | null
          school_id: string
          state: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          date_of_birth?: string | null
          department_id: string
          designation_id: string
          email: string
          employee_id: string
          employment_status?: string
          first_name: string
          gender?: string | null
          id?: string
          join_date: string
          last_name: string
          phone?: string | null
          postal_code?: string | null
          profile_id?: string | null
          profile_image_url?: string | null
          school_id: string
          state?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          date_of_birth?: string | null
          department_id?: string
          designation_id?: string
          email?: string
          employee_id?: string
          employment_status?: string
          first_name?: string
          gender?: string | null
          id?: string
          join_date?: string
          last_name?: string
          phone?: string | null
          postal_code?: string | null
          profile_id?: string | null
          profile_image_url?: string | null
          school_id?: string
          state?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_details_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_details_designation_id_fkey"
            columns: ["designation_id"]
            isOneToOne: false
            referencedRelation: "designations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_details_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_details_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_documents: {
        Row: {
          created_at: string
          document_type: string
          file_name: string
          file_url: string
          id: string
          staff_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          document_type: string
          file_name: string
          file_url: string
          id?: string
          staff_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          document_type?: string
          file_name?: string
          file_url?: string
          id?: string
          staff_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_documents_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_details"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_emergency_contacts: {
        Row: {
          contact_name: string
          contact_phone: string
          created_at: string
          id: string
          relationship: string
          staff_id: string
          updated_at: string
        }
        Insert: {
          contact_name: string
          contact_phone: string
          created_at?: string
          id?: string
          relationship: string
          staff_id: string
          updated_at?: string
        }
        Update: {
          contact_name?: string
          contact_phone?: string
          created_at?: string
          id?: string
          relationship?: string
          staff_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_emergency_contacts_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_details"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_experiences: {
        Row: {
          created_at: string
          description: string | null
          end_year: number | null
          id: string
          organization: string
          position: string
          staff_id: string
          start_year: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_year?: number | null
          id?: string
          organization: string
          position: string
          staff_id: string
          start_year: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_year?: number | null
          id?: string
          organization?: string
          position?: string
          staff_id?: string
          start_year?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_experiences_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_details"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_qualifications: {
        Row: {
          created_at: string
          degree: string
          grade: string | null
          id: string
          institution: string
          staff_id: string
          updated_at: string
          year: number
        }
        Insert: {
          created_at?: string
          degree: string
          grade?: string | null
          id?: string
          institution: string
          staff_id: string
          updated_at?: string
          year: number
        }
        Update: {
          created_at?: string
          degree?: string
          grade?: string | null
          id?: string
          institution?: string
          staff_id?: string
          updated_at?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "staff_qualifications_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_details"
            referencedColumns: ["id"]
          },
        ]
      }
      student_categories: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          school_id: string
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          school_id: string
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          school_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_categories_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      student_category_assignments: {
        Row: {
          category_id: string
          created_at: string | null
          id: string
          student_id: string
        }
        Insert: {
          category_id: string
          created_at?: string | null
          id?: string
          student_id: string
        }
        Update: {
          category_id?: string
          created_at?: string | null
          id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_category_assignments_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "student_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      student_details: {
        Row: {
          address: string | null
          admission_date: string | null
          admission_number: string
          batch_id: string | null
          blood_group: string | null
          caste: string | null
          category: string | null
          created_at: string | null
          date_of_birth: string | null
          email: string | null
          first_name: string
          gender: string | null
          id: string
          last_name: string
          mother_tongue: string | null
          nationality: string | null
          phone: string | null
          previous_school_board: string | null
          previous_school_name: string | null
          previous_school_percentage: number | null
          previous_school_year: string | null
          profile_id: string | null
          religion: string | null
          school_id: string
          status: string | null
          tc_number: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          admission_date?: string | null
          admission_number: string
          batch_id?: string | null
          blood_group?: string | null
          caste?: string | null
          category?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          first_name?: string
          gender?: string | null
          id: string
          last_name?: string
          mother_tongue?: string | null
          nationality?: string | null
          phone?: string | null
          previous_school_board?: string | null
          previous_school_name?: string | null
          previous_school_percentage?: number | null
          previous_school_year?: string | null
          profile_id?: string | null
          religion?: string | null
          school_id: string
          status?: string | null
          tc_number?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          admission_date?: string | null
          admission_number?: string
          batch_id?: string | null
          blood_group?: string | null
          caste?: string | null
          category?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          first_name?: string
          gender?: string | null
          id?: string
          last_name?: string
          mother_tongue?: string | null
          nationality?: string | null
          phone?: string | null
          previous_school_board?: string | null
          previous_school_name?: string | null
          previous_school_percentage?: number | null
          previous_school_year?: string | null
          profile_id?: string | null
          religion?: string | null
          school_id?: string
          status?: string | null
          tc_number?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_details_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_details_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_details_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      student_documents: {
        Row: {
          created_at: string | null
          description: string | null
          file_path: string
          id: string
          name: string
          school_id: string
          student_id: string
          type: string
          updated_at: string | null
          upload_date: string | null
          verification_date: string | null
          verification_status: string | null
          verified_by: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          file_path: string
          id?: string
          name: string
          school_id: string
          student_id: string
          type: string
          updated_at?: string | null
          upload_date?: string | null
          verification_date?: string | null
          verification_status?: string | null
          verified_by?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          file_path?: string
          id?: string
          name?: string
          school_id?: string
          student_id?: string
          type?: string
          updated_at?: string | null
          upload_date?: string | null
          verification_date?: string | null
          verification_status?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_documents_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      student_guardians: {
        Row: {
          created_at: string | null
          guardian_id: string
          id: string
          is_primary: boolean | null
          student_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          guardian_id: string
          id?: string
          is_primary?: boolean | null
          student_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          guardian_id?: string
          id?: string
          is_primary?: boolean | null
          student_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_guardians_guardian_id_fkey"
            columns: ["guardian_id"]
            isOneToOne: false
            referencedRelation: "guardians"
            referencedColumns: ["id"]
          },
        ]
      }
      subject_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          school_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          school_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          school_id?: string
          updated_at?: string
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
      subject_teachers: {
        Row: {
          academic_year_id: string
          batch_id: string
          created_at: string
          id: string
          subject_id: string
          teacher_id: string
          updated_at: string
        }
        Insert: {
          academic_year_id: string
          batch_id: string
          created_at?: string
          id?: string
          subject_id: string
          teacher_id: string
          updated_at?: string
        }
        Update: {
          academic_year_id?: string
          batch_id?: string
          created_at?: string
          id?: string
          subject_id?: string
          teacher_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subject_teachers_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subject_teachers_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subject_teachers_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subject_teachers_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subject_time_slots: {
        Row: {
          created_at: string
          day_of_week: number | null
          end_time: string
          id: string
          room_number: string | null
          start_time: string
          subject_teacher_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          day_of_week?: number | null
          end_time: string
          id?: string
          room_number?: string | null
          start_time: string
          subject_teacher_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          day_of_week?: number | null
          end_time?: string
          id?: string
          room_number?: string | null
          start_time?: string
          subject_teacher_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subject_time_slots_subject_teacher_id_fkey"
            columns: ["subject_teacher_id"]
            isOneToOne: false
            referencedRelation: "subject_teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          academic_year_id: string
          archived_at: string | null
          category_id: string | null
          code: string | null
          created_at: string
          description: string | null
          grading_system_id: string | null
          id: string
          is_archived: boolean | null
          name: string
          school_id: string
          subject_type: string | null
          updated_at: string
        }
        Insert: {
          academic_year_id: string
          archived_at?: string | null
          category_id?: string | null
          code?: string | null
          created_at?: string
          description?: string | null
          grading_system_id?: string | null
          id?: string
          is_archived?: boolean | null
          name: string
          school_id: string
          subject_type?: string | null
          updated_at?: string
        }
        Update: {
          academic_year_id?: string
          archived_at?: string | null
          category_id?: string | null
          code?: string | null
          created_at?: string
          description?: string | null
          grading_system_id?: string | null
          id?: string
          is_archived?: boolean | null
          name?: string
          school_id?: string
          subject_type?: string | null
          updated_at?: string
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
            foreignKeyName: "subjects_grading_system_id_fkey"
            columns: ["grading_system_id"]
            isOneToOne: false
            referencedRelation: "grading_systems"
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
      timetable_configurations: {
        Row: {
          academic_year_id: string
          batch_ids: string[] | null
          created_at: string | null
          default_periods: Json | null
          enable_flexible_timings: boolean | null
          fortnight_start_date: string | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          is_weekly_mode: boolean | null
          name: string
          school_id: string
          selected_days: string[] | null
          updated_at: string | null
        }
        Insert: {
          academic_year_id: string
          batch_ids?: string[] | null
          created_at?: string | null
          default_periods?: Json | null
          enable_flexible_timings?: boolean | null
          fortnight_start_date?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          is_weekly_mode?: boolean | null
          name: string
          school_id: string
          selected_days?: string[] | null
          updated_at?: string | null
        }
        Update: {
          academic_year_id?: string
          batch_ids?: string[] | null
          created_at?: string | null
          default_periods?: Json | null
          enable_flexible_timings?: boolean | null
          fortnight_start_date?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          is_weekly_mode?: boolean | null
          name?: string
          school_id?: string
          selected_days?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "timetable_configurations_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timetable_configurations_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      timetable_overrides: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          created_by: string
          date: string
          id: string
          new_end_time: string | null
          new_room_id: string | null
          new_start_time: string | null
          notes: string | null
          original_schedule_id: string
          override_type: string
          reason: string
          school_id: string
          status: string | null
          substitute_teacher_id: string | null
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          created_by: string
          date: string
          id?: string
          new_end_time?: string | null
          new_room_id?: string | null
          new_start_time?: string | null
          notes?: string | null
          original_schedule_id: string
          override_type: string
          reason: string
          school_id: string
          status?: string | null
          substitute_teacher_id?: string | null
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          created_by?: string
          date?: string
          id?: string
          new_end_time?: string | null
          new_room_id?: string | null
          new_start_time?: string | null
          notes?: string | null
          original_schedule_id?: string
          override_type?: string
          reason?: string
          school_id?: string
          status?: string | null
          substitute_teacher_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_timetable_overrides_approved_by"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_timetable_overrides_created_by"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_timetable_overrides_room"
            columns: ["new_room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_timetable_overrides_schedule"
            columns: ["original_schedule_id"]
            isOneToOne: false
            referencedRelation: "timetable_schedules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_timetable_overrides_school"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      timetable_schedules: {
        Row: {
          academic_year_id: string
          batch_id: string
          created_at: string | null
          day_of_week: string
          end_time: string
          fortnight_week: number | null
          id: string
          is_active: boolean | null
          period_number: number
          room_id: string | null
          school_id: string
          start_time: string
          subject_id: string
          teacher_id: string
          updated_at: string | null
          valid_from: string
          valid_to: string | null
        }
        Insert: {
          academic_year_id: string
          batch_id: string
          created_at?: string | null
          day_of_week: string
          end_time: string
          fortnight_week?: number | null
          id?: string
          is_active?: boolean | null
          period_number: number
          room_id?: string | null
          school_id: string
          start_time: string
          subject_id: string
          teacher_id: string
          updated_at?: string | null
          valid_from: string
          valid_to?: string | null
        }
        Update: {
          academic_year_id?: string
          batch_id?: string
          created_at?: string | null
          day_of_week?: string
          end_time?: string
          fortnight_week?: number | null
          id?: string
          is_active?: boolean | null
          period_number?: number
          room_id?: string | null
          school_id?: string
          start_time?: string
          subject_id?: string
          teacher_id?: string
          updated_at?: string | null
          valid_from?: string
          valid_to?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_timetable_schedules_academic_year"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_timetable_schedules_batch"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_timetable_schedules_room"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_timetable_schedules_school"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_timetable_schedules_subject"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      transfer_records: {
        Row: {
          created_at: string | null
          date: string
          from_batch_id: string | null
          id: string
          reason: string
          school_id: string
          status: string
          student_id: string
          tc_number: string | null
          to_batch_id: string | null
          to_school: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          from_batch_id?: string | null
          id?: string
          reason: string
          school_id: string
          status?: string
          student_id: string
          tc_number?: string | null
          to_batch_id?: string | null
          to_school?: string | null
          type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          from_batch_id?: string | null
          id?: string
          reason?: string
          school_id?: string
          status?: string
          student_id?: string
          tc_number?: string | null
          to_batch_id?: string | null
          to_school?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transfer_records_from_batch_id_fkey"
            columns: ["from_batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfer_records_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfer_records_to_batch_id_fkey"
            columns: ["to_batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          created_at: string | null
          id: string
          roles: string[] | null
          school_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          roles?: string[] | null
          school_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          roles?: string[] | null
          school_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      user_role_cache: {
        Row: {
          created_at: string | null
          id: string
          school_id: string | null
          updated_at: string | null
          user_id: string
          user_role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          created_at?: string | null
          id?: string
          school_id?: string | null
          updated_at?: string | null
          user_id: string
          user_role: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          created_at?: string | null
          id?: string
          school_id?: string | null
          updated_at?: string | null
          user_id?: string
          user_role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: [
          {
            foreignKeyName: "user_role_cache_school_id_fkey"
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
      add_student_v2: {
        Args: { p_data: Json }
        Returns: string
      }
      auto_confirm_email: {
        Args: { target_email: string }
        Returns: boolean
      }
      check_user_role: {
        Args:
          | {
              p_user_id: string
              p_role: Database["public"]["Enums"]["user_role"]
            }
          | {
              p_user_id: string
              p_school_id: string
              p_role: Database["public"]["Enums"]["user_role"]
            }
        Returns: boolean
      }
      create_academic_year: {
        Args: {
          p_name: string
          p_start_date: string
          p_end_date: string
          p_school_id: string
          p_is_active?: boolean
          p_is_archived?: boolean
        }
        Returns: {
          created_at: string
          end_date: string
          id: string
          is_current: boolean | null
          is_locked: boolean | null
          name: string
          school_id: string
          start_date: string
          updated_at: string
        }
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
      create_and_confirm_librarian_user: {
        Args: {
          librarian_email: string
          librarian_password: string
          librarian_first_name: string
          librarian_last_name: string
          librarian_school_id: string
        }
        Returns: string
      }
      create_and_confirm_staff_user: {
        Args: {
          staff_email: string
          staff_password: string
          staff_first_name: string
          staff_last_name: string
          staff_school_id: string
        }
        Returns: string
      }
      create_and_confirm_student_user: {
        Args: {
          student_email: string
          student_password: string
          student_first_name: string
          student_last_name: string
          student_school_id: string
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
      create_student_login: {
        Args: {
          p_email: string
          p_first_name: string
          p_last_name: string
          p_school_id: string
          p_password: string
          p_student_id: string
        }
        Returns: {
          user_id: string
          status: string
        }[]
      }
      create_student_profile: {
        Args: {
          p_user_id: string
          p_email: string
          p_first_name: string
          p_last_name: string
          p_school_id: string
          p_student_id: string
        }
        Returns: {
          user_id: string
          status: string
        }[]
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
      ensure_batch_students_table: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      execute_admin_sql: {
        Args: { sql: string }
        Returns: undefined
      }
      extract_base_day: {
        Args: { day_string: string }
        Returns: string
      }
      extract_day_name: {
        Args: { input_day: string }
        Returns: string
      }
      extract_week_number: {
        Args: { day_string: string }
        Returns: number
      }
      generate_admission_number: {
        Args: { p_school_id: string }
        Returns: string
      }
      get_auth_user_details: {
        Args: { p_user_id: string }
        Returns: Json
      }
      get_current_user_school_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_timetable_configuration: {
        Args: { p_config_id: string }
        Returns: Json
      }
      get_timetable_configurations: {
        Args: { p_school_id: string; p_academic_year_id: string }
        Returns: Json
      }
      get_user_highest_role: {
        Args: { p_user_id: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      get_user_metadata_by_email: {
        Args: { email_address: string }
        Returns: Json
      }
      get_user_primary_school: {
        Args: { p_user_id: string }
        Returns: string
      }
      get_user_primary_school_id: {
        Args: { p_user_id: string }
        Returns: string
      }
      get_user_profile: {
        Args: { p_user_id: string }
        Returns: {
          id: string
          email: string
          full_name: string
          avatar_url: string
          school_id: string
          role: Database["public"]["Enums"]["user_role"]
          created_at: string
          updated_at: string
        }[]
      }
      get_user_profile_roles: {
        Args: { p_user_id: string }
        Returns: {
          user_id: string
          school_id: string
          role: Database["public"]["Enums"]["user_role"]
          is_primary: boolean
        }[]
      }
      get_user_roles_bypass_rls: {
        Args: { p_user_id: string }
        Returns: {
          role_id: string
          user_id: string
          school_id: string
          role: Database["public"]["Enums"]["user_role"]
          is_primary: boolean
          created_at: string
          updated_at: string
        }[]
      }
      get_user_roles_for_school: {
        Args: { p_user_id: string; p_school_id: string }
        Returns: Database["public"]["Enums"]["user_role"][]
      }
      get_user_roles_in_school: {
        Args: { p_user_id: string; p_school_id: string }
        Returns: Database["public"]["Enums"]["user_role"][]
      }
      get_user_school_roles: {
        Args: { p_user_id: string; p_school_id: string }
        Returns: Database["public"]["Enums"]["user_role"][]
      }
      has_any_role_in_school: {
        Args: { p_user_id: string; p_school_id: string }
        Returns: boolean
      }
      has_role_in_school: {
        Args: {
          p_user_id: string
          p_school_id: string
          p_role: Database["public"]["Enums"]["user_role"]
        }
        Returns: boolean
      }
      is_email_confirmed: {
        Args: { email_address: string }
        Returns: boolean
      }
      is_librarian: {
        Args: { p_user_id: string; p_school_id: string }
        Returns: boolean
      }
      is_school_admin: {
        Args: { p_user_id: string; p_school_id: string }
        Returns: boolean
      }
      is_school_admin_bypass_rls: {
        Args: { p_user_id: string; p_school_id: string }
        Returns: boolean
      }
      is_school_admin_direct: {
        Args: { user_id: string; p_school_id: string }
        Returns: boolean
      }
      is_school_admin_no_rls: {
        Args: { p_user_id: string; p_school_id: string }
        Returns: boolean
      }
      is_super_admin: {
        Args: Record<PropertyKey, never> | { p_user_id: string }
        Returns: boolean
      }
      is_super_admin_bypass_rls: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      is_super_admin_direct: {
        Args: { user_id: string }
        Returns: boolean
      }
      manually_confirm_email: {
        Args: { email_address: string }
        Returns: boolean
      }
      manually_confirm_user_by_id: {
        Args: { user_id: string }
        Returns: boolean
      }
      refresh_user_role_cache: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      refresh_user_roles: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      save_timetable_configuration: {
        Args: {
          p_school_id: string
          p_name: string
          p_is_active: boolean
          p_is_default: boolean
          p_academic_year_id: string
          p_is_weekly_mode: boolean
          p_selected_days: string[]
          p_default_periods: Json
          p_fortnight_start_date?: string
          p_day_specific_periods?: Json
          p_enable_flexible_timings?: boolean
          p_batch_ids?: string[]
        }
        Returns: string
      }
      switch_primary_school: {
        Args: { p_school_id: string }
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
        Args:
          | {
              p_user_id: string
              p_email?: string
              p_phone?: string
              p_email_confirmed?: boolean
              p_phone_confirmed?: boolean
              p_banned?: boolean
              p_confirmation_token?: string
              p_confirmation_sent_at?: string
              p_instance_id?: string
              p_user_metadata?: Json
              p_app_metadata?: Json
            }
          | {
              p_user_id: string
              p_email?: string
              p_phone?: string
              p_email_confirmed?: boolean
              p_phone_confirmed?: boolean
              p_banned?: boolean
              p_user_metadata?: Json
              p_app_metadata?: Json
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
        | "staff"
        | "librarian"
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
        "staff",
        "librarian",
      ],
    },
  },
} as const
