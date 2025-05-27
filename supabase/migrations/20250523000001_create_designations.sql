-- Create designations table
CREATE TABLE IF NOT EXISTS "public"."designations" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "name" text NOT NULL,
    "description" text,
    "department_id" uuid NOT NULL,
    "school_id" uuid NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT "designations_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "designations_department_id_fkey" FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE,
    CONSTRAINT "designations_school_id_fkey" FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE
);

-- Add RLS policies
ALTER TABLE "public"."designations" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Designations are viewable by school admins"
    ON "public"."designations"
    FOR SELECT
    TO authenticated
    USING (
        auth.uid() IN (
            SELECT id FROM profiles 
            WHERE school_id = designations.school_id 
            AND role = 'school_admin'
        )
    );

CREATE POLICY "Designations are insertable by school admins"
    ON "public"."designations"
    FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() IN (
            SELECT id FROM profiles 
            WHERE school_id = designations.school_id 
            AND role = 'school_admin'
        )
    );

CREATE POLICY "Designations are updatable by school admins"
    ON "public"."designations"
    FOR UPDATE
    TO authenticated
    USING (
        auth.uid() IN (
            SELECT id FROM profiles 
            WHERE school_id = designations.school_id 
            AND role = 'school_admin'
        )
    )
    WITH CHECK (
        auth.uid() IN (
            SELECT id FROM profiles 
            WHERE school_id = designations.school_id 
            AND role = 'school_admin'
        )
    );

CREATE POLICY "Designations are deletable by school admins"
    ON "public"."designations"
    FOR DELETE
    TO authenticated
    USING (
        auth.uid() IN (
            SELECT id FROM profiles 
            WHERE school_id = designations.school_id 
            AND role = 'school_admin'
        )
    );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for designations table
CREATE TRIGGER update_designations_updated_at
    BEFORE UPDATE ON designations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 