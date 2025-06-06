-- Fix timetable period settings issues

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
    v_period_record record;
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

    -- Get array of days with custom timings if flexible timings are enabled
    IF p_enable_flexible_timings AND p_day_specific_periods IS NOT NULL THEN
        SELECT array_agg(key) INTO v_custom_days
        FROM jsonb_object_keys(p_day_specific_periods) AS key;
    END IF;

    -- Process each selected day
    FOREACH v_day IN ARRAY p_selected_days
    LOOP
        -- Extract week number for fortnightly mode
        IF NOT p_is_weekly_mode THEN
            v_week := CASE 
                WHEN v_day LIKE 'week 1%' OR v_day LIKE 'week1%' THEN 1
                WHEN v_day LIKE 'week 2%' OR v_day LIKE 'week2%' THEN 2
                ELSE NULL
            END;
            -- Extract base day name
            v_day := CASE 
                WHEN v_day LIKE 'week%-%' THEN 
                    lower(split_part(v_day, '-', 2))
                ELSE 
                    lower(v_day)
            END;
        ELSE
            v_week := NULL;
        END IF;

        -- Check if this day has custom periods
        IF p_enable_flexible_timings AND v_custom_days @> ARRAY[v_day] THEN
            -- Insert custom periods for this day
            FOR v_period_record IN 
                SELECT * FROM jsonb_to_recordset(p_day_specific_periods->v_day) AS x(
                    number int,
                    start_time time,
                    end_time time,
                    type text,
                    label text
                )
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
                    v_period_record.number,
                    v_period_record.start_time,
                    v_period_record.end_time,
                    v_period_record.type,
                    v_period_record.label,
                    v_day,
                    v_week
                );
            END LOOP;
        ELSE
            -- Insert default periods for this day
            FOR v_period_record IN 
                SELECT * FROM jsonb_to_recordset(p_default_periods) AS x(
                    number int,
                    start_time time,
                    end_time time,
                    type text,
                    label text
                )
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
                    v_period_record.number,
                    v_period_record.start_time,
                    v_period_record.end_time,
                    v_period_record.type,
                    v_period_record.label,
                    v_day,
                    v_week
                );
            END LOOP;
        END IF;
    END LOOP;

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
) TO "anon", "authenticated", "service_role"; 