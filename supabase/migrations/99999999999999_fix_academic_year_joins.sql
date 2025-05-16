-- Drop existing functions that might have ambiguous references
DROP FUNCTION IF EXISTS set_active_academic_year(year_id UUID, school_id UUID);
DROP FUNCTION IF EXISTS create_academic_year(p_name TEXT, p_start_date DATE, p_end_date DATE, p_school_id UUID, p_is_active BOOLEAN, p_is_archived BOOLEAN);

-- Create function to set active academic year with explicit table references
CREATE OR REPLACE FUNCTION set_active_academic_year(
  year_id UUID,
  school_id UUID
) RETURNS SETOF academic_years AS $$
BEGIN
  -- First, set all academic years for the school to inactive
  UPDATE public.academic_years ay
  SET 
    is_active = false,
    updated_at = NOW()
  WHERE ay.school_id = $2;

  -- Then set the specified academic year as active
  UPDATE public.academic_years ay
  SET 
    is_active = true,
    updated_at = NOW()
  WHERE ay.id = $1
    AND ay.school_id = $2
  RETURNING *;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to create academic year with explicit table references
CREATE OR REPLACE FUNCTION create_academic_year(
  p_name TEXT,
  p_start_date DATE,
  p_end_date DATE,
  p_school_id UUID,
  p_is_active BOOLEAN DEFAULT false,
  p_is_archived BOOLEAN DEFAULT false
) RETURNS academic_years AS $$
DECLARE
  v_academic_year academic_years;
BEGIN
  -- Insert the new academic year with explicit table qualification
  INSERT INTO public.academic_years (
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