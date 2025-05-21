-- Drop the existing function
DROP FUNCTION IF EXISTS public.add_student(
    text, uuid, text, uuid, date, text, text, text, text, text, text, text, text, text, text, text, text
);

-- Recreate the function
CREATE OR REPLACE FUNCTION public.add_student(
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
    p_previous_school_percentage text
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_student_id uuid;
    v_profile_id uuid;
    v_user_id uuid;
    v_error_context text;
BEGIN
    -- Start transaction
    BEGIN
        -- Log function call
        RAISE NOTICE 'Starting add_student function for admission number: %', p_admission_number;
        
        -- Validate required parameters
        IF p_admission_number IS NULL THEN
            RAISE EXCEPTION 'Admission number is required';
        END IF;
        
        IF p_school_id IS NULL THEN
            RAISE EXCEPTION 'School ID is required';
        END IF;
        
        IF p_batch_id IS NULL THEN
            RAISE EXCEPTION 'Batch ID is required';
        END IF;

        -- Check if admission number already exists
        IF EXISTS (
            SELECT 1 
            FROM public.student_details 
            WHERE admission_number = p_admission_number 
            AND school_id = p_school_id
        ) THEN
            RAISE EXCEPTION 'Student with admission number % already exists in this school', p_admission_number;
        END IF;

        -- Check if school exists
        IF NOT EXISTS (SELECT 1 FROM public.schools WHERE id = p_school_id) THEN
            RAISE EXCEPTION 'School with ID % does not exist', p_school_id;
        END IF;

        -- Check if batch exists and belongs to the school
        IF NOT EXISTS (
            SELECT 1 
            FROM public.batches 
            WHERE id = p_batch_id 
            AND school_id = p_school_id
        ) THEN
            RAISE EXCEPTION 'Batch with ID % does not exist or does not belong to the school', p_batch_id;
        END IF;

        -- Insert into student_details
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
            previous_school_percentage
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
            p_previous_school_percentage
        ) RETURNING id INTO v_student_id;

        -- Log success
        RAISE NOTICE 'Successfully created student with ID: %', v_student_id;
        
        RETURN v_student_id;

    EXCEPTION
        WHEN OTHERS THEN
            -- Get error context
            GET STACKED DIAGNOSTICS v_error_context = PG_EXCEPTION_CONTEXT;
            
            -- Log error details
            RAISE NOTICE 'Error in add_student function: %', SQLERRM;
            RAISE NOTICE 'Error context: %', v_error_context;
            
            -- Re-raise the exception
            RAISE;
    END;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.add_student(
    text, uuid, text, uuid, date, text, text, text, text, text, text, text, text, text, text, text, text
) TO authenticated;

-- Grant execute permission to service role
GRANT EXECUTE ON FUNCTION public.add_student(
    text, uuid, text, uuid, date, text, text, text, text, text, text, text, text, text, text, text, text
) TO service_role;

-- Add comment to function
COMMENT ON FUNCTION public.add_student(
    text, uuid, text, uuid, date, text, text, text, text, text, text, text, text, text, text, text, text
) IS 'Creates a new student record with the provided details. Returns the UUID of the created student.'; 