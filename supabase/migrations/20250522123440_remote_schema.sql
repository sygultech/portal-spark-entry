create type "public"."user_role" as enum ('super_admin', 'school_admin', 'teacher', 'student', 'parent', 'staff');

create table "public"."academic_years" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "start_date" date not null,
    "end_date" date not null,
    "is_current" boolean default false,
    "is_locked" boolean default false,
    "school_id" uuid not null,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


create table "public"."batch_students" (
    "id" uuid not null default gen_random_uuid(),
    "batch_id" uuid not null,
    "student_id" uuid not null,
    "roll_number" text,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


create table "public"."batch_subjects" (
    "id" uuid not null default gen_random_uuid(),
    "batch_id" uuid not null,
    "subject_id" uuid not null,
    "is_mandatory" boolean not null default true,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


create table "public"."batches" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "code" text,
    "capacity" integer,
    "course_id" uuid not null,
    "class_teacher_id" uuid,
    "academic_year_id" uuid not null,
    "school_id" uuid not null,
    "is_archived" boolean default false,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "grading_system_id" uuid
);


create table "public"."certificates" (
    "id" uuid not null default gen_random_uuid(),
    "student_id" uuid not null,
    "type" character varying(50) not null,
    "template_id" character varying(100) not null,
    "issued_date" date not null default CURRENT_DATE,
    "valid_until" date,
    "serial_number" character varying(100) not null,
    "status" character varying(20) not null default 'draft'::character varying,
    "issued_by" uuid not null,
    "data" jsonb,
    "school_id" uuid not null,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


create table "public"."courses" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "code" text,
    "duration" integer,
    "duration_unit" text,
    "department_id" uuid,
    "academic_year_id" uuid not null,
    "school_id" uuid not null,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


create table "public"."departments" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "description" text,
    "school_id" uuid not null,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


create table "public"."disciplinary_evidence" (
    "id" uuid not null default gen_random_uuid(),
    "disciplinary_record_id" uuid not null,
    "type" character varying(50) not null,
    "file_path" text not null,
    "uploaded_at" timestamp with time zone default now(),
    "school_id" uuid not null
);


create table "public"."disciplinary_records" (
    "id" uuid not null default gen_random_uuid(),
    "student_id" uuid not null,
    "incident_type" character varying(100) not null,
    "description" text not null,
    "date" date not null,
    "severity" character varying(20) not null,
    "status" character varying(20) not null default 'pending'::character varying,
    "action_taken" text,
    "reported_by" uuid not null,
    "school_id" uuid not null,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


create table "public"."grade_thresholds" (
    "id" uuid not null default gen_random_uuid(),
    "grading_system_id" uuid not null,
    "grade" text not null,
    "name" text not null,
    "min_score" numeric not null,
    "max_score" numeric not null,
    "grade_point" numeric,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


create table "public"."grading_systems" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "type" text not null,
    "description" text,
    "passing_score" numeric not null,
    "school_id" uuid not null,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


create table "public"."guardians" (
    "id" uuid not null default gen_random_uuid(),
    "first_name" character varying(100) not null,
    "last_name" character varying(100),
    "relation" character varying(50) not null,
    "occupation" character varying(100),
    "email" character varying(255),
    "phone" character varying(20) not null,
    "address" text,
    "is_emergency_contact" boolean default false,
    "can_pickup" boolean default false,
    "school_id" uuid not null,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


create table "public"."parent_meetings" (
    "id" uuid not null default gen_random_uuid(),
    "disciplinary_record_id" uuid not null,
    "date" date not null,
    "attendees" text not null,
    "discussion" text not null,
    "outcome" text,
    "follow_up_date" date,
    "school_id" uuid not null,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


create table "public"."profiles" (
    "id" uuid not null,
    "first_name" text,
    "last_name" text,
    "email" text not null,
    "avatar_url" text,
    "school_id" uuid,
    "role" user_role not null,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


create table "public"."schools" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "domain" text,
    "admin_email" text,
    "contact_number" text,
    "region" text,
    "status" text,
    "timezone" text,
    "plan" text,
    "storage_limit" integer,
    "user_limit" integer,
    "modules" jsonb,
    "default_grading_system_id" uuid
);


create table "public"."student_categories" (
    "id" uuid not null default gen_random_uuid(),
    "name" character varying(100) not null,
    "description" text,
    "color" character varying(20),
    "school_id" uuid not null,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


create table "public"."student_category_assignments" (
    "id" uuid not null default gen_random_uuid(),
    "student_id" uuid not null,
    "category_id" uuid not null,
    "created_at" timestamp with time zone default now()
);


create table "public"."student_details" (
    "id" uuid not null,
    "admission_number" character varying(50) not null,
    "date_of_birth" date,
    "gender" character varying(10),
    "address" text,
    "batch_id" uuid,
    "nationality" character varying(100),
    "mother_tongue" character varying(50),
    "blood_group" character varying(5),
    "religion" character varying(50),
    "caste" character varying(50),
    "category" character varying(50),
    "phone" character varying(20),
    "previous_school_name" character varying(200),
    "previous_school_board" character varying(100),
    "previous_school_year" character varying(20),
    "previous_school_percentage" numeric(5,2),
    "tc_number" character varying(100),
    "admission_date" date default CURRENT_DATE,
    "status" character varying(20) default 'active'::character varying,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "school_id" uuid not null,
    "profile_id" uuid,
    "first_name" text not null default ''::text,
    "last_name" text not null default ''::text,
    "email" text
);


alter table "public"."student_details" enable row level security;

create table "public"."student_documents" (
    "id" uuid not null default gen_random_uuid(),
    "student_id" uuid not null,
    "name" character varying(100) not null,
    "type" character varying(50) not null,
    "description" text,
    "file_path" text not null,
    "upload_date" timestamp with time zone default now(),
    "verification_status" character varying(20) default 'pending'::character varying,
    "verified_by" uuid,
    "verification_date" timestamp with time zone,
    "school_id" uuid not null,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


create table "public"."student_guardians" (
    "id" uuid not null default gen_random_uuid(),
    "student_id" uuid not null,
    "guardian_id" uuid not null,
    "is_primary" boolean default false,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


create table "public"."subject_categories" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "description" text,
    "school_id" uuid not null,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


create table "public"."subject_teachers" (
    "id" uuid not null default gen_random_uuid(),
    "subject_id" uuid not null,
    "teacher_id" uuid not null,
    "batch_id" uuid not null,
    "academic_year_id" uuid not null,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


create table "public"."subject_time_slots" (
    "id" uuid not null default gen_random_uuid(),
    "subject_teacher_id" uuid not null,
    "day_of_week" integer,
    "start_time" time without time zone not null,
    "end_time" time without time zone not null,
    "room_number" text,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


create table "public"."subjects" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "code" text,
    "description" text,
    "category_id" uuid,
    "subject_type" text,
    "academic_year_id" uuid not null,
    "school_id" uuid not null,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "grading_system_id" uuid,
    "is_archived" boolean default false,
    "archived_at" timestamp with time zone
);


create table "public"."transfer_records" (
    "id" uuid not null default gen_random_uuid(),
    "student_id" uuid not null,
    "type" character varying(20) not null,
    "date" date not null,
    "from_batch_id" uuid,
    "to_batch_id" uuid,
    "to_school" character varying(200),
    "reason" text not null,
    "tc_number" character varying(100),
    "status" character varying(20) not null default 'pending'::character varying,
    "school_id" uuid not null,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


create table "public"."user_role_cache" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "school_id" uuid,
    "user_role" user_role not null,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


CREATE INDEX academic_years_is_current_idx ON public.academic_years USING btree (is_current);

CREATE UNIQUE INDEX academic_years_pkey ON public.academic_years USING btree (id);

CREATE INDEX academic_years_school_id_idx ON public.academic_years USING btree (school_id);

CREATE INDEX batch_students_batch_id_idx ON public.batch_students USING btree (batch_id);

CREATE UNIQUE INDEX batch_students_batch_id_student_id_key ON public.batch_students USING btree (batch_id, student_id);

CREATE UNIQUE INDEX batch_students_pkey ON public.batch_students USING btree (id);

CREATE INDEX batch_students_student_id_idx ON public.batch_students USING btree (student_id);

CREATE INDEX batch_subjects_batch_id_idx ON public.batch_subjects USING btree (batch_id);

CREATE UNIQUE INDEX batch_subjects_batch_id_subject_id_key ON public.batch_subjects USING btree (batch_id, subject_id);

CREATE UNIQUE INDEX batch_subjects_pkey ON public.batch_subjects USING btree (id);

CREATE INDEX batch_subjects_subject_id_idx ON public.batch_subjects USING btree (subject_id);

CREATE INDEX batches_academic_year_id_idx ON public.batches USING btree (academic_year_id);

CREATE INDEX batches_class_teacher_id_idx ON public.batches USING btree (class_teacher_id);

CREATE INDEX batches_course_id_idx ON public.batches USING btree (course_id);

CREATE UNIQUE INDEX batches_pkey ON public.batches USING btree (id);

CREATE INDEX batches_school_id_idx ON public.batches USING btree (school_id);

CREATE UNIQUE INDEX certificates_pkey ON public.certificates USING btree (id);

CREATE INDEX courses_academic_year_id_idx ON public.courses USING btree (academic_year_id);

CREATE INDEX courses_department_id_idx ON public.courses USING btree (department_id);

CREATE UNIQUE INDEX courses_pkey ON public.courses USING btree (id);

CREATE INDEX courses_school_id_idx ON public.courses USING btree (school_id);

CREATE UNIQUE INDEX departments_pkey ON public.departments USING btree (id);

CREATE INDEX departments_school_id_idx ON public.departments USING btree (school_id);

CREATE UNIQUE INDEX disciplinary_evidence_pkey ON public.disciplinary_evidence USING btree (id);

CREATE UNIQUE INDEX disciplinary_records_pkey ON public.disciplinary_records USING btree (id);

CREATE UNIQUE INDEX grade_thresholds_pkey ON public.grade_thresholds USING btree (id);

CREATE UNIQUE INDEX grading_systems_pkey ON public.grading_systems USING btree (id);

CREATE UNIQUE INDEX guardians_pkey ON public.guardians USING btree (id);

CREATE INDEX idx_student_details_batch_id ON public.student_details USING btree (batch_id);

CREATE INDEX idx_student_details_profile_id ON public.student_details USING btree (profile_id);

CREATE INDEX idx_student_details_school_id ON public.student_details USING btree (school_id);

CREATE INDEX idx_subjects_is_archived ON public.subjects USING btree (is_archived);

CREATE UNIQUE INDEX parent_meetings_pkey ON public.parent_meetings USING btree (id);

CREATE UNIQUE INDEX profiles_pkey ON public.profiles USING btree (id);

CREATE UNIQUE INDEX schools_pkey ON public.schools USING btree (id);

CREATE UNIQUE INDEX student_categories_name_school_id_key ON public.student_categories USING btree (name, school_id);

CREATE UNIQUE INDEX student_categories_pkey ON public.student_categories USING btree (id);

CREATE UNIQUE INDEX student_category_assignments_pkey ON public.student_category_assignments USING btree (id);

CREATE UNIQUE INDEX student_category_assignments_student_id_category_id_key ON public.student_category_assignments USING btree (student_id, category_id);

CREATE UNIQUE INDEX student_details_email_unique_idx ON public.student_details USING btree (email) WHERE (email IS NOT NULL);

CREATE UNIQUE INDEX student_details_pkey ON public.student_details USING btree (id);

CREATE UNIQUE INDEX student_documents_pkey ON public.student_documents USING btree (id);

CREATE UNIQUE INDEX student_guardians_pkey ON public.student_guardians USING btree (id);

CREATE UNIQUE INDEX student_guardians_student_id_guardian_id_key ON public.student_guardians USING btree (student_id, guardian_id);

CREATE UNIQUE INDEX subject_categories_pkey ON public.subject_categories USING btree (id);

CREATE INDEX subject_teachers_batch_id_idx ON public.subject_teachers USING btree (batch_id);

CREATE UNIQUE INDEX subject_teachers_pkey ON public.subject_teachers USING btree (id);

CREATE INDEX subject_teachers_subject_id_idx ON public.subject_teachers USING btree (subject_id);

CREATE UNIQUE INDEX subject_teachers_subject_id_teacher_id_batch_id_key ON public.subject_teachers USING btree (subject_id, teacher_id, batch_id);

CREATE INDEX subject_teachers_teacher_id_idx ON public.subject_teachers USING btree (teacher_id);

CREATE UNIQUE INDEX subject_time_slots_pkey ON public.subject_time_slots USING btree (id);

CREATE INDEX subject_time_slots_subject_teacher_id_idx ON public.subject_time_slots USING btree (subject_teacher_id);

CREATE INDEX subjects_academic_year_id_idx ON public.subjects USING btree (academic_year_id);

CREATE INDEX subjects_category_id_idx ON public.subjects USING btree (category_id);

CREATE UNIQUE INDEX subjects_pkey ON public.subjects USING btree (id);

CREATE INDEX subjects_school_id_idx ON public.subjects USING btree (school_id);

CREATE UNIQUE INDEX transfer_records_pkey ON public.transfer_records USING btree (id);

CREATE UNIQUE INDEX user_role_cache_pkey ON public.user_role_cache USING btree (id);

CREATE UNIQUE INDEX user_role_cache_user_id_school_id_user_role_key ON public.user_role_cache USING btree (user_id, school_id, user_role);

alter table "public"."academic_years" add constraint "academic_years_pkey" PRIMARY KEY using index "academic_years_pkey";

alter table "public"."batch_students" add constraint "batch_students_pkey" PRIMARY KEY using index "batch_students_pkey";

alter table "public"."batch_subjects" add constraint "batch_subjects_pkey" PRIMARY KEY using index "batch_subjects_pkey";

alter table "public"."batches" add constraint "batches_pkey" PRIMARY KEY using index "batches_pkey";

alter table "public"."certificates" add constraint "certificates_pkey" PRIMARY KEY using index "certificates_pkey";

alter table "public"."courses" add constraint "courses_pkey" PRIMARY KEY using index "courses_pkey";

alter table "public"."departments" add constraint "departments_pkey" PRIMARY KEY using index "departments_pkey";

alter table "public"."disciplinary_evidence" add constraint "disciplinary_evidence_pkey" PRIMARY KEY using index "disciplinary_evidence_pkey";

alter table "public"."disciplinary_records" add constraint "disciplinary_records_pkey" PRIMARY KEY using index "disciplinary_records_pkey";

alter table "public"."grade_thresholds" add constraint "grade_thresholds_pkey" PRIMARY KEY using index "grade_thresholds_pkey";

alter table "public"."grading_systems" add constraint "grading_systems_pkey" PRIMARY KEY using index "grading_systems_pkey";

alter table "public"."guardians" add constraint "guardians_pkey" PRIMARY KEY using index "guardians_pkey";

alter table "public"."parent_meetings" add constraint "parent_meetings_pkey" PRIMARY KEY using index "parent_meetings_pkey";

alter table "public"."profiles" add constraint "profiles_pkey" PRIMARY KEY using index "profiles_pkey";

alter table "public"."schools" add constraint "schools_pkey" PRIMARY KEY using index "schools_pkey";

alter table "public"."student_categories" add constraint "student_categories_pkey" PRIMARY KEY using index "student_categories_pkey";

alter table "public"."student_category_assignments" add constraint "student_category_assignments_pkey" PRIMARY KEY using index "student_category_assignments_pkey";

alter table "public"."student_details" add constraint "student_details_pkey" PRIMARY KEY using index "student_details_pkey";

alter table "public"."student_documents" add constraint "student_documents_pkey" PRIMARY KEY using index "student_documents_pkey";

alter table "public"."student_guardians" add constraint "student_guardians_pkey" PRIMARY KEY using index "student_guardians_pkey";

alter table "public"."subject_categories" add constraint "subject_categories_pkey" PRIMARY KEY using index "subject_categories_pkey";

alter table "public"."subject_teachers" add constraint "subject_teachers_pkey" PRIMARY KEY using index "subject_teachers_pkey";

alter table "public"."subject_time_slots" add constraint "subject_time_slots_pkey" PRIMARY KEY using index "subject_time_slots_pkey";

alter table "public"."subjects" add constraint "subjects_pkey" PRIMARY KEY using index "subjects_pkey";

alter table "public"."transfer_records" add constraint "transfer_records_pkey" PRIMARY KEY using index "transfer_records_pkey";

alter table "public"."user_role_cache" add constraint "user_role_cache_pkey" PRIMARY KEY using index "user_role_cache_pkey";

alter table "public"."academic_years" add constraint "academic_years_school_id_fkey" FOREIGN KEY (school_id) REFERENCES schools(id) not valid;

alter table "public"."academic_years" validate constraint "academic_years_school_id_fkey";

alter table "public"."academic_years" add constraint "start_before_end" CHECK ((start_date < end_date)) not valid;

alter table "public"."academic_years" validate constraint "start_before_end";

alter table "public"."batch_students" add constraint "batch_students_batch_id_fkey" FOREIGN KEY (batch_id) REFERENCES batches(id) not valid;

alter table "public"."batch_students" validate constraint "batch_students_batch_id_fkey";

alter table "public"."batch_students" add constraint "batch_students_batch_id_student_id_key" UNIQUE using index "batch_students_batch_id_student_id_key";

alter table "public"."batch_students" add constraint "batch_students_student_id_fkey" FOREIGN KEY (student_id) REFERENCES profiles(id) not valid;

alter table "public"."batch_students" validate constraint "batch_students_student_id_fkey";

alter table "public"."batch_subjects" add constraint "batch_subjects_batch_id_fkey" FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE CASCADE not valid;

alter table "public"."batch_subjects" validate constraint "batch_subjects_batch_id_fkey";

alter table "public"."batch_subjects" add constraint "batch_subjects_batch_id_subject_id_key" UNIQUE using index "batch_subjects_batch_id_subject_id_key";

alter table "public"."batch_subjects" add constraint "batch_subjects_subject_id_fkey" FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE not valid;

alter table "public"."batch_subjects" validate constraint "batch_subjects_subject_id_fkey";

alter table "public"."batches" add constraint "batches_academic_year_id_fkey" FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) not valid;

alter table "public"."batches" validate constraint "batches_academic_year_id_fkey";

alter table "public"."batches" add constraint "batches_class_teacher_id_fkey" FOREIGN KEY (class_teacher_id) REFERENCES profiles(id) not valid;

alter table "public"."batches" validate constraint "batches_class_teacher_id_fkey";

alter table "public"."batches" add constraint "batches_course_id_fkey" FOREIGN KEY (course_id) REFERENCES courses(id) not valid;

alter table "public"."batches" validate constraint "batches_course_id_fkey";

alter table "public"."batches" add constraint "batches_grading_system_id_fkey" FOREIGN KEY (grading_system_id) REFERENCES grading_systems(id) not valid;

alter table "public"."batches" validate constraint "batches_grading_system_id_fkey";

alter table "public"."batches" add constraint "batches_school_id_fkey" FOREIGN KEY (school_id) REFERENCES schools(id) not valid;

alter table "public"."batches" validate constraint "batches_school_id_fkey";

alter table "public"."certificates" add constraint "certificates_issued_by_fkey" FOREIGN KEY (issued_by) REFERENCES auth.users(id) not valid;

alter table "public"."certificates" validate constraint "certificates_issued_by_fkey";

alter table "public"."certificates" add constraint "certificates_school_id_fkey" FOREIGN KEY (school_id) REFERENCES schools(id) not valid;

alter table "public"."certificates" validate constraint "certificates_school_id_fkey";

alter table "public"."certificates" add constraint "certificates_status_check" CHECK (((status)::text = ANY ((ARRAY['draft'::character varying, 'issued'::character varying, 'revoked'::character varying])::text[]))) not valid;

alter table "public"."certificates" validate constraint "certificates_status_check";

alter table "public"."courses" add constraint "courses_academic_year_id_fkey" FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) not valid;

alter table "public"."courses" validate constraint "courses_academic_year_id_fkey";

alter table "public"."courses" add constraint "courses_department_id_fkey" FOREIGN KEY (department_id) REFERENCES departments(id) not valid;

alter table "public"."courses" validate constraint "courses_department_id_fkey";

alter table "public"."courses" add constraint "courses_duration_unit_check" CHECK ((duration_unit = ANY (ARRAY['years'::text, 'months'::text, 'days'::text]))) not valid;

alter table "public"."courses" validate constraint "courses_duration_unit_check";

alter table "public"."courses" add constraint "courses_school_id_fkey" FOREIGN KEY (school_id) REFERENCES schools(id) not valid;

alter table "public"."courses" validate constraint "courses_school_id_fkey";

alter table "public"."departments" add constraint "departments_school_id_fkey" FOREIGN KEY (school_id) REFERENCES schools(id) not valid;

alter table "public"."departments" validate constraint "departments_school_id_fkey";

alter table "public"."disciplinary_evidence" add constraint "disciplinary_evidence_disciplinary_record_id_fkey" FOREIGN KEY (disciplinary_record_id) REFERENCES disciplinary_records(id) ON DELETE CASCADE not valid;

alter table "public"."disciplinary_evidence" validate constraint "disciplinary_evidence_disciplinary_record_id_fkey";

alter table "public"."disciplinary_evidence" add constraint "disciplinary_evidence_school_id_fkey" FOREIGN KEY (school_id) REFERENCES schools(id) not valid;

alter table "public"."disciplinary_evidence" validate constraint "disciplinary_evidence_school_id_fkey";

alter table "public"."disciplinary_records" add constraint "disciplinary_records_reported_by_fkey" FOREIGN KEY (reported_by) REFERENCES auth.users(id) not valid;

alter table "public"."disciplinary_records" validate constraint "disciplinary_records_reported_by_fkey";

alter table "public"."disciplinary_records" add constraint "disciplinary_records_school_id_fkey" FOREIGN KEY (school_id) REFERENCES schools(id) not valid;

alter table "public"."disciplinary_records" validate constraint "disciplinary_records_school_id_fkey";

alter table "public"."disciplinary_records" add constraint "disciplinary_records_severity_check" CHECK (((severity)::text = ANY ((ARRAY['minor'::character varying, 'moderate'::character varying, 'severe'::character varying])::text[]))) not valid;

alter table "public"."disciplinary_records" validate constraint "disciplinary_records_severity_check";

alter table "public"."disciplinary_records" add constraint "disciplinary_records_status_check" CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'resolved'::character varying, 'escalated'::character varying])::text[]))) not valid;

alter table "public"."disciplinary_records" validate constraint "disciplinary_records_status_check";

alter table "public"."grade_thresholds" add constraint "grade_thresholds_grading_system_id_fkey" FOREIGN KEY (grading_system_id) REFERENCES grading_systems(id) ON DELETE CASCADE not valid;

alter table "public"."grade_thresholds" validate constraint "grade_thresholds_grading_system_id_fkey";

alter table "public"."grading_systems" add constraint "grading_systems_school_id_fkey" FOREIGN KEY (school_id) REFERENCES schools(id) not valid;

alter table "public"."grading_systems" validate constraint "grading_systems_school_id_fkey";

alter table "public"."grading_systems" add constraint "grading_systems_type_check" CHECK ((type = ANY (ARRAY['marks'::text, 'grades'::text, 'hybrid'::text]))) not valid;

alter table "public"."grading_systems" validate constraint "grading_systems_type_check";

alter table "public"."guardians" add constraint "guardians_school_id_fkey" FOREIGN KEY (school_id) REFERENCES schools(id) not valid;

alter table "public"."guardians" validate constraint "guardians_school_id_fkey";

alter table "public"."parent_meetings" add constraint "parent_meetings_disciplinary_record_id_fkey" FOREIGN KEY (disciplinary_record_id) REFERENCES disciplinary_records(id) ON DELETE CASCADE not valid;

alter table "public"."parent_meetings" validate constraint "parent_meetings_disciplinary_record_id_fkey";

alter table "public"."parent_meetings" add constraint "parent_meetings_school_id_fkey" FOREIGN KEY (school_id) REFERENCES schools(id) not valid;

alter table "public"."parent_meetings" validate constraint "parent_meetings_school_id_fkey";

alter table "public"."profiles" add constraint "profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."profiles" validate constraint "profiles_id_fkey";

alter table "public"."profiles" add constraint "profiles_school_id_fkey" FOREIGN KEY (school_id) REFERENCES schools(id) not valid;

alter table "public"."profiles" validate constraint "profiles_school_id_fkey";

alter table "public"."schools" add constraint "schools_default_grading_system_id_fkey" FOREIGN KEY (default_grading_system_id) REFERENCES grading_systems(id) not valid;

alter table "public"."schools" validate constraint "schools_default_grading_system_id_fkey";

alter table "public"."student_categories" add constraint "student_categories_name_school_id_key" UNIQUE using index "student_categories_name_school_id_key";

alter table "public"."student_categories" add constraint "student_categories_school_id_fkey" FOREIGN KEY (school_id) REFERENCES schools(id) not valid;

alter table "public"."student_categories" validate constraint "student_categories_school_id_fkey";

alter table "public"."student_category_assignments" add constraint "student_category_assignments_category_id_fkey" FOREIGN KEY (category_id) REFERENCES student_categories(id) ON DELETE CASCADE not valid;

alter table "public"."student_category_assignments" validate constraint "student_category_assignments_category_id_fkey";

alter table "public"."student_category_assignments" add constraint "student_category_assignments_student_id_category_id_key" UNIQUE using index "student_category_assignments_student_id_category_id_key";

alter table "public"."student_details" add constraint "student_details_batch_id_fkey" FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE SET NULL not valid;

alter table "public"."student_details" validate constraint "student_details_batch_id_fkey";

alter table "public"."student_details" add constraint "student_details_gender_check" CHECK (((gender)::text = ANY (ARRAY[('male'::character varying)::text, ('female'::character varying)::text, ('other'::character varying)::text]))) not valid;

alter table "public"."student_details" validate constraint "student_details_gender_check";

alter table "public"."student_details" add constraint "student_details_profile_id_fkey" FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE SET NULL not valid;

alter table "public"."student_details" validate constraint "student_details_profile_id_fkey";

alter table "public"."student_details" add constraint "student_details_school_id_fkey" FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE not valid;

alter table "public"."student_details" validate constraint "student_details_school_id_fkey";

alter table "public"."student_details" add constraint "student_details_status_check" CHECK (((status)::text = ANY (ARRAY[('active'::character varying)::text, ('transferred'::character varying)::text, ('graduated'::character varying)::text, ('inactive'::character varying)::text]))) not valid;

alter table "public"."student_details" validate constraint "student_details_status_check";

alter table "public"."student_documents" add constraint "student_documents_school_id_fkey" FOREIGN KEY (school_id) REFERENCES schools(id) not valid;

alter table "public"."student_documents" validate constraint "student_documents_school_id_fkey";

alter table "public"."student_documents" add constraint "student_documents_verification_status_check" CHECK (((verification_status)::text = ANY ((ARRAY['pending'::character varying, 'verified'::character varying, 'rejected'::character varying])::text[]))) not valid;

alter table "public"."student_documents" validate constraint "student_documents_verification_status_check";

alter table "public"."student_documents" add constraint "student_documents_verified_by_fkey" FOREIGN KEY (verified_by) REFERENCES auth.users(id) not valid;

alter table "public"."student_documents" validate constraint "student_documents_verified_by_fkey";

alter table "public"."student_guardians" add constraint "student_guardians_guardian_id_fkey" FOREIGN KEY (guardian_id) REFERENCES guardians(id) ON DELETE CASCADE not valid;

alter table "public"."student_guardians" validate constraint "student_guardians_guardian_id_fkey";

alter table "public"."student_guardians" add constraint "student_guardians_student_id_guardian_id_key" UNIQUE using index "student_guardians_student_id_guardian_id_key";

alter table "public"."subject_categories" add constraint "subject_categories_school_id_fkey" FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE not valid;

alter table "public"."subject_categories" validate constraint "subject_categories_school_id_fkey";

alter table "public"."subject_teachers" add constraint "subject_teachers_academic_year_id_fkey" FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE not valid;

alter table "public"."subject_teachers" validate constraint "subject_teachers_academic_year_id_fkey";

alter table "public"."subject_teachers" add constraint "subject_teachers_batch_id_fkey" FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE CASCADE not valid;

alter table "public"."subject_teachers" validate constraint "subject_teachers_batch_id_fkey";

alter table "public"."subject_teachers" add constraint "subject_teachers_subject_id_fkey" FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE not valid;

alter table "public"."subject_teachers" validate constraint "subject_teachers_subject_id_fkey";

alter table "public"."subject_teachers" add constraint "subject_teachers_subject_id_teacher_id_batch_id_key" UNIQUE using index "subject_teachers_subject_id_teacher_id_batch_id_key";

alter table "public"."subject_teachers" add constraint "subject_teachers_teacher_id_fkey" FOREIGN KEY (teacher_id) REFERENCES profiles(id) ON DELETE CASCADE not valid;

alter table "public"."subject_teachers" validate constraint "subject_teachers_teacher_id_fkey";

alter table "public"."subject_time_slots" add constraint "subject_time_slots_day_of_week_check" CHECK (((day_of_week >= 0) AND (day_of_week <= 6))) not valid;

alter table "public"."subject_time_slots" validate constraint "subject_time_slots_day_of_week_check";

alter table "public"."subject_time_slots" add constraint "subject_time_slots_subject_teacher_id_fkey" FOREIGN KEY (subject_teacher_id) REFERENCES subject_teachers(id) ON DELETE CASCADE not valid;

alter table "public"."subject_time_slots" validate constraint "subject_time_slots_subject_teacher_id_fkey";

alter table "public"."subjects" add constraint "subjects_academic_year_id_fkey" FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE not valid;

alter table "public"."subjects" validate constraint "subjects_academic_year_id_fkey";

alter table "public"."subjects" add constraint "subjects_category_id_fkey" FOREIGN KEY (category_id) REFERENCES subject_categories(id) ON DELETE SET NULL not valid;

alter table "public"."subjects" validate constraint "subjects_category_id_fkey";

alter table "public"."subjects" add constraint "subjects_grading_system_id_fkey" FOREIGN KEY (grading_system_id) REFERENCES grading_systems(id) not valid;

alter table "public"."subjects" validate constraint "subjects_grading_system_id_fkey";

alter table "public"."subjects" add constraint "subjects_school_id_fkey" FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE not valid;

alter table "public"."subjects" validate constraint "subjects_school_id_fkey";

alter table "public"."subjects" add constraint "subjects_subject_type_check" CHECK ((subject_type = ANY (ARRAY['core'::text, 'elective'::text, 'activity-based'::text, 'language'::text, 'other'::text]))) not valid;

alter table "public"."subjects" validate constraint "subjects_subject_type_check";

alter table "public"."transfer_records" add constraint "transfer_records_from_batch_id_fkey" FOREIGN KEY (from_batch_id) REFERENCES batches(id) not valid;

alter table "public"."transfer_records" validate constraint "transfer_records_from_batch_id_fkey";

alter table "public"."transfer_records" add constraint "transfer_records_school_id_fkey" FOREIGN KEY (school_id) REFERENCES schools(id) not valid;

alter table "public"."transfer_records" validate constraint "transfer_records_school_id_fkey";

alter table "public"."transfer_records" add constraint "transfer_records_status_check" CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'approved'::character varying, 'rejected'::character varying, 'completed'::character varying])::text[]))) not valid;

