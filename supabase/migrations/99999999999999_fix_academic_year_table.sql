-- Drop existing table if it exists
DROP TABLE IF EXISTS public.academic_years CASCADE;

-- Create academic_years table with proper constraints
CREATE TABLE public.academic_years (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT false,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT academic_years_date_check CHECK (end_date > start_date),
  CONSTRAINT academic_years_name_school_unique UNIQUE (name, school_id)
);

-- Create index on school_id for better performance
CREATE INDEX academic_years_school_id_idx ON public.academic_years(school_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_academic_years_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER academic_years_updated_at
  BEFORE UPDATE ON public.academic_years
  FOR EACH ROW
  EXECUTE FUNCTION update_academic_years_updated_at(); 