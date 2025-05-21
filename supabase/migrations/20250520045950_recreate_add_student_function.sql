-- Drop the existing function if it exists
DROP FUNCTION IF EXISTS public.add_student;

-- Create the function with a new name
CREATE OR REPLACE FUNCTION public.add_student_v2(
    p_admission_number text,
    p_school_id uuid,
    p_gender text,
    p_batch_id uuid,
    p_date_of_birth date,
    p_address text,
    p_nationality text,
    p_mother_tongue text,
    p_blood_group text,
    p_religion text,
    p_caste text,
    p_category text,
    p_phone text,
    p_previous_school_name text,
    p_previous_school_board text,
    p_previous_school_year text,
    p_previous_school_percentage numeric
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_student_id uuid;
BEGIN
    -- Validate required parameters
    IF p_admission_number IS NULL THEN
        RAISE EXCEPTION 'Admission number is required';
    END IF;

    IF p_school_id IS NULL THEN
        RAISE EXCEPTION 'School ID is required';
    END IF;

    IF p_gender IS NULL THEN
        RAISE EXCEPTION 'Gender is required';
    END IF;

    IF p_batch_id IS NULL THEN
        RAISE EXCEPTION 'Batch ID is required';
    END IF;

    -- Insert into student_details table
    INSERT INTO public.student_details (
        admission_number,
        school_id,
        gender,
        batch_id,
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
        status
    ) VALUES (
        p_admission_number,
        p_school_id,
        p_gender,
        p_batch_id,
        p_date_of_birth,
        p_address,
        p_nationality,
        p_mother_tongue,
        p_blood_group,
        p_religion,
        p_caste,
        p_category,
        p_phone,
        p_previous_school_name,
        p_previous_school_board,
        p_previous_school_year,
        p_previous_school_percentage,
        'active'
    ) RETURNING id INTO v_student_id;

    RETURN v_student_id;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.add_student_v2 TO authenticated;
GRANT EXECUTE ON FUNCTION public.add_student_v2 TO service_role;

-- Force schema cache refresh
NOTIFY pgrst, 'reload schema'; 