-- Drop existing function if it exists
DROP FUNCTION IF EXISTS create_academic_year(p_name TEXT, p_start_date DATE, p_end_date DATE, p_school_id UUID, p_is_active BOOLEAN, p_is_archived BOOLEAN);

-- Create function to create academic year with proper table qualification
CREATE OR REPLACE FUNCTION create_academic_year(
  p_name TEXT,
  p_start_date DATE,
  p_end_date DATE,
  p_school_id UUID,
  p_is_active BOOLEAN DEFAULT false,
  p_is_archived BOOLEAN DEFAULT false
) RETURNS public.academic_years AS $$
DECLARE
  v_academic_year public.academic_years;
  v_school_exists BOOLEAN;
BEGIN
  -- Verify the school exists
  SELECT EXISTS (
    SELECT 1 
    FROM public.schools s 
    WHERE s.id = p_school_id
  ) INTO v_school_exists;

  IF NOT v_school_exists THEN
    RAISE EXCEPTION 'School with ID % does not exist', p_school_id;
  END IF;

  -- Insert the new academic year with explicit table qualification
  INSERT INTO public.academic_years ay (
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
$$ LANGUAGE plpgsql SECURITY DEFINER; 