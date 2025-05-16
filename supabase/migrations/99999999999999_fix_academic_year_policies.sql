-- Drop existing policies and functions
DROP POLICY IF EXISTS "Users can view academic years for their school" ON public.academic_years;
DROP POLICY IF EXISTS "School admins can manage academic years" ON public.academic_years;
DROP POLICY IF EXISTS "Super admins can manage all academic years" ON public.academic_years;
DROP FUNCTION IF EXISTS set_active_academic_year(year_id UUID, school_id UUID);
DROP FUNCTION IF EXISTS create_academic_year(p_name TEXT, p_start_date DATE, p_end_date DATE, p_school_id UUID, p_is_active BOOLEAN, p_is_archived BOOLEAN);

-- Create function to set active academic year
CREATE OR REPLACE FUNCTION set_active_academic_year(
  year_id UUID,
  school_id UUID
) RETURNS SETOF academic_years AS $$
BEGIN
  -- First, set all academic years for the school to inactive
  UPDATE public.academic_years
  SET 
    is_active = false,
    updated_at = NOW()
  WHERE school_id = $2;

  -- Then set the specified academic year as active
  RETURN QUERY
  UPDATE public.academic_years
  SET 
    is_active = true,
    updated_at = NOW()
  WHERE id = $1
    AND school_id = $2
  RETURNING *;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to create academic year
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
  -- Insert the new academic year
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

-- Create view policy for all users in the same school
CREATE POLICY "Users can view academic years for their school"
  ON public.academic_years
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 
      FROM public.profiles p
      WHERE p.id = auth.uid() 
      AND p.school_id = academic_years.school_id
    )
  );

-- Create management policy for school admins
CREATE POLICY "School admins can manage academic years"
  ON public.academic_years
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 
      FROM public.profiles p
      WHERE p.id = auth.uid() 
      AND p.school_id = academic_years.school_id
      AND p.role = 'school_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM public.profiles p
      WHERE p.id = auth.uid() 
      AND p.school_id = academic_years.school_id
      AND p.role = 'school_admin'
    )
  );

-- Create management policy for super admins
CREATE POLICY "Super admins can manage all academic years"
  ON public.academic_years
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 
      FROM public.profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM public.profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'super_admin'
    )
  ); 