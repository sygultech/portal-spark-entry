-- Drop existing policies
DROP POLICY IF EXISTS "School admins can create students" ON public.profiles;
DROP POLICY IF EXISTS "Function can create student profiles" ON public.profiles;

-- Create a new policy that allows both school admins and the function to create profiles
CREATE POLICY "Allow profile creation for students"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Allow if the inserting user is a school admin for the same school
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'school_admin'
      AND p.school_id = school_id
    )
    OR 
    -- Allow if the profile being created is for the authenticated user
    auth.uid() = id
  );

-- Drop existing policies for student_details
DROP POLICY IF EXISTS "School admins can create student details" ON public.student_details;
DROP POLICY IF EXISTS "Function can create student details" ON public.student_details;

-- Create a new policy that allows both school admins and the function to create student details
CREATE POLICY "Allow student details creation"
  ON public.student_details
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Allow if the inserting user is a school admin for the same school
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'school_admin'
      AND p.school_id = school_id
    )
    OR 
    -- Allow if the student details being created are for the authenticated user
    auth.uid() = id
  ); 