-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid PRIMARY KEY,
    email text NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    role text NOT NULL,
    school_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create student_details table
CREATE TABLE IF NOT EXISTS public.student_details (
    id uuid PRIMARY KEY,
    profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    admission_number text NOT NULL,
    school_id uuid NOT NULL,
    status text NOT NULL DEFAULT 'active',
    gender text,
    batch_id uuid,
    date_of_birth date,
    address text,
    nationality text,
    mother_tongue text,
    blood_group text,
    religion text,
    caste text,
    category text,
    phone text,
    previous_school_name text,
    previous_school_board text,
    previous_school_year text,
    previous_school_percentage text,
    admission_date date,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
); 