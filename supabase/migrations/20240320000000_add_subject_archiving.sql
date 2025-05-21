-- Add archiving fields to subjects table
ALTER TABLE subjects
ADD COLUMN is_archived boolean DEFAULT false,
ADD COLUMN archived_at timestamp with time zone;

-- Create index for faster queries on archived status
CREATE INDEX idx_subjects_is_archived ON subjects(is_archived);

-- Update RLS policies to handle archived subjects
CREATE POLICY "subjects_school_admin_archived_policy" ON "public"."subjects"
    AS PERMISSIVE
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 
            FROM profiles 
            WHERE 
                profiles.id = auth.uid() AND 
                profiles.school_id = subjects.school_id AND 
                profiles.role = 'school_admin'
        )
    ); 