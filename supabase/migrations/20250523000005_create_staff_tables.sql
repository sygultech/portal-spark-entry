-- Create staff_details table
CREATE TABLE IF NOT EXISTS "public"."staff_details" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "employee_id" text NOT NULL,
    "first_name" text NOT NULL,
    "last_name" text NOT NULL,
    "email" text NOT NULL,
    "phone" text,
    "date_of_birth" date,
    "gender" text,
    "address" text,
    "city" text,
    "state" text,
    "postal_code" text,
    "profile_image_url" text,
    "join_date" date NOT NULL,
    "department_id" uuid NOT NULL,
    "designation_id" uuid NOT NULL,
    "employment_status" text NOT NULL DEFAULT 'Active',
    "school_id" uuid NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT "staff_details_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "staff_details_department_id_fkey" FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE,
    CONSTRAINT "staff_details_designation_id_fkey" FOREIGN KEY (designation_id) REFERENCES designations(id) ON DELETE CASCADE,
    CONSTRAINT "staff_details_school_id_fkey" FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
    CONSTRAINT "staff_details_email_key" UNIQUE (email),
    CONSTRAINT "staff_details_employee_id_key" UNIQUE (employee_id)
);

-- Create staff_emergency_contacts table
CREATE TABLE IF NOT EXISTS "public"."staff_emergency_contacts" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "staff_id" uuid NOT NULL,
    "contact_name" text NOT NULL,
    "relationship" text NOT NULL,
    "contact_phone" text NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT "staff_emergency_contacts_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "staff_emergency_contacts_staff_id_fkey" FOREIGN KEY (staff_id) REFERENCES staff_details(id) ON DELETE CASCADE
);

-- Create staff_qualifications table
CREATE TABLE IF NOT EXISTS "public"."staff_qualifications" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "staff_id" uuid NOT NULL,
    "degree" text NOT NULL,
    "institution" text NOT NULL,
    "year" integer NOT NULL,
    "grade" text,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT "staff_qualifications_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "staff_qualifications_staff_id_fkey" FOREIGN KEY (staff_id) REFERENCES staff_details(id) ON DELETE CASCADE
);

-- Create staff_experiences table
CREATE TABLE IF NOT EXISTS "public"."staff_experiences" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "staff_id" uuid NOT NULL,
    "position" text NOT NULL,
    "organization" text NOT NULL,
    "start_year" integer NOT NULL,
    "end_year" integer,
    "description" text,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT "staff_experiences_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "staff_experiences_staff_id_fkey" FOREIGN KEY (staff_id) REFERENCES staff_details(id) ON DELETE CASCADE
);

-- Create staff_documents table
CREATE TABLE IF NOT EXISTS "public"."staff_documents" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "staff_id" uuid NOT NULL,
    "document_type" text NOT NULL,
    "file_url" text NOT NULL,
    "file_name" text NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT "staff_documents_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "staff_documents_staff_id_fkey" FOREIGN KEY (staff_id) REFERENCES staff_details(id) ON DELETE CASCADE
);

-- Add RLS policies for staff_details
ALTER TABLE "public"."staff_details" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff details are viewable by school admins"
    ON "public"."staff_details"
    FOR SELECT
    TO authenticated
    USING (
        auth.uid() IN (
            SELECT id FROM profiles 
            WHERE school_id = staff_details.school_id 
            AND role = 'school_admin'
        )
    );

CREATE POLICY "Staff details are insertable by school admins"
    ON "public"."staff_details"
    FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() IN (
            SELECT id FROM profiles 
            WHERE school_id = staff_details.school_id 
            AND role = 'school_admin'
        )
    );

CREATE POLICY "Staff details are updatable by school admins"
    ON "public"."staff_details"
    FOR UPDATE
    TO authenticated
    USING (
        auth.uid() IN (
            SELECT id FROM profiles 
            WHERE school_id = staff_details.school_id 
            AND role = 'school_admin'
        )
    )
    WITH CHECK (
        auth.uid() IN (
            SELECT id FROM profiles 
            WHERE school_id = staff_details.school_id 
            AND role = 'school_admin'
        )
    );

