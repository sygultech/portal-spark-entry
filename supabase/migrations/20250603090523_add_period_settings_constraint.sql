-- Drop existing primary key constraint if it exists
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'period_settings_pkey'
        AND table_name = 'period_settings'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE "public"."period_settings" DROP CONSTRAINT "period_settings_pkey";
    END IF;
END $$;

-- Create period_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS "public"."period_settings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "configuration_id" "uuid" NOT NULL,
    "period_number" integer NOT NULL,
    "start_time" time without time zone NOT NULL,
    "end_time" time without time zone NOT NULL,
    "type" "text" NOT NULL,
    "label" "text",
    "day_of_week" "text",
    "fortnight_week" integer,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "period_settings_day_of_week_check" CHECK (("day_of_week" = ANY (ARRAY['monday'::"text", 'tuesday'::"text", 'wednesday'::"text", 'thursday'::"text", 'friday'::"text", 'saturday'::"text", 'sunday'::"text"]))),
    CONSTRAINT "period_settings_fortnight_week_check" CHECK (("fortnight_week" = ANY (ARRAY[1, 2]))),
    CONSTRAINT "period_settings_type_check" CHECK (("type" = ANY (ARRAY['period'::"text", 'break'::"text"])))
);

-- Drop existing constraint if it exists
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'period_settings_unique_key'
        AND table_name = 'period_settings'
    ) THEN
        ALTER TABLE period_settings DROP CONSTRAINT period_settings_unique_key;
    END IF;
END $$;

-- Remove duplicate entries, keeping only the latest one
DELETE FROM period_settings
WHERE id IN (
    SELECT id
    FROM (
        SELECT id,
               ROW_NUMBER() OVER (
                   PARTITION BY configuration_id, period_number, day_of_week, fortnight_week
                   ORDER BY created_at DESC
               ) as rnum
        FROM period_settings
    ) t
    WHERE t.rnum > 1
);

-- Add unique constraint to prevent duplicates
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'period_settings'
    ) THEN
        ALTER TABLE period_settings
        ADD CONSTRAINT period_settings_unique_key 
        UNIQUE (configuration_id, period_number, day_of_week, fortnight_week);
    END IF;
END $$; 