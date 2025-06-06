-- Add batch_ids column to timetable_configurations
ALTER TABLE "public"."timetable_configurations"
    ADD COLUMN IF NOT EXISTS "batch_ids" uuid[] DEFAULT NULL::uuid[];

-- Create index on batch_ids for better performance
CREATE INDEX IF NOT EXISTS "timetable_configurations_batch_ids_idx" ON "public"."timetable_configurations" USING GIN ("batch_ids"); 