CREATE POLICY "Staff details are deletable by school admins"
    ON "public"."staff_details"
    FOR DELETE
    TO authenticated
    USING (
        auth.uid() IN (
            SELECT id FROM profiles 
            WHERE school_id = staff_details.school_id 
            AND role = 'school_admin'
        )
    );

-- Add RLS policies for staff_emergency_contacts
ALTER TABLE "public"."staff_emergency_contacts" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Emergency contacts are viewable by school admins"
    ON "public"."staff_emergency_contacts"
    FOR SELECT
    TO authenticated
    USING (
        auth.uid() IN (
            SELECT id FROM profiles 
            WHERE school_id = (
                SELECT school_id FROM staff_details WHERE id = staff_emergency_contacts.staff_id
            )
            AND role = 'school_admin'
        )
    );

CREATE POLICY "Emergency contacts are insertable by school admins"
    ON "public"."staff_emergency_contacts"
    FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() IN (
            SELECT id FROM profiles 
            WHERE school_id = (
                SELECT school_id FROM staff_details WHERE id = staff_emergency_contacts.staff_id
            )
            AND role = 'school_admin'
        )
    );

CREATE POLICY "Emergency contacts are updatable by school admins"
    ON "public"."staff_emergency_contacts"
    FOR UPDATE
    TO authenticated
    USING (
        auth.uid() IN (
            SELECT id FROM profiles 
            WHERE school_id = (
                SELECT school_id FROM staff_details WHERE id = staff_emergency_contacts.staff_id
            )
            AND role = 'school_admin'
        )
    )
    WITH CHECK (
        auth.uid() IN (
            SELECT id FROM profiles 
            WHERE school_id = (
                SELECT school_id FROM staff_details WHERE id = staff_emergency_contacts.staff_id
            )
            AND role = 'school_admin'
        )
    );

CREATE POLICY "Emergency contacts are deletable by school admins"
    ON "public"."staff_emergency_contacts"
    FOR DELETE
    TO authenticated
    USING (
        auth.uid() IN (
            SELECT id FROM profiles 
            WHERE school_id = (
                SELECT school_id FROM staff_details WHERE id = staff_emergency_contacts.staff_id
            )
            AND role = 'school_admin'
        )
    );

-- Add RLS policies for staff_qualifications
ALTER TABLE "public"."staff_qualifications" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Qualifications are viewable by school admins"
    ON "public"."staff_qualifications"
    FOR SELECT
    TO authenticated
    USING (
        auth.uid() IN (
            SELECT id FROM profiles 
            WHERE school_id = (
                SELECT school_id FROM staff_details WHERE id = staff_qualifications.staff_id
            )
            AND role = 'school_admin'
        )
    );

CREATE POLICY "Qualifications are insertable by school admins"
    ON "public"."staff_qualifications"
    FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() IN (
            SELECT id FROM profiles 
            WHERE school_id = (
                SELECT school_id FROM staff_details WHERE id = staff_qualifications.staff_id
            )
            AND role = 'school_admin'
        )
    );

CREATE POLICY "Qualifications are updatable by school admins"
    ON "public"."staff_qualifications"
    FOR UPDATE
    TO authenticated
    USING (
        auth.uid() IN (
            SELECT id FROM profiles 
            WHERE school_id = (
                SELECT school_id FROM staff_details WHERE id = staff_qualifications.staff_id
            )
            AND role = 'school_admin'
        )
    )
    WITH CHECK (
        auth.uid() IN (
            SELECT id FROM profiles 
            WHERE school_id = (
                SELECT school_id FROM staff_details WHERE id = staff_qualifications.staff_id
            )
            AND role = 'school_admin'
        )
    );

CREATE POLICY "Qualifications are deletable by school admins"
    ON "public"."staff_qualifications"
    FOR DELETE
    TO authenticated
    USING (
        auth.uid() IN (
            SELECT id FROM profiles 
            WHERE school_id = (
                SELECT school_id FROM staff_details WHERE id = staff_qualifications.staff_id
            )
            AND role = 'school_admin'
        )
    );

