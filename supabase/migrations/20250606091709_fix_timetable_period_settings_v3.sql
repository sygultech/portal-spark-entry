-- Fix timetable period settings issues

-- Create helper functions if they don't exist
CREATE OR REPLACE FUNCTION public.extract_week_number(day_string text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
    RETURN CASE 
        WHEN day_string LIKE 'week 1%' OR day_string LIKE 'week1%' THEN 1
        WHEN day_string LIKE 'week 2%' OR day_string LIKE 'week2%' THEN 2
        ELSE NULL
    END;
END;
$function$;

CREATE OR REPLACE FUNCTION public.extract_base_day(day_string text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
    RETURN CASE 
        WHEN day_string LIKE 'week%-%' THEN 
            lower(split_part(day_string, '-', 2))
        ELSE 
            lower(day_string)
    END;
END;
$function$;

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
CREATE OR REPLACE FUNCTION public.save_timetable_configuration(
    p_school_id uuid,
    p_name text,
    p_is_active boolean,
    p_is_default boolean,
    p_academic_year_id uuid,
    p_is_weekly_mode boolean,
    p_selected_days text[],
    p_default_periods jsonb,
    p_fortnight_start_date date DEFAULT NULL,
    p_day_specific_periods jsonb DEFAULT NULL,
    p_enable_flexible_timings boolean DEFAULT false,
    p_batch_ids uuid[] DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
    v_config_id uuid;
    v_custom_days text[] := ARRAY[]::text[];
    v_day text;
    v_week int;
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

    -- Get array of days with custom timings
    IF p_enable_flexible_timings AND p_day_specific_periods IS NOT NULL THEN
        SELECT array_agg(key) INTO v_custom_days
        FROM jsonb_object_keys(p_day_specific_periods) AS key;

        -- Insert custom day periods
        FOREACH v_day IN ARRAY v_custom_days
        LOOP
            -- Extract week number for fortnightly mode
            IF NOT p_is_weekly_mode AND v_day LIKE 'week%-%' THEN
                v_week := CASE 
                    WHEN split_part(v_day, '-', 1) = 'week1' THEN 1
                    WHEN split_part(v_day, '-', 1) = 'week2' THEN 2
                    ELSE NULL
                END;
                v_day := split_part(v_day, '-', 2);
            ELSE
                v_week := NULL;
            END IF;

            -- Insert periods for this custom day
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
                (p->>'number')::integer,
                (p->>'startTime')::time,
                (p->>'endTime')::time,
                COALESCE(p->>'type', 'period'),
                p->>'label',
                v_day,
                v_week
            FROM jsonb_array_elements(p_day_specific_periods->v_day) p;
        END LOOP;
    END IF;

    -- Always insert default periods for non-custom days
    IF p_default_periods IS NOT NULL AND jsonb_array_length(p_default_periods) > 0 THEN
        FOREACH v_day IN ARRAY p_selected_days
        LOOP
            -- Skip if this day has custom periods
            IF NOT (p_enable_flexible_timings AND v_custom_days @> ARRAY[v_day]) THEN
                -- Extract week number for fortnightly mode
                IF NOT p_is_weekly_mode AND v_day LIKE 'week%-%' THEN
                    v_week := CASE 
                        WHEN split_part(v_day, '-', 1) = 'week1' THEN 1
                        WHEN split_part(v_day, '-', 1) = 'week2' THEN 2
                        ELSE NULL
                    END;
                    v_day := split_part(v_day, '-', 2);
                ELSE
                    v_week := NULL;
                END IF;

                -- Insert default periods for this day
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
                    (p->>'number')::integer,
                    (p->>'startTime')::time,
                    (p->>'endTime')::time,
                    COALESCE(p->>'type', 'period'),
                    p->>'label',
                    v_day,
                    v_week
                FROM jsonb_array_elements(p_default_periods) p;
            END IF;
        END LOOP;
    END IF;

    -- Verify period settings were created
    IF NOT EXISTS (SELECT 1 FROM period_settings WHERE configuration_id = v_config_id) THEN
        RAISE EXCEPTION 'No period settings were created';
    END IF;

    RETURN v_config_id;
END;
$function$;

-- Grant permissions
GRANT ALL ON FUNCTION public.save_timetable_configuration(
    p_school_id uuid,
    p_name text,
    p_is_active boolean,
    p_is_default boolean,
    p_academic_year_id uuid,
    p_is_weekly_mode boolean,
    p_selected_days text[],
    p_default_periods jsonb,
    p_fortnight_start_date date,
    p_day_specific_periods jsonb,
    p_enable_flexible_timings boolean,
    p_batch_ids uuid[]
) TO authenticated;

GRANT ALL ON FUNCTION public.extract_week_number(text) TO authenticated;
GRANT ALL ON FUNCTION public.extract_base_day(text) TO authenticated; 