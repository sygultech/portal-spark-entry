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

-- Add missing columns to timetable_configurations
ALTER TABLE "public"."timetable_configurations"
    ADD COLUMN IF NOT EXISTS "selected_days" text[] DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS "default_periods" jsonb DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS "enable_flexible_timings" boolean DEFAULT false,
    ADD COLUMN IF NOT EXISTS "is_weekly_mode" boolean DEFAULT true;

-- Update is_weekly_mode based on is_fortnightly
UPDATE "public"."timetable_configurations"
SET "is_weekly_mode" = NOT "is_fortnightly";

-- Drop is_fortnightly column
ALTER TABLE "public"."timetable_configurations"
    DROP COLUMN IF EXISTS "is_fortnightly";

-- Drop existing function first
DO $$ 
BEGIN
    EXECUTE (
        SELECT string_agg(
            format('DROP FUNCTION IF EXISTS %s(%s);',
                   p.oid::regproc,
                   oidvectortypes(p.proargtypes)),
            E'\n'
        )
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
          AND p.proname = 'save_timetable_configuration'
    );
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

-- Create updated function
CREATE OR REPLACE FUNCTION "public"."save_timetable_configuration"(
    "p_school_id" "uuid",
    "p_name" "text",
    "p_is_active" boolean,
    "p_is_default" boolean,
    "p_academic_year_id" "uuid",
    "p_is_weekly_mode" boolean,
    "p_selected_days" "text"[],
    "p_default_periods" "jsonb",
    "p_fortnight_start_date" "date" DEFAULT NULL,
    "p_day_specific_periods" "jsonb" DEFAULT NULL,
    "p_enable_flexible_timings" boolean DEFAULT false,
    "p_batch_ids" "uuid"[] DEFAULT NULL::uuid[]
) RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_config_id uuid;
    v_custom_days text[];
    v_day text;
BEGIN
    -- Input validation
    IF NOT p_is_weekly_mode AND p_fortnight_start_date IS NULL THEN
        RAISE EXCEPTION 'Fortnight start date is required for fortnightly mode';
    END IF;

    IF array_length(p_selected_days, 1) = 0 THEN
        RAISE EXCEPTION 'At least one school day must be selected';
    END IF;

    -- Create timetable configuration
    INSERT INTO timetable_configurations (
        school_id,
        name,
        is_active,
        is_default,
        academic_year_id,
        is_weekly_mode,
        fortnight_start_date,
        selected_days,
        default_periods,
        enable_flexible_timings,
        batch_ids
    ) VALUES (
        p_school_id,
        p_name,
        p_is_active,
        p_is_default,
        p_academic_year_id,
        p_is_weekly_mode,
        p_fortnight_start_date,
        p_selected_days,
        p_default_periods,
        p_enable_flexible_timings,
        p_batch_ids
    )
    RETURNING id INTO v_config_id;

    -- Delete existing period settings for this configuration
    DELETE FROM period_settings WHERE configuration_id = v_config_id;

    -- Process period settings for each selected day
    IF p_enable_flexible_timings AND p_day_specific_periods IS NOT NULL THEN
        -- Insert custom period settings for specific days
        FOREACH v_day IN ARRAY p_selected_days LOOP
            IF p_day_specific_periods ? v_day THEN
                INSERT INTO period_settings (
                    configuration_id,
                    period_number,
                    start_time,
                    end_time,
                    type,
                    label,
                    day_of_week,
                    fortnight_week
                )
                SELECT 
                    v_config_id,
                    (jsonb_array_elements(p_day_specific_periods->v_day)->>'number')::integer,
                    (jsonb_array_elements(p_day_specific_periods->v_day)->>'startTime')::time,
                    (jsonb_array_elements(p_day_specific_periods->v_day)->>'endTime')::time,
                    jsonb_array_elements(p_day_specific_periods->v_day)->>'type',
                    jsonb_array_elements(p_day_specific_periods->v_day)->>'label',
                    v_day,
                    CASE 
                        WHEN NOT p_is_weekly_mode THEN 
                            CASE 
                                WHEN v_day LIKE 'week1-%' THEN 1
                                WHEN v_day LIKE 'week2-%' THEN 2
                                ELSE NULL
                            END
                        ELSE NULL
                    END;
            END IF;
        END LOOP;
    ELSE
        -- Insert default period settings for all selected days
        INSERT INTO period_settings (
            configuration_id,
            period_number,
            start_time,
            end_time,
            type,
            label,
            day_of_week,
            fortnight_week
        )
        SELECT 
            v_config_id,
            (jsonb_array_elements(p_default_periods)->>'number')::integer,
            (jsonb_array_elements(p_default_periods)->>'startTime')::time,
            (jsonb_array_elements(p_default_periods)->>'endTime')::time,
            jsonb_array_elements(p_default_periods)->>'type',
            jsonb_array_elements(p_default_periods)->>'label',
            day,
            CASE 
                WHEN NOT p_is_weekly_mode THEN 
                    CASE 
                        WHEN day LIKE 'week1-%' THEN 1
                        WHEN day LIKE 'week2-%' THEN 2
                        ELSE NULL
                    END
                ELSE NULL
            END
        FROM unnest(p_selected_days) AS day;
    END IF;

    RETURN v_config_id;
END;
$$;

-- Grant permissions
GRANT ALL ON FUNCTION "public"."save_timetable_configuration"(
    "p_school_id" "uuid",
    "p_name" "text",
    "p_is_active" boolean,
    "p_is_default" boolean,
    "p_academic_year_id" "uuid",
    "p_is_weekly_mode" boolean,
    "p_selected_days" "text"[],
    "p_default_periods" "jsonb",
    "p_fortnight_start_date" "date",
    "p_day_specific_periods" "jsonb",
    "p_enable_flexible_timings" boolean,
    "p_batch_ids" "uuid"[]
) TO "anon", "authenticated", "service_role";

-- Revoke execute from public to prevent unauthorized access
REVOKE ALL ON FUNCTION "public"."save_timetable_configuration"(
    "p_school_id" "uuid",
    "p_name" "text",
    "p_is_active" boolean,
    "p_is_default" boolean,
    "p_academic_year_id" "uuid",
    "p_is_weekly_mode" boolean,
    "p_selected_days" "text"[],
    "p_default_periods" "jsonb",
    "p_fortnight_start_date" "date",
    "p_day_specific_periods" "jsonb",
    "p_enable_flexible_timings" boolean,
    "p_batch_ids" "uuid"[]
) FROM "public"; 