alter table "public"."transfer_records" validate constraint "transfer_records_status_check";

alter table "public"."transfer_records" add constraint "transfer_records_to_batch_id_fkey" FOREIGN KEY (to_batch_id) REFERENCES batches(id) not valid;

alter table "public"."transfer_records" validate constraint "transfer_records_to_batch_id_fkey";

alter table "public"."transfer_records" add constraint "transfer_records_type_check" CHECK (((type)::text = ANY ((ARRAY['internal'::character varying, 'external'::character varying])::text[]))) not valid;

alter table "public"."transfer_records" validate constraint "transfer_records_type_check";

alter table "public"."user_role_cache" add constraint "user_role_cache_school_id_fkey" FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE not valid;

alter table "public"."user_role_cache" validate constraint "user_role_cache_school_id_fkey";

alter table "public"."user_role_cache" add constraint "user_role_cache_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."user_role_cache" validate constraint "user_role_cache_user_id_fkey";

alter table "public"."user_role_cache" add constraint "user_role_cache_user_id_school_id_user_role_key" UNIQUE using index "user_role_cache_user_id_school_id_user_role_key";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.add_student_v2(p_data jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    v_student_id uuid;
BEGIN
    -- Generate a new UUID for the student
    v_student_id := gen_random_uuid();

    -- Check if email is provided and if it already exists
    IF p_data->>'email' IS NOT NULL AND p_data->>'email' != '' THEN
        IF EXISTS (
            SELECT 1 
            FROM public.student_details 
            WHERE email = p_data->>'email'
        ) THEN
            RAISE EXCEPTION 'Student with email % already exists', p_data->>'email';
        END IF;
    END IF;

    -- Insert the student record
    INSERT INTO public.student_details (
        id,
        admission_number,
        school_id,
        gender,
        batch_id,
        first_name,
        last_name,
        email,
        date_of_birth,
        address,
        nationality,
        mother_tongue,
        blood_group,
        religion,
        caste,
        category,
        phone,
        previous_school_name,
        previous_school_board,
        previous_school_year,
        previous_school_percentage,
        status,
        admission_date,
        created_at,
        updated_at
    ) VALUES (
        v_student_id,
        p_data->>'admission_number',
        (p_data->>'school_id')::uuid,
        p_data->>'gender',
        (p_data->>'batch_id')::uuid,
        p_data->>'first_name',
        p_data->>'last_name',
        NULLIF(p_data->>'email', ''),
        NULLIF(p_data->>'date_of_birth', '')::date,
        NULLIF(p_data->>'address', ''),
        NULLIF(p_data->>'nationality', ''),
        NULLIF(p_data->>'mother_tongue', ''),
        NULLIF(p_data->>'blood_group', ''),
        NULLIF(p_data->>'religion', ''),
        NULLIF(p_data->>'caste', ''),
        NULLIF(p_data->>'category', ''),
        NULLIF(p_data->>'phone', ''),
        NULLIF(p_data->>'previous_school_name', ''),
        NULLIF(p_data->>'previous_school_board', ''),
        NULLIF(p_data->>'previous_school_year', ''),
        NULLIF(p_data->>'previous_school_percentage', '')::numeric,
        'active',
        CURRENT_DATE,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    )
    RETURNING id INTO v_student_id;

    RETURN v_student_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.auto_confirm_email(target_email text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  is_admin BOOLEAN;
  user_id UUID;
BEGIN
  -- Get the user ID
  SELECT id INTO user_id FROM auth.users WHERE email = target_email;
  
  -- Check if the user is a school admin in any school
  SELECT EXISTS (
    SELECT 1 FROM public.user_school_roles
    WHERE user_id = user_id AND role = 'school_admin'
  ) INTO is_admin;
  
  -- Only auto-confirm for school admins 
  IF is_admin THEN
    -- Set the email_confirmed_at field
    UPDATE auth.users
    SET email_confirmed_at = now()
    WHERE id = user_id AND (email_confirmed_at IS NULL);
    
    RETURN TRUE;
  END IF;
  
  -- Return false if not a school admin
  RETURN FALSE;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.check_user_role(p_user_id uuid, p_role user_role)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    -- Check if the requesting user has permission to check roles
    IF NOT (
        auth.uid() = p_user_id -- user checking their own role
        OR EXISTS ( -- school admin checking user in their school
            SELECT 1 FROM user_school_roles usr
            WHERE usr.user_id = auth.uid()
            AND usr.role = 'school_admin'
            AND usr.school_id IN (
                SELECT school_id FROM user_school_roles
                WHERE user_id = p_user_id
            )
        )
        OR EXISTS ( -- super admin can check any role
            SELECT 1 FROM user_school_roles usr
            WHERE usr.user_id = auth.uid()
            AND usr.role = 'super_admin'
        )
    ) THEN
        RAISE EXCEPTION 'Unauthorized to check roles for this user';
    END IF;

    RETURN EXISTS (
        SELECT 1
        FROM user_school_roles
        WHERE user_id = p_user_id
        AND role = p_role
    );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.check_user_role(p_user_id uuid, p_school_id uuid, p_role user_role)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM public.user_role_cache
        WHERE user_id = p_user_id
        AND school_id = p_school_id
        AND role = p_role
    );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.create_academic_year(p_name text, p_start_date date, p_end_date date, p_school_id uuid, p_is_active boolean DEFAULT false, p_is_archived boolean DEFAULT false)
 RETURNS academic_years
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_academic_year academic_years;
BEGIN
  -- Insert the new academic year with explicit table qualification
  INSERT INTO academic_years (
    name,
    start_date,
    end_date,
    school_id,
    is_active,
    is_archived,
    created_at,
    updated_at
  ) VALUES (
    p_name,
    p_start_date,
    p_end_date,
    p_school_id,
    p_is_active,
    p_is_archived,
    NOW(),
    NOW()
  )
  RETURNING * INTO v_academic_year;

  -- Return the created academic year
  RETURN v_academic_year;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.create_and_confirm_admin_user(admin_email text, admin_password text, admin_first_name text, admin_last_name text, admin_school_id uuid)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  new_user_id UUID;
BEGIN
  -- Insert the user into auth.users with email_confirmed_at already set
  -- Note: We've removed the instance_id field since it doesn't exist
  INSERT INTO auth.users (
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
  )
  VALUES (
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    admin_email,
    crypt(admin_password, gen_salt('bf')),
    now(),  -- Set email_confirmed_at to current time
    NULL,
    NULL,
    '{"provider":"email","providers":["email"]}',
    jsonb_build_object(
      'first_name', admin_first_name,
      'last_name', admin_last_name,
      'role', 'school_admin',
      'school_id', admin_school_id
    ),
    now(),
    now()
  )
  RETURNING id INTO new_user_id;

  -- Return the new user ID as text
  RETURN new_user_id::text;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.create_and_confirm_student_user(student_email text, student_password text, student_first_name text, student_last_name text, student_school_id uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
DECLARE
  new_user_id uuid;
BEGIN
  -- Log basic info
  RAISE NOTICE 'Creating student user with email: %', student_email;

  -- Step 1: Create auth user
  INSERT INTO auth.users (
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
  )
  VALUES (
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    student_email,
    student_password, -- Supabase Auth will handle the hashing
    now(),
    NULL,
    NULL,
    '{"provider":"email","providers":["email"]}',
    jsonb_build_object(
      'first_name', student_first_name,
      'last_name', student_last_name,
      'role', 'student',
      'school_id', student_school_id
    ),
    now(),
    now()
  )
  RETURNING id INTO new_user_id;

  RAISE NOTICE 'Created auth user with ID: %', new_user_id;

  -- Step 2: Create profile
  INSERT INTO public.profiles (
    id,
    email,
    first_name,
    last_name,
    role,
    school_id,
    created_at,
    updated_at
  )
  VALUES (
    new_user_id,
    student_email,
    student_first_name,
    student_last_name,
    'student',
    student_school_id,
    now(),
    now()
  );

  RAISE NOTICE 'Created profile for user: %', new_user_id;
  
  RETURN new_user_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.create_profile_for_existing_user(user_id uuid, user_email text, user_role user_role DEFAULT 'student'::user_role)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  user_metadata JSONB;
  first_name TEXT;
  last_name TEXT;
  school_id UUID;
  role_from_metadata user_role;
BEGIN
  -- Get user metadata
  SELECT raw_user_meta_data INTO user_metadata
  FROM auth.users
  WHERE id = user_id;
  
  -- Extract first name and last name
  first_name := user_metadata->>'first_name';
  last_name := user_metadata->>'last_name';
  
  -- Extract role if available in metadata (with security validation)
  BEGIN
    role_from_metadata := (user_metadata->>'role')::user_role;
    
    -- Security check: Only allow school_admin role if explicitly set in auth metadata
    IF role_from_metadata = 'school_admin'::user_role THEN
      user_role := 'school_admin'::user_role;
    ELSIF role_from_metadata = 'super_admin'::user_role THEN
      user_role := 'super_admin'::user_role;
    ELSE
      -- Default to specified role or 'student'
      user_role := user_role;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    -- If role in metadata is invalid, use the provided default
    user_role := user_role;
  END;
  
  -- Extract school_id if available
  BEGIN
    school_id := (user_metadata->>'school_id')::UUID;
  EXCEPTION WHEN OTHERS THEN
    school_id := NULL;
  END;
  
  -- If first_name is still null, use part of email
  IF first_name IS NULL THEN
    first_name := split_part(user_email, '@', 1);
  END IF;
  
  -- Create or update profile
  INSERT INTO public.profiles (
    id, 
    email, 
    first_name, 
    last_name, 
    role,
    school_id
  ) 
  VALUES (
    user_id, 
    user_email, 
    first_name, 
    last_name, 
    user_role,
    school_id
  )
  ON CONFLICT (id) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    role = EXCLUDED.role,
    school_id = EXCLUDED.school_id;
    
  RETURN TRUE;
EXCEPTION WHEN OTHERS THEN
  RETURN FALSE;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.create_student_login(p_email text, p_first_name text, p_last_name text, p_school_id uuid, p_password text, p_student_id uuid)
 RETURNS TABLE(user_id uuid, status text)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_user_id uuid;
    v_profile_id uuid;
    v_student_exists boolean;
    v_current_profile_id uuid;
    v_update_count integer;
    v_error_context text;
BEGIN
    -- Start transaction
    BEGIN
        -- First check if student exists in student_details using ID
        SELECT EXISTS (
            SELECT 1 FROM public.student_details 
            WHERE id = p_student_id AND school_id = p_school_id
        ) INTO v_student_exists;

        IF NOT v_student_exists THEN
            RAISE EXCEPTION 'Student not found in student_details table';
        END IF;

        -- Check if user exists in auth.users
        SELECT id INTO v_user_id FROM auth.users WHERE email = p_email;

        IF v_user_id IS NULL THEN
            -- Create new user
            INSERT INTO auth.users (
                id,
                email,
                encrypted_password,
                raw_app_meta_data,
                raw_user_meta_data,
                created_at,
                updated_at,
                aud,
                role,
                email_confirmed_at
            )
            VALUES (
                gen_random_uuid(),
                p_email,
                crypt(p_password, gen_salt('bf')),
                jsonb_build_object('provider', 'email', 'providers', array['email']),
                jsonb_build_object('first_name', p_first_name, 'last_name', p_last_name, 'role', 'student', 'school_id', p_school_id),
                now(),
                now(),
                'authenticated',
                'authenticated',
                now()
            ) RETURNING id INTO v_user_id;

            -- Create profile for this school with student role
            INSERT INTO public.profiles (id, email, first_name, last_name, role, school_id, created_at, updated_at)
            VALUES (v_user_id, p_email, p_first_name, p_last_name, 'student', p_school_id, now(), now());
            
            -- Update student_details with the profile_id using student_id
            UPDATE public.student_details 
            SET profile_id = v_user_id,
                updated_at = now()
            WHERE id = p_student_id AND school_id = p_school_id;
            
            RETURN QUERY SELECT v_user_id, 'created';
        ELSE
            -- User exists, check if profile exists for this school
            SELECT id INTO v_profile_id FROM public.profiles WHERE id = v_user_id AND school_id = p_school_id;
            
            IF v_profile_id IS NULL THEN
                -- Create profile for this school with student role
                INSERT INTO public.profiles (id, email, first_name, last_name, role, school_id, created_at, updated_at)
                VALUES (v_user_id, p_email, p_first_name, p_last_name, 'student', p_school_id, now(), now());
            END IF;
            
            -- Update student_details with the profile_id using student_id
            UPDATE public.student_details 
            SET profile_id = v_user_id,
                updated_at = now()
            WHERE id = p_student_id AND school_id = p_school_id;
            
            RETURN QUERY SELECT v_user_id, 'linked';
        END IF;
    EXCEPTION
        WHEN OTHERS THEN
            -- Get detailed error information
            GET STACKED DIAGNOSTICS v_error_context = PG_EXCEPTION_CONTEXT;
            
            -- Log the error with context
            RAISE NOTICE 'Error in create_student_login: %', SQLERRM;
            RAISE NOTICE 'Error detail: %', SQLSTATE;
            RAISE NOTICE 'Error context: %', v_error_context;
            
            -- Re-raise the error
            RAISE;
    END;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.create_student_profile(p_user_id uuid, p_email text, p_first_name text, p_last_name text, p_school_id uuid, p_student_id uuid)
 RETURNS TABLE(user_id uuid, status text)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_profile_id uuid;
    v_student_exists boolean;
    v_update_count integer;
BEGIN
    -- Check if student exists
    SELECT EXISTS (
        SELECT 1 FROM public.student_details 
        WHERE id = p_student_id AND school_id = p_school_id
    ) INTO v_student_exists;

    IF NOT v_student_exists THEN
        RAISE EXCEPTION 'Student not found in student_details table';
    END IF;

    -- Create profile for this school with student role
    INSERT INTO public.profiles (id, email, first_name, last_name, role, school_id, created_at, updated_at)
    VALUES (p_user_id, p_email, p_first_name, p_last_name, 'student', p_school_id, now(), now());
    
    -- Update student_details with the profile_id
    UPDATE public.student_details 
    SET profile_id = p_user_id,
        updated_at = now()
    WHERE id = p_student_id AND school_id = p_school_id;
    
    GET DIAGNOSTICS v_update_count = ROW_COUNT;
    
    IF v_update_count = 0 THEN
        RAISE EXCEPTION 'No rows were updated in student_details';
    END IF;
    
    RETURN QUERY SELECT p_user_id, 'created';
END;
$function$
;

CREATE OR REPLACE FUNCTION public.create_user_profile(user_id uuid, user_email text, user_first_name text, user_last_name text, user_role user_role)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, role)
  VALUES (user_id, user_email, user_first_name, user_last_name, user_role);
  EXCEPTION WHEN unique_violation THEN
    -- Profile already exists, do nothing
    NULL;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.ensure_batch_students_table()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  table_exists BOOLEAN;
BEGIN
  -- Check if table exists
  SELECT EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename  = 'batch_students'
  ) INTO table_exists;
  
  -- If table doesn't exist, create it
  IF NOT table_exists THEN
    -- Create the batch_students table
    CREATE TABLE public.batch_students (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      batch_id UUID REFERENCES batches(id) NOT NULL,
      student_id UUID REFERENCES profiles(id) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      UNIQUE(batch_id, student_id)
    );
    
    -- Add RLS policies
    ALTER TABLE public.batch_students ENABLE ROW LEVEL SECURITY;
    
    -- School admin policies
    CREATE POLICY "School admins can view student assignments" 
    ON public.batch_students FOR SELECT 
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM public.batches 
        WHERE public.batches.id = public.batch_students.batch_id 
        AND public.batches.school_id = (SELECT school_id FROM profiles WHERE id = auth.uid())
      )
    );
    
    CREATE POLICY "School admins can insert student assignments" 
    ON public.batch_students FOR INSERT 
    TO authenticated
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.batches 
        WHERE public.batches.id = public.batch_students.batch_id 
        AND public.batches.school_id = (SELECT school_id FROM profiles WHERE id = auth.uid())
      )
    );
    
    CREATE POLICY "School admins can update student assignments" 
    ON public.batch_students FOR UPDATE 
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM public.batches 
        WHERE public.batches.id = public.batch_students.batch_id 
        AND public.batches.school_id = (SELECT school_id FROM profiles WHERE id = auth.uid())
      )
    );
    
    CREATE POLICY "School admins can delete student assignments" 
    ON public.batch_students FOR DELETE 
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM public.batches 
        WHERE public.batches.id = public.batch_students.batch_id 
        AND public.batches.school_id = (SELECT school_id FROM profiles WHERE id = auth.uid())
      )
    );
  END IF;
  
  RETURN TRUE;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.ensure_single_current_academic_year()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  IF NEW.is_current = true THEN
    UPDATE public.academic_years
    SET is_current = false
    WHERE school_id = NEW.school_id
      AND id != NEW.id
      AND is_current = true;
  END IF;
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.execute_admin_sql(sql text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Execute the SQL statement
  EXECUTE sql;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.generate_admission_number(p_school_id uuid)
 RETURNS character varying
 LANGUAGE plpgsql
AS $function$
DECLARE
  school_prefix VARCHAR;
  year_prefix VARCHAR;
  last_number INT;
  next_number VARCHAR;
BEGIN
  -- Get school prefix (first 3 letters of school name, uppercase)
  SELECT UPPER(SUBSTRING(name, 1, 3)) INTO school_prefix
  FROM public.schools
  WHERE id = p_school_id;
  
  -- Get current year as 2-digit string
  year_prefix := TO_CHAR(CURRENT_DATE, 'YY');
  
  -- Find the highest existing number for this school and year
  SELECT COALESCE(MAX(
    CAST(
      SUBSTRING(
        admission_number 
        FROM '[0-9]+$'
      ) AS INTEGER
    )
  ), 0) INTO last_number
  FROM public.student_details
  WHERE school_id = p_school_id
    AND admission_number LIKE school_prefix || year_prefix || '%';
  
  -- Format the next number with leading zeros (4 digits)
  next_number := TO_CHAR(last_number + 1, 'FM0000');
  
  -- Return the full admission number
  RETURN school_prefix || year_prefix || next_number;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_auth_user_details(p_user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  user_data jsonb;
BEGIN
  -- Check if user is super_admin
  IF NOT (SELECT is_super_admin()) THEN
    RAISE EXCEPTION 'Only super administrators can view detailed auth user information';
  END IF;
  
  -- Get extended user data with more fields
  SELECT 
    jsonb_build_object(
      'id', id,
      'aud', aud,
      'role', role,
      'email', email,
      'phone', phone,
      'created_at', created_at,
      'updated_at', updated_at,
      'last_sign_in_at', last_sign_in_at,
      'invited_at', invited_at,
      'confirmation_token', confirmation_token,
      'confirmation_sent_at', confirmation_sent_at,
      'recovery_sent_at', recovery_sent_at,
      'email_change_sent_at', email_change_sent_at,
      'email_change', email_change,
      'phone_change', phone_change,
      'phone_change_sent_at', phone_change_sent_at,
      'instance_id', instance_id, 
      'user_metadata', raw_user_meta_data,
      'app_metadata', raw_app_meta_data,
      'email_confirmed', email_confirmed_at IS NOT NULL,
      'phone_confirmed', phone_confirmed_at IS NOT NULL,
      'is_banned', banned_until IS NOT NULL,
      'banned_until', banned_until,
      'is_super_admin', is_super_admin,
      'is_sso_user', is_sso_user,
      'is_anonymous', is_anonymous,
      'confirmed_at', confirmed_at,
      'deleted_at', deleted_at
    ) INTO user_data
  FROM auth.users
  WHERE id = p_user_id;
  
  RETURN user_data;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_current_user_school_id()
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    RETURN public.get_user_primary_school(auth.uid());
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_user_highest_role(p_user_id uuid)
 RETURNS user_role
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_role user_role;
BEGIN
    -- Check for super_admin first
    SELECT role INTO v_role
    FROM public.user_role_cache
    WHERE user_id = p_user_id
    AND role = 'super_admin'::user_role
    LIMIT 1;

    IF v_role IS NOT NULL THEN
        RETURN v_role;
    END IF;

    -- Then check for school_admin
    SELECT role INTO v_role
    FROM public.user_role_cache
    WHERE user_id = p_user_id
    AND role = 'school_admin'::user_role
    LIMIT 1;

    IF v_role IS NOT NULL THEN
        RETURN v_role;
    END IF;

    -- Finally, return any other role
    SELECT role INTO v_role
    FROM public.user_role_cache
    WHERE user_id = p_user_id
    LIMIT 1;

    RETURN v_role;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_user_metadata_by_email(email_address text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  user_data JSONB;
BEGIN
  -- Get user data by email
  SELECT 
    jsonb_build_object(
      'id', id,
      'email', email,
      'created_at', created_at,
      'user_metadata', raw_user_meta_data
    ) INTO user_data
  FROM auth.users
  WHERE email = email_address;
  
  RETURN user_data;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_user_primary_school(p_user_id uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    RETURN (
        SELECT school_id
        FROM public.user_school_roles
        WHERE user_id = p_user_id
        AND is_primary = true
        LIMIT 1
    );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_user_primary_school_id(p_user_id uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    RETURN (
        SELECT school_id
        FROM public.user_role_cache
        WHERE user_id = p_user_id
        AND is_primary = true
        LIMIT 1
    );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_user_profile(p_user_id uuid)
 RETURNS TABLE(id uuid, email text, full_name text, avatar_url text, school_id uuid, role user_role, created_at timestamp with time zone, updated_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.email,
        p.full_name,
        p.avatar_url,
        urc.school_id,
        urc.role,
        p.created_at,
        p.updated_at
    FROM public.profiles p
    LEFT JOIN public.user_role_cache urc ON urc.user_id = p.id AND urc.is_primary = true
    WHERE p.id = p_user_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_user_profile_roles(p_user_id uuid)
 RETURNS TABLE(user_id uuid, school_id uuid, role user_role, is_primary boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        usr.user_id,
        usr.school_id,
        usr.role,
        usr.is_primary
    FROM public.get_user_roles_bypass_rls(p_user_id) usr;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_user_roles_bypass_rls(p_user_id uuid)
 RETURNS TABLE(role_id uuid, user_id uuid, school_id uuid, role user_role, is_primary boolean, created_at timestamp with time zone, updated_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        usr.id as role_id,
        usr.user_id,
        usr.school_id,
        usr.role,
        usr.is_primary,
        usr.created_at,
        usr.updated_at
    FROM public.user_school_roles usr
    WHERE usr.user_id = p_user_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_user_roles_for_school(p_user_id uuid, p_school_id uuid)
 RETURNS SETOF user_role
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    RETURN QUERY
    SELECT role
    FROM public.user_role_cache
    WHERE user_id = p_user_id
    AND school_id = p_school_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_user_roles_in_school(p_user_id uuid, p_school_id uuid)
 RETURNS SETOF user_role
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    RETURN QUERY
    SELECT * FROM public.get_user_school_roles(p_user_id, p_school_id);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_user_school_roles(p_user_id uuid, p_school_id uuid)
 RETURNS SETOF user_role
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    RETURN QUERY
    SELECT role
    FROM public.user_role_cache
    WHERE user_id = p_user_id
    AND school_id = p_school_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.has_any_role_in_school(p_user_id uuid, p_school_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM user_role_cache
        WHERE user_id = p_user_id
        AND school_id = p_school_id
    );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.has_role_in_school(p_user_id uuid, p_school_id uuid, p_role user_role)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM public.user_role_cache
        WHERE user_id = p_user_id
        AND school_id = p_school_id
        AND role = p_role
    );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.is_email_confirmed(email_address text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  is_confirmed BOOLEAN;
BEGIN
  SELECT (email_confirmed_at IS NOT NULL) INTO is_confirmed
  FROM auth.users
  WHERE email = email_address;
  
  RETURN COALESCE(is_confirmed, false);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.is_school_admin(p_user_id uuid, p_school_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM user_role_cache
        WHERE user_id = p_user_id
        AND school_id = p_school_id
        AND role = 'school_admin'::public.user_role
    );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.is_school_admin_bypass_rls(p_user_id uuid, p_school_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM public.user_role_cache
        WHERE user_id = p_user_id
        AND school_id = p_school_id
        AND role = 'school_admin'::user_role
    );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.is_school_admin_direct(user_id uuid, p_school_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    -- Check metadata directly from auth.users
    RETURN EXISTS (
        SELECT 1 FROM auth.users
        WHERE id = user_id 
        AND raw_user_meta_data->>'role' = 'school_admin'
        AND raw_user_meta_data->>'school_id' = p_school_id::text
    );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.is_school_admin_no_rls(p_user_id uuid, p_school_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM public.user_role_cache
        WHERE user_id = p_user_id
        AND school_id = p_school_id
        AND role = 'school_admin'::user_role
    );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.is_super_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'super_admin'
  );
$function$
;

CREATE OR REPLACE FUNCTION public.is_super_admin(p_user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM user_role_cache
        WHERE user_id = p_user_id
        AND role = 'super_admin'::public.user_role
    );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.is_super_admin_bypass_rls(p_user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM public.user_role_cache
        WHERE user_id = p_user_id
        AND role = 'super_admin'::user_role
    );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.is_super_admin_direct(user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    -- Check metadata directly from auth.users
    RETURN EXISTS (
        SELECT 1 FROM auth.users
        WHERE id = user_id 
        AND raw_user_meta_data->>'role' = 'super_admin'
    );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.manage_primary_school()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    IF NEW.is_primary THEN
        -- Set is_primary to false for all other schools of this user
        UPDATE public.user_school_roles
        SET is_primary = false
        WHERE user_id = NEW.user_id
        AND id != NEW.id;
    END IF;
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.manually_confirm_email(email_address text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  user_exists BOOLEAN;
  user_id UUID;
BEGIN
  -- Check if user exists
  SELECT EXISTS (
    SELECT 1 FROM auth.users WHERE email = email_address
  ) INTO user_exists;
  
  IF NOT user_exists THEN
    RETURN false;
  END IF;
  
  -- Get the user ID
  SELECT id INTO user_id FROM auth.users WHERE email = email_address;
  
  -- Set the email_confirmed_at field
  UPDATE auth.users
  SET email_confirmed_at = now()
  WHERE id = user_id AND (email_confirmed_at IS NULL);
  
  RETURN true;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.manually_confirm_user_by_id(user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  user_exists BOOLEAN;
BEGIN
  -- Check if user exists
  SELECT EXISTS (
    SELECT 1 FROM auth.users WHERE id = user_id
  ) INTO user_exists;
  
  IF NOT user_exists THEN
    RETURN false;
  END IF;
  
  -- Update the user to set confirmation fields and remove any ban
  UPDATE auth.users
  SET 
    email_confirmed_at = now(),
    confirmed_at = now(),
    banned_until = NULL
  WHERE id = user_id;
  
  RETURN true;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.refresh_user_role_cache(p_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    -- Delete existing cache entries for this user
    DELETE FROM user_role_cache WHERE user_id = p_user_id;
    
    -- Insert fresh data only for this user
    INSERT INTO user_role_cache (user_id, school_id, is_super_admin, is_school_admin, roles, last_updated)
    SELECT 
        user_id,
        school_id,
        bool_or(role = 'super_admin') as is_super_admin,
        bool_or(role = 'school_admin') as is_school_admin,
        array_agg(DISTINCT role) as roles,
        now() as last_updated
    FROM user_school_roles
    WHERE user_id = p_user_id
    GROUP BY user_id, school_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.refresh_user_roles(p_user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    -- Delete existing cache entries for this user
    DELETE FROM public.user_role_cache WHERE user_id = p_user_id;
    
    -- Insert fresh data from user_role_cache
    INSERT INTO public.user_role_cache (user_id, school_id, role, is_primary, last_updated)
    SELECT 
        user_id,
        school_id,
        role,
        is_primary,
        now()
    FROM public.user_role_cache
    WHERE user_id = p_user_id;
    
    RETURN true;
EXCEPTION WHEN OTHERS THEN
    RETURN false;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.switch_primary_school(p_school_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    -- Verify user has role in the target school
    IF NOT EXISTS (
        SELECT 1 FROM public.user_school_roles
        WHERE user_id = auth.uid()
        AND school_id = p_school_id
    ) THEN
        RETURN false;
    END IF;

    -- Update primary school
    UPDATE public.user_school_roles
    SET is_primary = (school_id = p_school_id)
    WHERE user_id = auth.uid();

    RETURN true;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_admin_user(p_email text, p_first_name text, p_last_name text, p_password text DEFAULT NULL::text, p_school_id uuid DEFAULT NULL::uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  admin_user_id UUID;
  result JSONB;
  profile_exists BOOLEAN;
BEGIN
  -- Check if user is super_admin
  IF NOT (SELECT is_super_admin()) THEN
    RAISE EXCEPTION 'Only super administrators can update admin user details';
  END IF;
  
  -- Get user ID from auth.users
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = p_email;
  
  -- Check if user exists
  IF admin_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', p_email;
  END IF;
  
  -- Check if profile exists
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = admin_user_id
  ) INTO profile_exists;
  
  -- Update user metadata
  UPDATE auth.users
  SET 
    raw_user_meta_data = jsonb_build_object(
      'first_name', p_first_name,
      'last_name', p_last_name,
      'role', 'school_admin',
      'school_id', p_school_id
    ),
    updated_at = now()
  WHERE id = admin_user_id;
  
  -- Update password if provided
  IF p_password IS NOT NULL AND p_password != '' THEN
    UPDATE auth.users
    SET encrypted_password = crypt(p_password, gen_salt('bf'))
    WHERE id = admin_user_id;
  END IF;
  
  -- Update profile if it exists
  IF profile_exists THEN
    UPDATE public.profiles
    SET 
      first_name = p_first_name,
      last_name = p_last_name,
      school_id = p_school_id,
      updated_at = now()
    WHERE id = admin_user_id;
  ELSE
    -- Create profile if it doesn't exist
    INSERT INTO public.profiles (id, email, first_name, last_name, role, school_id)
    VALUES (admin_user_id, p_email, p_first_name, p_last_name, 'school_admin', p_school_id);
  END IF;
  
  -- Return result
  result := jsonb_build_object(
    'user_id', admin_user_id,
    'email', p_email,
    'first_name', p_first_name,
    'last_name', p_last_name,
    'school_id', p_school_id,
    'password_updated', p_password IS NOT NULL AND p_password != ''
  );
  
  RETURN result;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_auth_user(p_user_id uuid, p_email text DEFAULT NULL::text, p_phone text DEFAULT NULL::text, p_email_confirmed boolean DEFAULT NULL::boolean, p_phone_confirmed boolean DEFAULT NULL::boolean, p_banned boolean DEFAULT NULL::boolean, p_confirmation_token text DEFAULT NULL::text, p_confirmation_sent_at text DEFAULT NULL::text, p_instance_id text DEFAULT NULL::text, p_user_metadata jsonb DEFAULT NULL::jsonb, p_app_metadata jsonb DEFAULT NULL::jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  result JSONB;
BEGIN
  -- Check if user is super_admin
  IF NOT (SELECT is_super_admin()) THEN
    RAISE EXCEPTION 'Only super administrators can update auth user details';
  END IF;
  
  -- Update user details with additional metadata fields
  UPDATE auth.users
  SET
    email = COALESCE(p_email, email),
    phone = COALESCE(p_phone, phone),
    raw_user_meta_data = COALESCE(p_user_metadata, raw_user_meta_data),
    raw_app_meta_data = COALESCE(p_app_metadata, raw_app_meta_data),
    instance_id = COALESCE(p_instance_id, instance_id),
    confirmation_token = COALESCE(p_confirmation_token, confirmation_token),
    email_confirmed_at = CASE
      WHEN p_email_confirmed IS NOT NULL THEN
        CASE WHEN p_email_confirmed THEN now() ELSE NULL END
      ELSE email_confirmed_at
    END,
    phone_confirmed_at = CASE
      WHEN p_phone_confirmed IS NOT NULL THEN
        CASE WHEN p_phone_confirmed THEN now() ELSE NULL END
      ELSE phone_confirmed_at
    END,
    confirmation_sent_at = CASE 
      WHEN p_confirmation_sent_at IS NOT NULL THEN
        p_confirmation_sent_at::timestamptz
      ELSE confirmation_sent_at
    END,
    banned_until = CASE
      WHEN p_banned IS NOT NULL THEN
        CASE WHEN p_banned THEN '2099-12-31 23:59:59+00'::timestamptz ELSE NULL END
      ELSE banned_until
    END
  WHERE id = p_user_id
  RETURNING jsonb_build_object(
    'id', id,
    'email', email,
    'phone', phone,
    'created_at', created_at,
    'last_sign_in_at', last_sign_in_at,
    'confirmation_token', confirmation_token,
    'confirmation_sent_at', confirmation_sent_at,
    'instance_id', instance_id,
    'user_metadata', raw_user_meta_data,
    'app_metadata', raw_app_meta_data,
    'email_confirmed', email_confirmed_at IS NOT NULL,
    'phone_confirmed', phone_confirmed_at IS NOT NULL,
    'is_banned', banned_until IS NOT NULL,
    'banned_until', banned_until,
    'updated_at', updated_at
  ) INTO result;
  
  RETURN result;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_auth_user(p_user_id uuid, p_email text DEFAULT NULL::text, p_phone text DEFAULT NULL::text, p_email_confirmed boolean DEFAULT NULL::boolean, p_phone_confirmed boolean DEFAULT NULL::boolean, p_banned boolean DEFAULT NULL::boolean, p_user_metadata jsonb DEFAULT NULL::jsonb, p_app_metadata jsonb DEFAULT NULL::jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  result jsonb;
BEGIN
  -- Check if user is super_admin
  IF NOT (SELECT is_super_admin()) THEN
    RAISE EXCEPTION 'Only super administrators can update auth user details';
  END IF;
  
  -- Update user details with additional metadata fields
  UPDATE auth.users
  SET
    email = COALESCE(p_email, email),
    phone = COALESCE(p_phone, phone),
    raw_user_meta_data = COALESCE(p_user_metadata, raw_user_meta_data),
    raw_app_meta_data = COALESCE(p_app_metadata, raw_app_meta_data),
    email_confirmed_at = CASE
      WHEN p_email_confirmed IS NOT NULL THEN
        CASE WHEN p_email_confirmed THEN now() ELSE NULL END
      ELSE email_confirmed_at
    END,
    phone_confirmed_at = CASE
      WHEN p_phone_confirmed IS NOT NULL THEN
        CASE WHEN p_phone_confirmed THEN now() ELSE NULL END
      ELSE phone_confirmed_at
    END,
    banned_until = CASE
      WHEN p_banned IS NOT NULL THEN
        CASE WHEN p_banned THEN '2099-12-31 23:59:59+00'::timestamptz ELSE NULL END
      ELSE banned_until
    END
  WHERE id = p_user_id
  RETURNING jsonb_build_object(
    'id', id,
    'email', email,
    'phone', phone,
    'created_at', created_at,
    'last_sign_in_at', last_sign_in_at,
    'user_metadata', raw_user_meta_data,
    'app_metadata', raw_app_meta_data,
    'email_confirmed', email_confirmed_at IS NOT NULL,
    'phone_confirmed', phone_confirmed_at IS NOT NULL,
    'is_banned', banned_until IS NOT NULL,
    'banned_until', banned_until,
    'updated_at', updated_at
  ) INTO result;
  
  RETURN result;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_school_details(p_school_id uuid, p_name text, p_domain text, p_contact_number text, p_region text, p_status text, p_admin_email text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  result JSONB;
  old_admin_email TEXT;
BEGIN
  -- Check if user is super_admin
  IF NOT (SELECT is_super_admin()) THEN
    RAISE EXCEPTION 'Only super administrators can update school details';
  END IF;
  
  -- Get the current admin email for the school
  SELECT admin_email INTO old_admin_email 
  FROM public.schools 
  WHERE id = p_school_id;
  
  -- Update school details
  UPDATE public.schools
  SET 
    name = p_name,
    domain = p_domain,
    contact_number = p_contact_number,
    region = p_region,
    status = p_status,
    admin_email = p_admin_email,
    updated_at = now()
  WHERE id = p_school_id
  RETURNING jsonb_build_object(
    'id', id,
    'name', name,
    'domain', domain,
    'contact_number', contact_number,
    'region', region,
    'status', status,
    'admin_email', admin_email,
    'old_admin_email', old_admin_email
  ) INTO result;
  
  RETURN result;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.validate_student_role()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.student_id AND role = 'student') THEN
    RAISE EXCEPTION 'Only students can be added to batches';
  END IF;
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.validate_teacher_role()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF NEW.class_teacher_id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.class_teacher_id AND role = 'teacher') THEN
      RAISE EXCEPTION 'Only teachers can be assigned as class teachers';
    END IF;
  END IF;
  RETURN NEW;
END;
$function$
;

grant delete on table "public"."academic_years" to "anon";

grant insert on table "public"."academic_years" to "anon";

grant references on table "public"."academic_years" to "anon";

grant select on table "public"."academic_years" to "anon";

grant trigger on table "public"."academic_years" to "anon";

grant truncate on table "public"."academic_years" to "anon";

grant update on table "public"."academic_years" to "anon";

grant delete on table "public"."academic_years" to "authenticated";

grant insert on table "public"."academic_years" to "authenticated";

grant references on table "public"."academic_years" to "authenticated";

grant select on table "public"."academic_years" to "authenticated";

grant trigger on table "public"."academic_years" to "authenticated";

grant truncate on table "public"."academic_years" to "authenticated";

grant update on table "public"."academic_years" to "authenticated";

grant delete on table "public"."academic_years" to "service_role";

grant insert on table "public"."academic_years" to "service_role";

grant references on table "public"."academic_years" to "service_role";

grant select on table "public"."academic_years" to "service_role";

grant trigger on table "public"."academic_years" to "service_role";

grant truncate on table "public"."academic_years" to "service_role";

grant update on table "public"."academic_years" to "service_role";

grant delete on table "public"."batch_students" to "anon";

grant insert on table "public"."batch_students" to "anon";

grant references on table "public"."batch_students" to "anon";

grant select on table "public"."batch_students" to "anon";

grant trigger on table "public"."batch_students" to "anon";

grant truncate on table "public"."batch_students" to "anon";

grant update on table "public"."batch_students" to "anon";

grant delete on table "public"."batch_students" to "authenticated";

grant insert on table "public"."batch_students" to "authenticated";

grant references on table "public"."batch_students" to "authenticated";

grant select on table "public"."batch_students" to "authenticated";

grant trigger on table "public"."batch_students" to "authenticated";

grant truncate on table "public"."batch_students" to "authenticated";

grant update on table "public"."batch_students" to "authenticated";

grant delete on table "public"."batch_students" to "service_role";

grant insert on table "public"."batch_students" to "service_role";

grant references on table "public"."batch_students" to "service_role";

grant select on table "public"."batch_students" to "service_role";

grant trigger on table "public"."batch_students" to "service_role";

grant truncate on table "public"."batch_students" to "service_role";

grant update on table "public"."batch_students" to "service_role";

grant delete on table "public"."batch_subjects" to "anon";

grant insert on table "public"."batch_subjects" to "anon";

grant references on table "public"."batch_subjects" to "anon";

grant select on table "public"."batch_subjects" to "anon";

grant trigger on table "public"."batch_subjects" to "anon";

grant truncate on table "public"."batch_subjects" to "anon";

grant update on table "public"."batch_subjects" to "anon";

grant delete on table "public"."batch_subjects" to "authenticated";

grant insert on table "public"."batch_subjects" to "authenticated";

grant references on table "public"."batch_subjects" to "authenticated";

grant select on table "public"."batch_subjects" to "authenticated";

grant trigger on table "public"."batch_subjects" to "authenticated";

grant truncate on table "public"."batch_subjects" to "authenticated";

grant update on table "public"."batch_subjects" to "authenticated";

grant delete on table "public"."batch_subjects" to "service_role";

grant insert on table "public"."batch_subjects" to "service_role";

grant references on table "public"."batch_subjects" to "service_role";

grant select on table "public"."batch_subjects" to "service_role";

grant trigger on table "public"."batch_subjects" to "service_role";

grant truncate on table "public"."batch_subjects" to "service_role";

grant update on table "public"."batch_subjects" to "service_role";

grant delete on table "public"."batches" to "anon";

grant insert on table "public"."batches" to "anon";

grant references on table "public"."batches" to "anon";

grant select on table "public"."batches" to "anon";

grant trigger on table "public"."batches" to "anon";

grant truncate on table "public"."batches" to "anon";

grant update on table "public"."batches" to "anon";

grant delete on table "public"."batches" to "authenticated";

grant insert on table "public"."batches" to "authenticated";

grant references on table "public"."batches" to "authenticated";

grant select on table "public"."batches" to "authenticated";

grant trigger on table "public"."batches" to "authenticated";

grant truncate on table "public"."batches" to "authenticated";

grant update on table "public"."batches" to "authenticated";

grant delete on table "public"."batches" to "service_role";

grant insert on table "public"."batches" to "service_role";

grant references on table "public"."batches" to "service_role";

grant select on table "public"."batches" to "service_role";

grant trigger on table "public"."batches" to "service_role";

grant truncate on table "public"."batches" to "service_role";

grant update on table "public"."batches" to "service_role";

grant delete on table "public"."certificates" to "anon";

grant insert on table "public"."certificates" to "anon";

grant references on table "public"."certificates" to "anon";

grant select on table "public"."certificates" to "anon";

grant trigger on table "public"."certificates" to "anon";

grant truncate on table "public"."certificates" to "anon";

grant update on table "public"."certificates" to "anon";

grant delete on table "public"."certificates" to "authenticated";

grant insert on table "public"."certificates" to "authenticated";

grant references on table "public"."certificates" to "authenticated";

grant select on table "public"."certificates" to "authenticated";

grant trigger on table "public"."certificates" to "authenticated";

grant truncate on table "public"."certificates" to "authenticated";

grant update on table "public"."certificates" to "authenticated";

grant delete on table "public"."certificates" to "service_role";

grant insert on table "public"."certificates" to "service_role";

grant references on table "public"."certificates" to "service_role";

grant select on table "public"."certificates" to "service_role";

grant trigger on table "public"."certificates" to "service_role";

grant truncate on table "public"."certificates" to "service_role";

grant update on table "public"."certificates" to "service_role";

grant delete on table "public"."courses" to "anon";

grant insert on table "public"."courses" to "anon";

grant references on table "public"."courses" to "anon";

grant select on table "public"."courses" to "anon";

grant trigger on table "public"."courses" to "anon";

grant truncate on table "public"."courses" to "anon";

grant update on table "public"."courses" to "anon";

grant delete on table "public"."courses" to "authenticated";

grant insert on table "public"."courses" to "authenticated";

grant references on table "public"."courses" to "authenticated";

grant select on table "public"."courses" to "authenticated";

grant trigger on table "public"."courses" to "authenticated";

grant truncate on table "public"."courses" to "authenticated";

grant update on table "public"."courses" to "authenticated";

grant delete on table "public"."courses" to "service_role";

grant insert on table "public"."courses" to "service_role";

grant references on table "public"."courses" to "service_role";

grant select on table "public"."courses" to "service_role";

grant trigger on table "public"."courses" to "service_role";

grant truncate on table "public"."courses" to "service_role";

grant update on table "public"."courses" to "service_role";

grant delete on table "public"."departments" to "anon";

grant insert on table "public"."departments" to "anon";

grant references on table "public"."departments" to "anon";

grant select on table "public"."departments" to "anon";

grant trigger on table "public"."departments" to "anon";

grant truncate on table "public"."departments" to "anon";

grant update on table "public"."departments" to "anon";

grant delete on table "public"."departments" to "authenticated";

grant insert on table "public"."departments" to "authenticated";

grant references on table "public"."departments" to "authenticated";

grant select on table "public"."departments" to "authenticated";

grant trigger on table "public"."departments" to "authenticated";

grant truncate on table "public"."departments" to "authenticated";

grant update on table "public"."departments" to "authenticated";

grant delete on table "public"."departments" to "service_role";

grant insert on table "public"."departments" to "service_role";

grant references on table "public"."departments" to "service_role";

grant select on table "public"."departments" to "service_role";

grant trigger on table "public"."departments" to "service_role";

grant truncate on table "public"."departments" to "service_role";

grant update on table "public"."departments" to "service_role";

grant delete on table "public"."disciplinary_evidence" to "anon";

grant insert on table "public"."disciplinary_evidence" to "anon";

grant references on table "public"."disciplinary_evidence" to "anon";

grant select on table "public"."disciplinary_evidence" to "anon";

grant trigger on table "public"."disciplinary_evidence" to "anon";

grant truncate on table "public"."disciplinary_evidence" to "anon";

grant update on table "public"."disciplinary_evidence" to "anon";

grant delete on table "public"."disciplinary_evidence" to "authenticated";

grant insert on table "public"."disciplinary_evidence" to "authenticated";

grant references on table "public"."disciplinary_evidence" to "authenticated";

grant select on table "public"."disciplinary_evidence" to "authenticated";

grant trigger on table "public"."disciplinary_evidence" to "authenticated";

grant truncate on table "public"."disciplinary_evidence" to "authenticated";

grant update on table "public"."disciplinary_evidence" to "authenticated";

grant delete on table "public"."disciplinary_evidence" to "service_role";

grant insert on table "public"."disciplinary_evidence" to "service_role";

grant references on table "public"."disciplinary_evidence" to "service_role";

grant select on table "public"."disciplinary_evidence" to "service_role";

grant trigger on table "public"."disciplinary_evidence" to "service_role";

grant truncate on table "public"."disciplinary_evidence" to "service_role";

grant update on table "public"."disciplinary_evidence" to "service_role";

grant delete on table "public"."disciplinary_records" to "anon";

grant insert on table "public"."disciplinary_records" to "anon";

grant references on table "public"."disciplinary_records" to "anon";

grant select on table "public"."disciplinary_records" to "anon";

grant trigger on table "public"."disciplinary_records" to "anon";

grant truncate on table "public"."disciplinary_records" to "anon";

grant update on table "public"."disciplinary_records" to "anon";

grant delete on table "public"."disciplinary_records" to "authenticated";

grant insert on table "public"."disciplinary_records" to "authenticated";

grant references on table "public"."disciplinary_records" to "authenticated";

grant select on table "public"."disciplinary_records" to "authenticated";

grant trigger on table "public"."disciplinary_records" to "authenticated";

grant truncate on table "public"."disciplinary_records" to "authenticated";

grant update on table "public"."disciplinary_records" to "authenticated";

grant delete on table "public"."disciplinary_records" to "service_role";

grant insert on table "public"."disciplinary_records" to "service_role";

grant references on table "public"."disciplinary_records" to "service_role";

grant select on table "public"."disciplinary_records" to "service_role";

grant trigger on table "public"."disciplinary_records" to "service_role";

grant truncate on table "public"."disciplinary_records" to "service_role";

grant update on table "public"."disciplinary_records" to "service_role";

grant delete on table "public"."grade_thresholds" to "anon";

grant insert on table "public"."grade_thresholds" to "anon";

grant references on table "public"."grade_thresholds" to "anon";

grant select on table "public"."grade_thresholds" to "anon";

grant trigger on table "public"."grade_thresholds" to "anon";

grant truncate on table "public"."grade_thresholds" to "anon";

grant update on table "public"."grade_thresholds" to "anon";

grant delete on table "public"."grade_thresholds" to "authenticated";

grant insert on table "public"."grade_thresholds" to "authenticated";

grant references on table "public"."grade_thresholds" to "authenticated";

grant select on table "public"."grade_thresholds" to "authenticated";

grant trigger on table "public"."grade_thresholds" to "authenticated";

grant truncate on table "public"."grade_thresholds" to "authenticated";

grant update on table "public"."grade_thresholds" to "authenticated";

grant delete on table "public"."grade_thresholds" to "service_role";

grant insert on table "public"."grade_thresholds" to "service_role";

grant references on table "public"."grade_thresholds" to "service_role";

grant select on table "public"."grade_thresholds" to "service_role";

grant trigger on table "public"."grade_thresholds" to "service_role";

grant truncate on table "public"."grade_thresholds" to "service_role";

grant update on table "public"."grade_thresholds" to "service_role";

grant delete on table "public"."grading_systems" to "anon";

grant insert on table "public"."grading_systems" to "anon";

grant references on table "public"."grading_systems" to "anon";

grant select on table "public"."grading_systems" to "anon";

grant trigger on table "public"."grading_systems" to "anon";

grant truncate on table "public"."grading_systems" to "anon";

grant update on table "public"."grading_systems" to "anon";

grant delete on table "public"."grading_systems" to "authenticated";

grant insert on table "public"."grading_systems" to "authenticated";

grant references on table "public"."grading_systems" to "authenticated";

grant select on table "public"."grading_systems" to "authenticated";

grant trigger on table "public"."grading_systems" to "authenticated";

grant truncate on table "public"."grading_systems" to "authenticated";

grant update on table "public"."grading_systems" to "authenticated";

grant delete on table "public"."grading_systems" to "service_role";

grant insert on table "public"."grading_systems" to "service_role";

grant references on table "public"."grading_systems" to "service_role";

grant select on table "public"."grading_systems" to "service_role";

grant trigger on table "public"."grading_systems" to "service_role";

grant truncate on table "public"."grading_systems" to "service_role";

grant update on table "public"."grading_systems" to "service_role";

grant delete on table "public"."guardians" to "anon";

grant insert on table "public"."guardians" to "anon";

grant references on table "public"."guardians" to "anon";

grant select on table "public"."guardians" to "anon";

grant trigger on table "public"."guardians" to "anon";

grant truncate on table "public"."guardians" to "anon";

grant update on table "public"."guardians" to "anon";

grant delete on table "public"."guardians" to "authenticated";

grant insert on table "public"."guardians" to "authenticated";

grant references on table "public"."guardians" to "authenticated";

grant select on table "public"."guardians" to "authenticated";

grant trigger on table "public"."guardians" to "authenticated";

grant truncate on table "public"."guardians" to "authenticated";

grant update on table "public"."guardians" to "authenticated";

grant delete on table "public"."guardians" to "service_role";

grant insert on table "public"."guardians" to "service_role";

grant references on table "public"."guardians" to "service_role";

grant select on table "public"."guardians" to "service_role";

grant trigger on table "public"."guardians" to "service_role";

grant truncate on table "public"."guardians" to "service_role";

grant update on table "public"."guardians" to "service_role";

grant delete on table "public"."parent_meetings" to "anon";

grant insert on table "public"."parent_meetings" to "anon";

grant references on table "public"."parent_meetings" to "anon";

grant select on table "public"."parent_meetings" to "anon";

grant trigger on table "public"."parent_meetings" to "anon";

grant truncate on table "public"."parent_meetings" to "anon";

grant update on table "public"."parent_meetings" to "anon";

grant delete on table "public"."parent_meetings" to "authenticated";

grant insert on table "public"."parent_meetings" to "authenticated";

grant references on table "public"."parent_meetings" to "authenticated";

grant select on table "public"."parent_meetings" to "authenticated";

grant trigger on table "public"."parent_meetings" to "authenticated";

grant truncate on table "public"."parent_meetings" to "authenticated";

grant update on table "public"."parent_meetings" to "authenticated";

grant delete on table "public"."parent_meetings" to "service_role";

grant insert on table "public"."parent_meetings" to "service_role";

grant references on table "public"."parent_meetings" to "service_role";

grant select on table "public"."parent_meetings" to "service_role";

grant trigger on table "public"."parent_meetings" to "service_role";

grant truncate on table "public"."parent_meetings" to "service_role";

grant update on table "public"."parent_meetings" to "service_role";

grant delete on table "public"."profiles" to "anon";

grant insert on table "public"."profiles" to "anon";

grant references on table "public"."profiles" to "anon";

grant select on table "public"."profiles" to "anon";

grant trigger on table "public"."profiles" to "anon";

grant truncate on table "public"."profiles" to "anon";

grant update on table "public"."profiles" to "anon";

grant delete on table "public"."profiles" to "authenticated";

grant insert on table "public"."profiles" to "authenticated";

grant references on table "public"."profiles" to "authenticated";

grant select on table "public"."profiles" to "authenticated";

grant trigger on table "public"."profiles" to "authenticated";

grant truncate on table "public"."profiles" to "authenticated";

grant update on table "public"."profiles" to "authenticated";

grant delete on table "public"."profiles" to "service_role";

grant insert on table "public"."profiles" to "service_role";

grant references on table "public"."profiles" to "service_role";

grant select on table "public"."profiles" to "service_role";

grant trigger on table "public"."profiles" to "service_role";

grant truncate on table "public"."profiles" to "service_role";

grant update on table "public"."profiles" to "service_role";

grant delete on table "public"."schools" to "anon";

grant insert on table "public"."schools" to "anon";

grant references on table "public"."schools" to "anon";

grant select on table "public"."schools" to "anon";

grant trigger on table "public"."schools" to "anon";

grant truncate on table "public"."schools" to "anon";

grant update on table "public"."schools" to "anon";

grant delete on table "public"."schools" to "authenticated";

grant insert on table "public"."schools" to "authenticated";

grant references on table "public"."schools" to "authenticated";

grant select on table "public"."schools" to "authenticated";

grant trigger on table "public"."schools" to "authenticated";

grant truncate on table "public"."schools" to "authenticated";

grant update on table "public"."schools" to "authenticated";

grant delete on table "public"."schools" to "service_role";

grant insert on table "public"."schools" to "service_role";

grant references on table "public"."schools" to "service_role";

grant select on table "public"."schools" to "service_role";

grant trigger on table "public"."schools" to "service_role";

grant truncate on table "public"."schools" to "service_role";

grant update on table "public"."schools" to "service_role";

grant delete on table "public"."student_categories" to "anon";

grant insert on table "public"."student_categories" to "anon";

grant references on table "public"."student_categories" to "anon";

grant select on table "public"."student_categories" to "anon";

grant trigger on table "public"."student_categories" to "anon";

grant truncate on table "public"."student_categories" to "anon";

grant update on table "public"."student_categories" to "anon";

grant delete on table "public"."student_categories" to "authenticated";

grant insert on table "public"."student_categories" to "authenticated";

grant references on table "public"."student_categories" to "authenticated";

grant select on table "public"."student_categories" to "authenticated";

grant trigger on table "public"."student_categories" to "authenticated";

grant truncate on table "public"."student_categories" to "authenticated";

grant update on table "public"."student_categories" to "authenticated";

grant delete on table "public"."student_categories" to "service_role";

grant insert on table "public"."student_categories" to "service_role";

grant references on table "public"."student_categories" to "service_role";

grant select on table "public"."student_categories" to "service_role";

grant trigger on table "public"."student_categories" to "service_role";

grant truncate on table "public"."student_categories" to "service_role";

grant update on table "public"."student_categories" to "service_role";

grant delete on table "public"."student_category_assignments" to "anon";

grant insert on table "public"."student_category_assignments" to "anon";

grant references on table "public"."student_category_assignments" to "anon";

grant select on table "public"."student_category_assignments" to "anon";

grant trigger on table "public"."student_category_assignments" to "anon";

grant truncate on table "public"."student_category_assignments" to "anon";

grant update on table "public"."student_category_assignments" to "anon";

grant delete on table "public"."student_category_assignments" to "authenticated";

grant insert on table "public"."student_category_assignments" to "authenticated";

grant references on table "public"."student_category_assignments" to "authenticated";

grant select on table "public"."student_category_assignments" to "authenticated";

grant trigger on table "public"."student_category_assignments" to "authenticated";

grant truncate on table "public"."student_category_assignments" to "authenticated";

grant update on table "public"."student_category_assignments" to "authenticated";

grant delete on table "public"."student_category_assignments" to "service_role";

grant insert on table "public"."student_category_assignments" to "service_role";

grant references on table "public"."student_category_assignments" to "service_role";

grant select on table "public"."student_category_assignments" to "service_role";

grant trigger on table "public"."student_category_assignments" to "service_role";

grant truncate on table "public"."student_category_assignments" to "service_role";

grant update on table "public"."student_category_assignments" to "service_role";

grant delete on table "public"."student_details" to "anon";

grant insert on table "public"."student_details" to "anon";

grant references on table "public"."student_details" to "anon";

grant select on table "public"."student_details" to "anon";

grant trigger on table "public"."student_details" to "anon";

grant truncate on table "public"."student_details" to "anon";

grant update on table "public"."student_details" to "anon";

grant delete on table "public"."student_details" to "authenticated";

grant insert on table "public"."student_details" to "authenticated";

grant references on table "public"."student_details" to "authenticated";

grant select on table "public"."student_details" to "authenticated";

grant trigger on table "public"."student_details" to "authenticated";

grant truncate on table "public"."student_details" to "authenticated";

grant update on table "public"."student_details" to "authenticated";

grant delete on table "public"."student_details" to "service_role";

grant insert on table "public"."student_details" to "service_role";

grant references on table "public"."student_details" to "service_role";

grant select on table "public"."student_details" to "service_role";

grant trigger on table "public"."student_details" to "service_role";

grant truncate on table "public"."student_details" to "service_role";

grant update on table "public"."student_details" to "service_role";

grant delete on table "public"."student_documents" to "anon";

grant insert on table "public"."student_documents" to "anon";

grant references on table "public"."student_documents" to "anon";

grant select on table "public"."student_documents" to "anon";

grant trigger on table "public"."student_documents" to "anon";

grant truncate on table "public"."student_documents" to "anon";

grant update on table "public"."student_documents" to "anon";

grant delete on table "public"."student_documents" to "authenticated";

grant insert on table "public"."student_documents" to "authenticated";

grant references on table "public"."student_documents" to "authenticated";

grant select on table "public"."student_documents" to "authenticated";

grant trigger on table "public"."student_documents" to "authenticated";

grant truncate on table "public"."student_documents" to "authenticated";

grant update on table "public"."student_documents" to "authenticated";

grant delete on table "public"."student_documents" to "service_role";

grant insert on table "public"."student_documents" to "service_role";

grant references on table "public"."student_documents" to "service_role";

grant select on table "public"."student_documents" to "service_role";

grant trigger on table "public"."student_documents" to "service_role";

grant truncate on table "public"."student_documents" to "service_role";

grant update on table "public"."student_documents" to "service_role";

grant delete on table "public"."student_guardians" to "anon";

grant insert on table "public"."student_guardians" to "anon";

grant references on table "public"."student_guardians" to "anon";

grant select on table "public"."student_guardians" to "anon";

grant trigger on table "public"."student_guardians" to "anon";

grant truncate on table "public"."student_guardians" to "anon";

grant update on table "public"."student_guardians" to "anon";

grant delete on table "public"."student_guardians" to "authenticated";

grant insert on table "public"."student_guardians" to "authenticated";

grant references on table "public"."student_guardians" to "authenticated";

grant select on table "public"."student_guardians" to "authenticated";

grant trigger on table "public"."student_guardians" to "authenticated";

grant truncate on table "public"."student_guardians" to "authenticated";

grant update on table "public"."student_guardians" to "authenticated";

grant delete on table "public"."student_guardians" to "service_role";

grant insert on table "public"."student_guardians" to "service_role";

grant references on table "public"."student_guardians" to "service_role";

grant select on table "public"."student_guardians" to "service_role";

grant trigger on table "public"."student_guardians" to "service_role";

grant truncate on table "public"."student_guardians" to "service_role";

grant update on table "public"."student_guardians" to "service_role";

grant delete on table "public"."subject_categories" to "anon";

grant insert on table "public"."subject_categories" to "anon";

grant references on table "public"."subject_categories" to "anon";

grant select on table "public"."subject_categories" to "anon";

grant trigger on table "public"."subject_categories" to "anon";

grant truncate on table "public"."subject_categories" to "anon";

grant update on table "public"."subject_categories" to "anon";

grant delete on table "public"."subject_categories" to "authenticated";

grant insert on table "public"."subject_categories" to "authenticated";

grant references on table "public"."subject_categories" to "authenticated";

grant select on table "public"."subject_categories" to "authenticated";

grant trigger on table "public"."subject_categories" to "authenticated";

grant truncate on table "public"."subject_categories" to "authenticated";

grant update on table "public"."subject_categories" to "authenticated";

grant delete on table "public"."subject_categories" to "service_role";

grant insert on table "public"."subject_categories" to "service_role";

grant references on table "public"."subject_categories" to "service_role";

grant select on table "public"."subject_categories" to "service_role";

grant trigger on table "public"."subject_categories" to "service_role";

grant truncate on table "public"."subject_categories" to "service_role";

grant update on table "public"."subject_categories" to "service_role";

grant delete on table "public"."subject_teachers" to "anon";

grant insert on table "public"."subject_teachers" to "anon";

grant references on table "public"."subject_teachers" to "anon";

grant select on table "public"."subject_teachers" to "anon";

grant trigger on table "public"."subject_teachers" to "anon";

grant truncate on table "public"."subject_teachers" to "anon";

grant update on table "public"."subject_teachers" to "anon";

grant delete on table "public"."subject_teachers" to "authenticated";

grant insert on table "public"."subject_teachers" to "authenticated";

grant references on table "public"."subject_teachers" to "authenticated";

grant select on table "public"."subject_teachers" to "authenticated";

grant trigger on table "public"."subject_teachers" to "authenticated";

grant truncate on table "public"."subject_teachers" to "authenticated";

grant update on table "public"."subject_teachers" to "authenticated";

grant delete on table "public"."subject_teachers" to "service_role";

grant insert on table "public"."subject_teachers" to "service_role";

grant references on table "public"."subject_teachers" to "service_role";

grant select on table "public"."subject_teachers" to "service_role";

grant trigger on table "public"."subject_teachers" to "service_role";

grant truncate on table "public"."subject_teachers" to "service_role";

grant update on table "public"."subject_teachers" to "service_role";

grant delete on table "public"."subject_time_slots" to "anon";

grant insert on table "public"."subject_time_slots" to "anon";

grant references on table "public"."subject_time_slots" to "anon";

grant select on table "public"."subject_time_slots" to "anon";

grant trigger on table "public"."subject_time_slots" to "anon";

grant truncate on table "public"."subject_time_slots" to "anon";

grant update on table "public"."subject_time_slots" to "anon";

grant delete on table "public"."subject_time_slots" to "authenticated";

grant insert on table "public"."subject_time_slots" to "authenticated";

grant references on table "public"."subject_time_slots" to "authenticated";

grant select on table "public"."subject_time_slots" to "authenticated";

grant trigger on table "public"."subject_time_slots" to "authenticated";

grant truncate on table "public"."subject_time_slots" to "authenticated";

grant update on table "public"."subject_time_slots" to "authenticated";

grant delete on table "public"."subject_time_slots" to "service_role";

grant insert on table "public"."subject_time_slots" to "service_role";

grant references on table "public"."subject_time_slots" to "service_role";

grant select on table "public"."subject_time_slots" to "service_role";

grant trigger on table "public"."subject_time_slots" to "service_role";

grant truncate on table "public"."subject_time_slots" to "service_role";

grant update on table "public"."subject_time_slots" to "service_role";

grant delete on table "public"."subjects" to "anon";

grant insert on table "public"."subjects" to "anon";

grant references on table "public"."subjects" to "anon";

grant select on table "public"."subjects" to "anon";

grant trigger on table "public"."subjects" to "anon";

grant truncate on table "public"."subjects" to "anon";

grant update on table "public"."subjects" to "anon";

grant delete on table "public"."subjects" to "authenticated";

grant insert on table "public"."subjects" to "authenticated";

grant references on table "public"."subjects" to "authenticated";

grant select on table "public"."subjects" to "authenticated";

grant trigger on table "public"."subjects" to "authenticated";

grant truncate on table "public"."subjects" to "authenticated";

grant update on table "public"."subjects" to "authenticated";

grant delete on table "public"."subjects" to "service_role";

grant insert on table "public"."subjects" to "service_role";

grant references on table "public"."subjects" to "service_role";

grant select on table "public"."subjects" to "service_role";

grant trigger on table "public"."subjects" to "service_role";

grant truncate on table "public"."subjects" to "service_role";

grant update on table "public"."subjects" to "service_role";

grant delete on table "public"."transfer_records" to "anon";

grant insert on table "public"."transfer_records" to "anon";

grant references on table "public"."transfer_records" to "anon";

grant select on table "public"."transfer_records" to "anon";

grant trigger on table "public"."transfer_records" to "anon";

grant truncate on table "public"."transfer_records" to "anon";

grant update on table "public"."transfer_records" to "anon";

grant delete on table "public"."transfer_records" to "authenticated";

grant insert on table "public"."transfer_records" to "authenticated";

grant references on table "public"."transfer_records" to "authenticated";

grant select on table "public"."transfer_records" to "authenticated";

grant trigger on table "public"."transfer_records" to "authenticated";

grant truncate on table "public"."transfer_records" to "authenticated";

grant update on table "public"."transfer_records" to "authenticated";

grant delete on table "public"."transfer_records" to "service_role";

grant insert on table "public"."transfer_records" to "service_role";

grant references on table "public"."transfer_records" to "service_role";

grant select on table "public"."transfer_records" to "service_role";

grant trigger on table "public"."transfer_records" to "service_role";

grant truncate on table "public"."transfer_records" to "service_role";

grant update on table "public"."transfer_records" to "service_role";

grant delete on table "public"."user_role_cache" to "anon";

grant insert on table "public"."user_role_cache" to "anon";

grant references on table "public"."user_role_cache" to "anon";

grant select on table "public"."user_role_cache" to "anon";

grant trigger on table "public"."user_role_cache" to "anon";

grant truncate on table "public"."user_role_cache" to "anon";

grant update on table "public"."user_role_cache" to "anon";

grant delete on table "public"."user_role_cache" to "authenticated";

grant insert on table "public"."user_role_cache" to "authenticated";

grant references on table "public"."user_role_cache" to "authenticated";

grant select on table "public"."user_role_cache" to "authenticated";

grant trigger on table "public"."user_role_cache" to "authenticated";

grant truncate on table "public"."user_role_cache" to "authenticated";

grant update on table "public"."user_role_cache" to "authenticated";

grant delete on table "public"."user_role_cache" to "service_role";

grant insert on table "public"."user_role_cache" to "service_role";

grant references on table "public"."user_role_cache" to "service_role";

grant select on table "public"."user_role_cache" to "service_role";

grant trigger on table "public"."user_role_cache" to "service_role";

grant truncate on table "public"."user_role_cache" to "service_role";

grant update on table "public"."user_role_cache" to "service_role";

create policy "academic_years_delete_policy"
on "public"."academic_years"
as permissive
for delete
to public
using (((is_school_admin(auth.uid(), school_id) OR is_super_admin(auth.uid())) AND (NOT is_locked) AND (NOT is_current)));


create policy "academic_years_insert_policy"
on "public"."academic_years"
as permissive
for insert
to public
with check ((is_school_admin(auth.uid(), school_id) OR is_super_admin(auth.uid())));


create policy "academic_years_select_policy"
on "public"."academic_years"
as permissive
for select
to public
using ((has_any_role_in_school(auth.uid(), school_id) OR is_super_admin(auth.uid())));


create policy "academic_years_update_policy"
on "public"."academic_years"
as permissive
for update
to public
using ((is_school_admin(auth.uid(), school_id) OR is_super_admin(auth.uid())));


create policy "batch_subjects_delete_policy"
on "public"."batch_subjects"
as permissive
for delete
to public
using ((EXISTS ( SELECT 1
   FROM subjects s
  WHERE ((s.id = batch_subjects.subject_id) AND (is_school_admin_direct(auth.uid(), s.school_id) OR is_super_admin_direct(auth.uid()))))));


create policy "batch_subjects_insert_policy"
on "public"."batch_subjects"
as permissive
for insert
to public
with check ((EXISTS ( SELECT 1
   FROM subjects s
  WHERE ((s.id = batch_subjects.subject_id) AND (is_school_admin_direct(auth.uid(), s.school_id) OR is_super_admin_direct(auth.uid()))))));


create policy "batch_subjects_update_policy"
on "public"."batch_subjects"
as permissive
for update
to public
using ((EXISTS ( SELECT 1
   FROM subjects s
  WHERE ((s.id = batch_subjects.subject_id) AND (is_school_admin_direct(auth.uid(), s.school_id) OR is_super_admin_direct(auth.uid()))))));


create policy "batches_delete_policy"
on "public"."batches"
as permissive
for delete
to public
using ((is_school_admin(auth.uid(), school_id) OR is_super_admin(auth.uid())));


create policy "batches_insert_policy"
on "public"."batches"
as permissive
for insert
to public
with check ((is_school_admin(auth.uid(), school_id) OR is_super_admin(auth.uid())));


create policy "batches_select_policy"
on "public"."batches"
as permissive
for select
to public
using ((has_any_role_in_school(auth.uid(), school_id) OR is_super_admin(auth.uid())));


create policy "batches_update_policy"
on "public"."batches"
as permissive
for update
to public
using ((is_school_admin(auth.uid(), school_id) OR is_super_admin(auth.uid())));


create policy "courses_delete_policy"
on "public"."courses"
as permissive
for delete
to public
using ((is_school_admin(auth.uid(), school_id) OR is_super_admin(auth.uid())));


create policy "courses_insert_policy"
on "public"."courses"
as permissive
for insert
to public
with check ((is_school_admin_direct(auth.uid(), school_id) OR is_super_admin_direct(auth.uid())));


create policy "courses_select_policy"
on "public"."courses"
as permissive
for select
to public
using ((has_any_role_in_school(auth.uid(), school_id) OR is_super_admin(auth.uid())));


create policy "courses_update_policy"
on "public"."courses"
as permissive
for update
to public
using ((is_school_admin(auth.uid(), school_id) OR is_super_admin(auth.uid())));


create policy "departments_delete_policy"
on "public"."departments"
as permissive
for delete
to public
using ((is_school_admin(auth.uid(), school_id) OR is_super_admin(auth.uid())));


create policy "departments_select_policy"
on "public"."departments"
as permissive
for select
to public
using ((has_any_role_in_school(auth.uid(), school_id) OR is_super_admin(auth.uid())));


create policy "departments_update_policy"
on "public"."departments"
as permissive
for update
to public
using ((is_school_admin(auth.uid(), school_id) OR is_super_admin(auth.uid())));


create policy "grade_thresholds_delete_policy"
on "public"."grade_thresholds"
as permissive
for delete
to public
using ((EXISTS ( SELECT 1
   FROM (user_role_cache urc
     JOIN grading_systems gs ON ((gs.school_id = urc.school_id)))
  WHERE ((urc.user_id = auth.uid()) AND (gs.id = grade_thresholds.grading_system_id) AND ((urc.user_role = 'school_admin'::user_role) OR (urc.user_role = 'super_admin'::user_role))))));


create policy "grade_thresholds_insert_policy"
on "public"."grade_thresholds"
as permissive
for insert
to public
with check ((EXISTS ( SELECT 1
   FROM (user_role_cache urc
     JOIN grading_systems gs ON ((gs.school_id = urc.school_id)))
  WHERE ((urc.user_id = auth.uid()) AND (gs.id = grade_thresholds.grading_system_id) AND ((urc.user_role = 'school_admin'::user_role) OR (urc.user_role = 'super_admin'::user_role))))));


create policy "grade_thresholds_read_policy"
on "public"."grade_thresholds"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
   FROM (user_role_cache urc
     JOIN grading_systems gs ON ((gs.school_id = urc.school_id)))
  WHERE ((urc.user_id = auth.uid()) AND (gs.id = grade_thresholds.grading_system_id) AND ((urc.user_role = 'school_admin'::user_role) OR (urc.user_role = 'super_admin'::user_role) OR (urc.user_role = 'teacher'::user_role))))));


create policy "grade_thresholds_update_policy"
on "public"."grade_thresholds"
as permissive
for update
to public
using ((EXISTS ( SELECT 1
   FROM (user_role_cache urc
     JOIN grading_systems gs ON ((gs.school_id = urc.school_id)))
  WHERE ((urc.user_id = auth.uid()) AND (gs.id = grade_thresholds.grading_system_id) AND ((urc.user_role = 'school_admin'::user_role) OR (urc.user_role = 'super_admin'::user_role))))));


create policy "grading_systems_delete_policy"
on "public"."grading_systems"
as permissive
for delete
to public
using ((EXISTS ( SELECT 1
   FROM user_role_cache urc
  WHERE ((urc.user_id = auth.uid()) AND (urc.school_id = grading_systems.school_id) AND ((urc.user_role = 'school_admin'::user_role) OR (urc.user_role = 'super_admin'::user_role))))));


create policy "grading_systems_insert_policy"
on "public"."grading_systems"
as permissive
for insert
to public
with check ((EXISTS ( SELECT 1
   FROM user_role_cache urc
  WHERE ((urc.user_id = auth.uid()) AND (urc.school_id = grading_systems.school_id) AND ((urc.user_role = 'school_admin'::user_role) OR (urc.user_role = 'super_admin'::user_role))))));


create policy "grading_systems_read_policy"
on "public"."grading_systems"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
   FROM user_role_cache urc
  WHERE ((urc.user_id = auth.uid()) AND (urc.school_id = grading_systems.school_id) AND ((urc.user_role = 'school_admin'::user_role) OR (urc.user_role = 'super_admin'::user_role) OR (urc.user_role = 'teacher'::user_role))))));


create policy "grading_systems_update_policy"
on "public"."grading_systems"
as permissive
for update
to public
using ((EXISTS ( SELECT 1
   FROM user_role_cache urc
  WHERE ((urc.user_id = auth.uid()) AND (urc.school_id = grading_systems.school_id) AND ((urc.user_role = 'school_admin'::user_role) OR (urc.user_role = 'super_admin'::user_role))))));


create policy "Profiles policy for students"
on "public"."profiles"
as permissive
for all
to public
using (true)
with check (((( SELECT profiles_1.role
   FROM profiles profiles_1
  WHERE (profiles_1.id = auth.uid())) = 'super_admin'::user_role) OR ((( SELECT profiles_1.role
   FROM profiles profiles_1
  WHERE (profiles_1.id = auth.uid())) = 'school_admin'::user_role) AND (( SELECT profiles_1.school_id
   FROM profiles profiles_1
  WHERE (profiles_1.id = auth.uid())) = school_id)) OR (id = auth.uid()) OR ( SELECT (current_setting('role'::text) = 'service_role'::text))));


create policy "profiles_delete_policy"
on "public"."profiles"
as permissive
for delete
to public
using ((is_school_admin(auth.uid(), school_id) OR is_super_admin(auth.uid())));


create policy "profiles_insert_policy"
on "public"."profiles"
as permissive
for insert
to public
with check ((has_any_role_in_school(auth.uid(), school_id) OR is_super_admin(auth.uid())));


create policy "profiles_read_policy"
on "public"."profiles"
as permissive
for select
to public
using ((has_any_role_in_school(auth.uid(), school_id) OR is_super_admin(auth.uid())));


create policy "profiles_update_policy"
on "public"."profiles"
as permissive
for update
to public
using (((auth.uid() = id) OR is_school_admin(auth.uid(), school_id) OR is_super_admin(auth.uid())));


create policy "schools_delete_policy"
on "public"."schools"
as permissive
for delete
to public
using (is_super_admin(auth.uid()));


create policy "schools_select_policy"
on "public"."schools"
as permissive
for select
to public
using ((has_any_role_in_school(auth.uid(), id) OR is_super_admin(auth.uid())));


create policy "schools_update_policy"
on "public"."schools"
as permissive
for update
to public
using ((is_school_admin(auth.uid(), id) OR is_super_admin(auth.uid())));


create policy "Authenticated users can create student details"
on "public"."student_details"
as permissive
for insert
to authenticated
with check (true);


create policy "Student details policy"
on "public"."student_details"
as permissive
for all
to public
using (true)
with check (((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'super_admin'::user_role)))) OR (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'school_admin'::user_role) AND (profiles.school_id = student_details.school_id)))) OR (id = auth.uid()) OR ( SELECT (current_setting('role'::text) = 'service_role'::text))));


create policy "subject_categories_delete_policy"
on "public"."subject_categories"
as permissive
for delete
to public
using ((is_school_admin_direct(auth.uid(), school_id) OR is_super_admin_direct(auth.uid())));


create policy "subject_categories_insert_policy"
on "public"."subject_categories"
as permissive
for insert
to public
with check ((is_school_admin_direct(auth.uid(), school_id) OR is_super_admin_direct(auth.uid())));


create policy "subject_categories_update_policy"
on "public"."subject_categories"
as permissive
for update
to public
using ((is_school_admin_direct(auth.uid(), school_id) OR is_super_admin_direct(auth.uid())));


create policy "subjects_delete_policy"
on "public"."subjects"
as permissive
for delete
to public
using ((is_school_admin_direct(auth.uid(), school_id) OR is_super_admin_direct(auth.uid())));


create policy "subjects_insert_policy"
on "public"."subjects"
as permissive
for insert
to public
with check ((is_school_admin_direct(auth.uid(), school_id) OR is_super_admin_direct(auth.uid())));


create policy "subjects_school_admin_archived_policy"
on "public"."subjects"
as permissive
for all
to authenticated
using ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.school_id = subjects.school_id) AND (profiles.role = 'school_admin'::user_role)))));


create policy "subjects_update_policy"
on "public"."subjects"
as permissive
for update
to public
using ((is_school_admin_direct(auth.uid(), school_id) OR is_super_admin_direct(auth.uid())));


CREATE TRIGGER single_current_academic_year_trigger BEFORE INSERT OR UPDATE ON public.academic_years FOR EACH ROW EXECUTE FUNCTION ensure_single_current_academic_year();

CREATE TRIGGER check_student_role BEFORE INSERT OR UPDATE ON public.batch_students FOR EACH ROW EXECUTE FUNCTION validate_student_role();

CREATE TRIGGER check_teacher_role BEFORE INSERT OR UPDATE ON public.batches FOR EACH ROW EXECUTE FUNCTION validate_teacher_role();


