-- Enable RLS on student_details if not already enabled
ALTER TABLE public.student_details ENABLE ROW LEVEL SECURITY;

-- Drop the policy if it exists to avoid duplicate errors
DROP POLICY IF EXISTS "School admins can create student details" ON public.student_details;

-- Add RLS policy for student_details to allow school admins to create records
CREATE POLICY "School admins can create student details"
  ON public.student_details
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role = 'school_admin'
      AND school_id = school_id
    )
  );

-- Add RLS policy to allow the create_and_confirm_student_user function to create profiles
CREATE POLICY "Function can create student profiles"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = id OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role = 'school_admin'
      AND school_id = school_id
    )
  );

-- Add RLS policy to allow the create_and_confirm_student_user function to create student details
CREATE POLICY "Function can create student details"
  ON public.student_details
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = id OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role = 'school_admin'
      AND school_id = school_id
    )
  );

-- Grant necessary permissions to the function
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.student_details TO authenticated; 