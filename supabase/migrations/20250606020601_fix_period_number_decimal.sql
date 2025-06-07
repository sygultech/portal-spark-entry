
-- Fix period_number column to accept decimal values for breaks
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

-- Update the period_settings table to allow decimal period numbers
ALTER TABLE period_settings 
ALTER COLUMN period_number TYPE numeric USING period_number::numeric;

-- Create updated function
CREATE OR REPLACE FUNCTION "public"."save_timetable_configuration"(
    "p_school_id" "uuid",
    "p_name" "text",
    "p_is_active" boolean,
    "p_is_default" boolean,
    "p_academic_year_id" "uuid",
    "p_is_weekly_mode" boolean,
    "p_selected_days" text[],
    "p_default_periods" jsonb,
    "p_fortnight_start_date" date DEFAULT NULL,
    "p_day_specific_periods" jsonb DEFAULT NULL,
    "p_enable_flexible_timings" boolean DEFAULT false,
    "p_batch_ids" "uuid"[] DEFAULT NULL::uuid[]
) RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_config_id uuid;
    v_day text;
    v_period_data jsonb;
    v_period record;
    v_extracted_day text;
    v_week_num integer;
BEGIN
    -- Input validation
    IF NOT p_is_weekly_mode AND p_fortnight_start_date IS NULL THEN
        RAISE EXCEPTION 'Fortnight start date is required for fortnightly mode';
    END IF;

    -- Validate selected days using the extract_day_name function
    FOREACH v_day IN ARRAY p_selected_days
    LOOP
        v_extracted_day := public.extract_day_name(v_day);
        IF v_extracted_day IS NULL THEN
            RAISE EXCEPTION 'Invalid day identifier: %', v_day;
        END IF;
    END LOOP;

    -- Create timetable configuration
    INSERT INTO timetable_configurations (
        school_id,
        name,
        is_active,
        is_default,
        academic_year_id,
        is_weekly_mode,
        fortnight_start_date,
        default_periods,
        enable_flexible_timings,
        batch_ids,
        selected_days
    ) VALUES (
        p_school_id,
        p_name,
        p_is_active,
        p_is_default,
        p_academic_year_id,
        p_is_weekly_mode,
        p_fortnight_start_date,
        p_default_periods,
        p_enable_flexible_timings,
        p_batch_ids,
        p_selected_days
    )
    RETURNING id INTO v_config_id;

    -- Delete existing period settings for this configuration
    DELETE FROM period_settings WHERE configuration_id = v_config_id;

    -- Process each selected day
    FOREACH v_day IN ARRAY p_selected_days
    LOOP
        v_extracted_day := public.extract_day_name(v_day);
        
        -- Extract week number for fortnightly mode
        IF NOT p_is_weekly_mode THEN
            v_week_num := CASE 
                WHEN v_day LIKE '%week1%' OR v_day LIKE '%w1%' THEN 1
                WHEN v_day LIKE '%week2%' OR v_day LIKE '%w2%' THEN 2
                ELSE NULL
            END;
        ELSE
            v_week_num := NULL;
        END IF;

        -- Check if this day has custom periods
        IF p_enable_flexible_timings AND p_day_specific_periods IS NOT NULL AND 
           p_day_specific_periods ? v_day THEN
            
            -- Use day-specific periods
            v_period_data := p_day_specific_periods->v_day;
            
            FOR v_period IN SELECT * FROM jsonb_array_elements(v_period_data)
            LOOP
                INSERT INTO period_settings (
                    configuration_id,
                    period_number,
                    start_time,
                    end_time,
                    type,
                    label,
                    day_of_week,
                    fortnight_week
                ) VALUES (
                    v_config_id,
                    (v_period.value->>'number')::numeric,
                    (v_period.value->>'startTime')::time,
                    (v_period.value->>'endTime')::time,
                    COALESCE(v_period.value->>'type', 'period'),
                    COALESCE(v_period.value->>'label', 'Period ' || (v_period.value->>'number')),
                    v_extracted_day,
                    v_week_num
                );
            END LOOP;
        ELSE
            -- Use default periods for this day
            FOR v_period IN SELECT * FROM jsonb_array_elements(p_default_periods)
            LOOP
                INSERT INTO period_settings (
                    configuration_id,
                    period_number,
                    start_time,
                    end_time,
                    type,
                    label,
                    day_of_week,
                    fortnight_week
                ) VALUES (
                    v_config_id,
                    (v_period.value->>'number')::numeric,
                    (v_period.value->>'startTime')::time,
                    (v_period.value->>'endTime')::time,
                    COALESCE(v_period.value->>'type', 'period'),
                    COALESCE(v_period.value->>'label', 'Period ' || (v_period.value->>'number')),
                    v_extracted_day,
                    v_week_num
                );
            END LOOP;
        END IF;
    END LOOP;

    -- Insert batch mappings if provided and not default
    IF NOT p_is_default AND p_batch_ids IS NOT NULL AND array_length(p_batch_ids, 1) > 0 THEN
        INSERT INTO batch_configuration_mapping (
            configuration_id,
            batch_id
        )
        SELECT
            v_config_id,
            batch_id
        FROM unnest(p_batch_ids) AS batch_id;
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
    "p_selected_days" text[],
    "p_default_periods" jsonb,
    "p_fortnight_start_date" date,
    "p_day_specific_periods" jsonb,
    "p_enable_flexible_timings" boolean,
    "p_batch_ids" "uuid"[]
) TO "anon", "authenticated", "service_role";
