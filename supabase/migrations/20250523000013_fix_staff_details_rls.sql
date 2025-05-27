-- Check if staff_details table exists and has profile_id column
DO $$ 
BEGIN
    -- Check if staff_details table exists
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'staff_details'
    ) THEN
        -- Check if profile_id column exists
        IF EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'staff_details' 
            AND column_name = 'profile_id'
        ) THEN
            -- Drop existing policies if they exist
            DROP POLICY IF EXISTS "Service role can update profile_id" ON "public"."staff_details";
            DROP POLICY IF EXISTS "Service role can update staff_details" ON "public"."staff_details";

            -- Create new policies
            CREATE POLICY "Service role can update profile_id"
            ON "public"."staff_details"
            FOR UPDATE
            TO service_role
            USING (true)
            WITH CHECK (true);

            CREATE POLICY "Service role can update staff_details"
            ON "public"."staff_details"
            FOR UPDATE
            TO service_role
            USING (true)
            WITH CHECK (true);

            -- Add comments
            COMMENT ON POLICY "Service role can update profile_id" ON "public"."staff_details" IS 'Allows the service role to update the profile_id column in staff_details table.';
            COMMENT ON POLICY "Service role can update staff_details" ON "public"."staff_details" IS 'Allows the service role to update any column in staff_details table.';
        END IF;
    END IF;
END $$; 