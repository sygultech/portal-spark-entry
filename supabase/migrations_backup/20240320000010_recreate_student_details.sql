-- Drop existing table and related objects
DROP TABLE IF EXISTS public.student_details CASCADE;

-- Recreate the table
CREATE TABLE IF NOT EXISTS public.student_details (
    id uuid NOT NULL,
    admission_number character varying(50) NOT NULL,
    date_of_birth date,
    gender character varying(10),
    address text,
    batch_id uuid,
    nationality character varying(100),
    mother_tongue character varying(50),
    blood_group character varying(5),
    religion character varying(50),
    caste character varying(50),
    category character varying(50),
    phone character varying(20),
    previous_school_name character varying(200),
    previous_school_board character varying(100),
    previous_school_year character varying(20),
    previous_school_percentage numeric(5,2),
    tc_number character varying(100),
    admission_date date DEFAULT CURRENT_DATE,
    status character varying(20) DEFAULT 'active'::character varying,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    school_id uuid NOT NULL,
    CONSTRAINT student_details_gender_check CHECK ((gender::text = ANY (ARRAY['male'::character varying, 'female'::character varying, 'other'::character varying]::text[]))),
    CONSTRAINT student_details_status_check CHECK ((status::text = ANY (ARRAY['active'::character varying, 'transferred'::character varying, 'graduated'::character varying, 'inactive'::character varying]::text[]))),
    CONSTRAINT student_details_pkey PRIMARY KEY (id),
    CONSTRAINT student_details_id_fkey FOREIGN KEY (id) REFERENCES public.profiles(id) ON DELETE CASCADE,
    CONSTRAINT student_details_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE,
    CONSTRAINT student_details_batch_id_fkey FOREIGN KEY (batch_id) REFERENCES public.batches(id) ON DELETE SET NULL
);

-- Set ownership
ALTER TABLE public.student_details OWNER TO postgres;

-- Enable RLS
ALTER TABLE public.student_details ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
CREATE POLICY "Student details policy"
    ON public.student_details
    FOR ALL
    USING (true)  -- Allow all rows to be read by all users
    WITH CHECK (
        -- Allow if the user is a super_admin
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role = 'super_admin'
        )
        OR
        -- Allow if the user is a school_admin for the school
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role = 'school_admin'
            AND school_id = student_details.school_id
        )
        OR 
        -- Allow users to access their own records
        id = auth.uid()
    );

-- Grant permissions
GRANT ALL ON public.student_details TO authenticated;
GRANT ALL ON public.student_details TO service_role; 