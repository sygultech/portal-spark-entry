-- Add librarian role to user_role enum
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'librarian';

-- Create library_resources table
CREATE TABLE IF NOT EXISTS public.library_resources (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    author text,
    isbn text,
    category text,
    status text DEFAULT 'available',
    school_id uuid NOT NULL REFERENCES public.schools(id),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on library_resources
ALTER TABLE public.library_resources ENABLE ROW LEVEL SECURITY;

-- Update RLS policies to include librarian role
CREATE OR REPLACE FUNCTION public.is_librarian(p_user_id uuid, p_school_id uuid)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = p_user_id
        AND school_id = p_school_id
        AND role = 'librarian'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add RLS policies for librarian access
CREATE POLICY "Librarians can view library resources"
ON public.library_resources
FOR SELECT
TO authenticated
USING (
    public.is_librarian(auth.uid(), school_id) OR
    public.is_school_admin(auth.uid(), school_id) OR
    public.is_super_admin(auth.uid())
);

CREATE POLICY "Librarians can manage library resources"
ON public.library_resources
FOR ALL
TO authenticated
USING (
    public.is_librarian(auth.uid(), school_id) OR
    public.is_school_admin(auth.uid(), school_id) OR
    public.is_super_admin(auth.uid())
)
WITH CHECK (
    public.is_librarian(auth.uid(), school_id) OR
    public.is_school_admin(auth.uid(), school_id) OR
    public.is_super_admin(auth.uid())
); 