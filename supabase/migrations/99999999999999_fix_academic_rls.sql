-- Drop existing policies
DROP POLICY IF EXISTS "Users can view academic years for their school" ON public.academic_years;
DROP POLICY IF EXISTS "School admins can manage academic years" ON public.academic_years;
DROP POLICY IF EXISTS "Super admins can manage all academic years" ON public.academic_years;

-- Create view policy for all users in the same school with proper table qualification
CREATE POLICY "Users can view academic years for their school"
  ON public.academic_years
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() 
      AND profiles.school_id = academic_years.school_id
    )
  );

-- Create management policy for school admins with proper table qualification
CREATE POLICY "School admins can manage academic years"
  ON public.academic_years
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() 
      AND profiles.school_id = academic_years.school_id
      AND profiles.role = 'school_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() 
      AND profiles.school_id = academic_years.school_id
      AND profiles.role = 'school_admin'
    )
  );

-- Create management policy for super admins with proper table qualification
CREATE POLICY "Super admins can manage all academic years"
  ON public.academic_years
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  ); 