-- Add RLS policies for staff_experiences
ALTER TABLE "public"."staff_experiences" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Experiences are viewable by school admins"
    ON "public"."staff_experiences"
    FOR SELECT
    TO authenticated
    USING (
        auth.uid() IN (
            SELECT id FROM profiles 
            WHERE school_id = (
                SELECT school_id FROM staff_details WHERE id = staff_experiences.staff_id
            )
            AND role = 'school_admin'
        )
    );

CREATE POLICY "Experiences are insertable by school admins"
    ON "public"."staff_experiences"
    FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() IN (
            SELECT id FROM profiles 
            WHERE school_id = (
                SELECT school_id FROM staff_details WHERE id = staff_experiences.staff_id
            )
            AND role = 'school_admin'
        )
    );

CREATE POLICY "Experiences are updatable by school admins"
    ON "public"."staff_experiences"
    FOR UPDATE
    TO authenticated
    USING (
        auth.uid() IN (
            SELECT id FROM profiles 
            WHERE school_id = (
                SELECT school_id FROM staff_details WHERE id = staff_experiences.staff_id
            )
            AND role = 'school_admin'
        )
    )
    WITH CHECK (
        auth.uid() IN (
            SELECT id FROM profiles 
            WHERE school_id = (
                SELECT school_id FROM staff_details WHERE id = staff_experiences.staff_id
            )
            AND role = 'school_admin'
        )
    );

CREATE POLICY "Experiences are deletable by school admins"
    ON "public"."staff_experiences"
    FOR DELETE
    TO authenticated
    USING (
        auth.uid() IN (
            SELECT id FROM profiles 
            WHERE school_id = (
                SELECT school_id FROM staff_details WHERE id = staff_experiences.staff_id
            )
            AND role = 'school_admin'
        )
    );

-- Add RLS policies for staff_documents
ALTER TABLE "public"."staff_documents" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Documents are viewable by school admins"
    ON "public"."staff_documents"
    FOR SELECT
    TO authenticated
    USING (
        auth.uid() IN (
            SELECT id FROM profiles 
            WHERE school_id = (
                SELECT school_id FROM staff_details WHERE id = staff_documents.staff_id
            )
            AND role = 'school_admin'
        )
    );

CREATE POLICY "Documents are insertable by school admins"
    ON "public"."staff_documents"
    FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() IN (
            SELECT id FROM profiles 
            WHERE school_id = (
                SELECT school_id FROM staff_details WHERE id = staff_documents.staff_id
            )
            AND role = 'school_admin'
        )
    );

CREATE POLICY "Documents are updatable by school admins"
    ON "public"."staff_documents"
    FOR UPDATE
    TO authenticated
    USING (
        auth.uid() IN (
            SELECT id FROM profiles 
            WHERE school_id = (
                SELECT school_id FROM staff_details WHERE id = staff_documents.staff_id
            )
            AND role = 'school_admin'
        )
    )
    WITH CHECK (
        auth.uid() IN (
            SELECT id FROM profiles 
            WHERE school_id = (
                SELECT school_id FROM staff_details WHERE id = staff_documents.staff_id
            )
            AND role = 'school_admin'
        )
    );

CREATE POLICY "Documents are deletable by school admins"
    ON "public"."staff_documents"
    FOR DELETE
    TO authenticated
    USING (
        auth.uid() IN (
            SELECT id FROM profiles 
            WHERE school_id = (
                SELECT school_id FROM staff_details WHERE id = staff_documents.staff_id
            )
            AND role = 'school_admin'
        )
    );

-- Create triggers for updated_at columns
CREATE TRIGGER update_staff_details_updated_at
    BEFORE UPDATE ON staff_details
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_staff_emergency_contacts_updated_at
    BEFORE UPDATE ON staff_emergency_contacts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_staff_qualifications_updated_at
    BEFORE UPDATE ON staff_qualifications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_staff_experiences_updated_at
    BEFORE UPDATE ON staff_experiences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_staff_documents_updated_at
    BEFORE UPDATE ON staff_documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 