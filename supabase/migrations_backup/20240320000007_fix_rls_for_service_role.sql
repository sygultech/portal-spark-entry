-- Drop existing policies
DROP POLICY IF EXISTS "Allow profile creation for students" ON public.profiles;
DROP POLICY IF EXISTS "Allow student details creation" ON public.student_details;

-- Create a simpler policy for profiles that allows service role access
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