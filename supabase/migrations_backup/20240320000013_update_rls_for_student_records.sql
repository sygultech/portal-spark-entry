-- Drop existing policies
DROP POLICY IF EXISTS "Profiles policy for students" ON public.profiles;
DROP POLICY IF EXISTS "Student details policy" ON public.student_details;

-- Create new policies that allow service role access without requiring user records
CREATE POLICY "Profiles policy for students"
  ON public.profiles
  FOR ALL
  USING (true)  -- Allow all rows to be read by all users
  WITH CHECK (
    -- Allow if the user is a super_admin
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin'
    OR
    -- Allow if the user is a school_admin for the school
    (
      (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'school_admin'
      AND
      (SELECT school_id FROM public.profiles WHERE id = auth.uid()) = school_id
    )
    OR 
    -- Allow users to access their own records
    id = auth.uid()
    OR
    -- Allow service role access without requiring user record
    (SELECT current_setting('role') = 'service_role')
  );

-- Create a simpler policy for student_details that allows service role access
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
    OR
    -- Allow service role access without requiring user record
    (SELECT current_setting('role') = 'service_role')
  );

-- Allow the service role to bypass RLS
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;
ALTER TABLE public.student_details FORCE ROW LEVEL SECURITY;

-- Grant full access to authenticated users (RLS will still apply)
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.student_details TO authenticated;

-- Grant the service role admin access to bypass RLS
GRANT ALL ON public.profiles TO service_role;
GRANT ALL ON public.student_details TO service_role; 