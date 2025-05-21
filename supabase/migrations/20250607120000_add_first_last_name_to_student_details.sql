-- Add first_name and last_name columns to student_details
ALTER TABLE public.student_details
  ADD COLUMN first_name text NOT NULL DEFAULT '',
  ADD COLUMN last_name text NOT NULL DEFAULT '';

-- Optionally, you may want to backfill these columns from profiles if needed (not included here) 