-- Add profile_id column to staff_details table
ALTER TABLE "public"."staff_details"
ADD COLUMN "profile_id" uuid,
ADD CONSTRAINT "staff_details_profile_id_fkey" 
FOREIGN KEY ("profile_id") 
REFERENCES "public"."profiles"("id") 
ON DELETE SET NULL;

-- Add index for better query performance
CREATE INDEX "staff_details_profile_id_idx" 
ON "public"."staff_details"("profile_id");

-- Update RLS policies to include profile_id
ALTER POLICY "Staff details are viewable by school admins" 
ON "public"."staff_details" 
USING (
    auth.uid() IN (
        SELECT id FROM profiles 
        WHERE school_id = staff_details.school_id 
        AND role = 'school_admin'
    )
    OR auth.uid() = staff_details.profile_id
);

-- Add comment to explain the column
COMMENT ON COLUMN "public"."staff_details"."profile_id" IS 'References the user profile in the profiles table. Links staff details to their authentication profile.'; 