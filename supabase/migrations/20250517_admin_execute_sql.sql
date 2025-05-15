
-- Ensure the execute_admin_sql function exists
CREATE OR REPLACE FUNCTION public.execute_admin_sql(sql text)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Execute the SQL statement
  EXECUTE sql;
END;
$$;

-- Only allow access for service_role
REVOKE ALL ON FUNCTION public.execute_admin_sql FROM PUBLIC;
REVOKE ALL ON FUNCTION public.execute_admin_sql FROM anon;
REVOKE ALL ON FUNCTION public.execute_admin_sql FROM authenticated;
GRANT EXECUTE ON FUNCTION public.execute_admin_sql TO service_role;

-- Create function to ensure batch_students table exists
CREATE OR REPLACE FUNCTION public.ensure_batch_students_table()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  table_exists BOOLEAN;
BEGIN
  -- Check if table exists
  SELECT EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename  = 'batch_students'
  ) INTO table_exists;
  
  -- If table doesn't exist, create it
  IF NOT table_exists THEN
    -- Create the batch_students table
    CREATE TABLE public.batch_students (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      batch_id UUID REFERENCES batches(id) NOT NULL,
      student_id UUID REFERENCES profiles(id) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      UNIQUE(batch_id, student_id)
    );
    
    -- Add RLS policies
    ALTER TABLE public.batch_students ENABLE ROW LEVEL SECURITY;
    
    -- School admin policies
    CREATE POLICY "School admins can view student assignments" 
    ON public.batch_students FOR SELECT 
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM public.batches 
        WHERE public.batches.id = public.batch_students.batch_id 
        AND public.batches.school_id = (SELECT school_id FROM profiles WHERE id = auth.uid())
      )
    );
    
    CREATE POLICY "School admins can insert student assignments" 
    ON public.batch_students FOR INSERT 
    TO authenticated
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.batches 
        WHERE public.batches.id = public.batch_students.batch_id 
        AND public.batches.school_id = (SELECT school_id FROM profiles WHERE id = auth.uid())
      )
    );
    
    CREATE POLICY "School admins can update student assignments" 
    ON public.batch_students FOR UPDATE 
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM public.batches 
        WHERE public.batches.id = public.batch_students.batch_id 
        AND public.batches.school_id = (SELECT school_id FROM profiles WHERE id = auth.uid())
      )
    );
    
    CREATE POLICY "School admins can delete student assignments" 
    ON public.batch_students FOR DELETE 
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM public.batches 
        WHERE public.batches.id = public.batch_students.batch_id 
        AND public.batches.school_id = (SELECT school_id FROM profiles WHERE id = auth.uid())
      )
    );
  END IF;
  
  RETURN TRUE;
END;
$$;

GRANT EXECUTE ON FUNCTION public.ensure_batch_students_table TO authenticated;
GRANT EXECUTE ON FUNCTION public.ensure_batch_students_table TO service_role;
