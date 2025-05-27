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