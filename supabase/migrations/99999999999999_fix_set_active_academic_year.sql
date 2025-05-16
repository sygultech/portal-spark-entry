-- Drop the existing function if it exists
DROP FUNCTION IF EXISTS set_active_academic_year(year_id UUID, school_id UUID);

-- Create the function with proper table qualification
CREATE OR REPLACE FUNCTION set_active_academic_year(
  year_id UUID,
  school_id UUID
) RETURNS SETOF public.academic_years AS $$
DECLARE
  v_year_exists BOOLEAN;
  v_year_school_id UUID;
BEGIN
  -- Verify the academic year exists and belongs to the specified school
  SELECT EXISTS (
    SELECT 1 
    FROM public.academic_years ay
    WHERE ay.id = year_id 
    AND ay.school_id = school_id
  ) INTO v_year_exists;

  IF NOT v_year_exists THEN
    RAISE EXCEPTION 'Academic year with ID % does not exist or does not belong to school %', year_id, school_id;
  END IF;

  -- First, set all academic years for the school to inactive
  UPDATE public.academic_years ay
  SET 
    is_active = false,
    updated_at = NOW()
  WHERE ay.school_id = school_id;

  -- Then set the specified academic year as active
  RETURN QUERY
  UPDATE public.academic_years ay
  SET 
    is_active = true,
    updated_at = NOW()
  WHERE ay.id = year_id
    AND ay.school_id = school_id
  RETURNING *;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 