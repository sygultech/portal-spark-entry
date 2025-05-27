-- First, drop all policies on the profiles table
DO $$ 
DECLARE 
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', policy_record.policyname);
    END LOOP;
END $$;

-- Drop all foreign key constraints referencing the profiles table
DO $$ 
DECLARE 
    constraint_record RECORD;
BEGIN
    FOR constraint_record IN 
        SELECT tc.constraint_name, tc.table_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.constraint_column_usage ccu 
            ON tc.constraint_name = ccu.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
        AND ccu.table_name = 'profiles'
        AND ccu.table_schema = 'public'
    LOOP
        EXECUTE format('ALTER TABLE public.%I DROP CONSTRAINT %I', 
            constraint_record.table_name, 
            constraint_record.constraint_name);
    END LOOP;
END $$;

-- Create a new table with the desired structure
CREATE TABLE "public"."profiles_new" (
    "id" uuid NOT NULL,
    "email" text NOT NULL,
    "first_name" text NOT NULL,
    "last_name" text NOT NULL,
    "avatar_url" text,
    "school_id" uuid,
    "role" user_role[] NOT NULL DEFAULT ARRAY['staff']::user_role[],
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT "profiles_new_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "profiles_new_email_key" UNIQUE ("email"),
    CONSTRAINT "profiles_new_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE SET NULL
);

-- Copy data from old table to new table
INSERT INTO "public"."profiles_new" (
    "id", "email", "first_name", "last_name", "avatar_url", "school_id", "role", "created_at", "updated_at"
)
SELECT 
    "id", "email", "first_name", "last_name", "avatar_url", "school_id", 
    ARRAY[role]::user_role[], "created_at", "updated_at"
FROM "public"."profiles";

-- Drop the old table
DROP TABLE "public"."profiles";

-- Rename the new table to the original name
ALTER TABLE "public"."profiles_new" RENAME TO "profiles";

-- Add comment to explain the column
COMMENT ON COLUMN "public"."profiles"."role" IS 'Array of roles assigned to the user. The first role is considered the primary role.';

-- Recreate policies with updated role checks
CREATE POLICY "Users can view their own profile"
ON "public"."profiles"
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON "public"."profiles"
FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "School admins can view profiles in their school"
ON "public"."profiles"
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM "public"."profiles" AS admin_profile
    WHERE admin_profile.id = auth.uid()
    AND admin_profile.school_id = profiles.school_id
    AND 'school_admin' = ANY(admin_profile.role)
  )
);

CREATE POLICY "Super admins can view all profiles"
ON "public"."profiles"
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM "public"."profiles" AS admin_profile
    WHERE admin_profile.id = auth.uid()
    AND 'super_admin' = ANY(admin_profile.role)
  )
);

CREATE POLICY "profiles_delete_policy"
ON "public"."profiles"
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM "public"."profiles" AS admin_profile
    WHERE admin_profile.id = auth.uid()
    AND (
      ('school_admin' = ANY(admin_profile.role) AND admin_profile.school_id = profiles.school_id)
      OR 'super_admin' = ANY(admin_profile.role)
    )
  )
);

CREATE POLICY "profiles_insert_policy"
ON "public"."profiles"
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM "public"."profiles" AS admin_profile
    WHERE admin_profile.id = auth.uid()
    AND (
      ('school_admin' = ANY(admin_profile.role) AND admin_profile.school_id = profiles.school_id)
      OR 'super_admin' = ANY(admin_profile.role)
    )
  )
);

CREATE POLICY "profiles_read_policy"
ON "public"."profiles"
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM "public"."profiles" AS admin_profile
    WHERE admin_profile.id = auth.uid()
    AND (
      ('school_admin' = ANY(admin_profile.role) AND admin_profile.school_id = profiles.school_id)
      OR 'super_admin' = ANY(admin_profile.role)
    )
  )
  OR id = auth.uid()
);

CREATE POLICY "profiles_update_policy"
ON "public"."profiles"
FOR UPDATE
USING (
  id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM "public"."profiles" AS admin_profile
    WHERE admin_profile.id = auth.uid()
    AND (
      ('school_admin' = ANY(admin_profile.role) AND admin_profile.school_id = profiles.school_id)
      OR 'super_admin' = ANY(admin_profile.role)
    )
  )
); 