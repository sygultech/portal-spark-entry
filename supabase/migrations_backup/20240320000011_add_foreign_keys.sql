-- Drop existing foreign key constraints if they exist
ALTER TABLE IF EXISTS public.student_details 
    DROP CONSTRAINT IF EXISTS student_details_id_fkey,
    DROP CONSTRAINT IF EXISTS student_details_school_id_fkey,
    DROP CONSTRAINT IF EXISTS student_details_batch_id_fkey;

-- Add foreign key constraints
ALTER TABLE public.student_details
    ADD CONSTRAINT student_details_id_fkey 
    FOREIGN KEY (id) 
    REFERENCES public.profiles(id) 
    ON DELETE CASCADE;

ALTER TABLE public.student_details
    ADD CONSTRAINT student_details_school_id_fkey 
    FOREIGN KEY (school_id) 
    REFERENCES public.schools(id) 
    ON DELETE CASCADE;

ALTER TABLE public.student_details
    ADD CONSTRAINT student_details_batch_id_fkey 
    FOREIGN KEY (batch_id) 
    REFERENCES public.batches(id) 
    ON DELETE SET NULL;

-- Add primary key constraint if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname = 'student_details_pkey'
    ) THEN
        ALTER TABLE public.student_details
            ADD CONSTRAINT student_details_pkey 
            PRIMARY KEY (id);
    END IF;
END $$; 