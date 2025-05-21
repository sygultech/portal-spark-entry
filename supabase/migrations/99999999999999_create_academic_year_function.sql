-- Create a function to handle academic year creation with proper table qualification
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
$$ LANGUAGE plpgsql SECURITY DEFINER; 