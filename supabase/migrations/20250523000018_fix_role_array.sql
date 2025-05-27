-- Drop dependent policies first
DROP POLICY IF EXISTS "Users can view their own profile" ON "public"."profiles";
DROP POLICY IF EXISTS "Users can update their own profile" ON "public"."profiles";
DROP POLICY IF EXISTS "School admins can view profiles in their school" ON "public"."profiles";
DROP POLICY IF EXISTS "Super admins can view all profiles" ON "public"."profiles";
DROP POLICY IF EXISTS "profiles_delete_policy" ON "public"."profiles";
DROP POLICY IF EXISTS "profiles_insert_policy" ON "public"."profiles";
DROP POLICY IF EXISTS "profiles_read_policy" ON "public"."profiles";
DROP POLICY IF EXISTS "profiles_update_policy" ON "public"."profiles";

-- Modify the role column to be an array type
ALTER TABLE "public"."profiles" 
    ALTER COLUMN "role" TYPE "public"."user_role"[] 
    USING ARRAY[role]::user_role[];

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