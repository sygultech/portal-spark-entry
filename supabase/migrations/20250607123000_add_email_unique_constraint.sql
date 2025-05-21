-- Add unique index on email field (only for non-null values)
CREATE UNIQUE INDEX student_details_email_unique_idx ON public.student_details(email) WHERE email IS NOT NULL;

-- Update add_student_v2 function to check for duplicate emails
CREATE OR REPLACE FUNCTION public.add_student_v2(
    p_data jsonb
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- Grant execute permission to authenticated users and service role
GRANT EXECUTE ON FUNCTION public.add_student_v2 TO authenticated;
GRANT EXECUTE ON FUNCTION public.add_student_v2 TO service_role;

-- Force schema cache refresh
NOTIFY pgrst, 'reload schema'; 