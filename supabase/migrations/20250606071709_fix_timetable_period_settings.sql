-- Fix timetable period settings issues

-- Step 1: Drop existing unique constraint
ALTER TABLE period_settings DROP CONSTRAINT IF EXISTS period_settings_unique_key;

-- Step 2: Add new unique constraint including fortnight_week
ALTER TABLE period_settings ADD CONSTRAINT period_settings_unique_key 
UNIQUE (configuration_id, period_number, day_of_week, fortnight_week);

-- Step 3: Create helper function for week extraction
CREATE OR REPLACE FUNCTION public.extract_week_number(day_string text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
    RETURN CASE 
        WHEN day_string LIKE 'week 1%' THEN 1
        WHEN day_string LIKE 'week 2%' THEN 2
        ELSE NULL
    END;
END;
$function$;

-- Step 4: Create helper function for base day extraction
CREATE OR REPLACE FUNCTION public.extract_base_day(day_string text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
    RETURN regexp_replace(day_string, '^week [12] ', '');
END;
$function$;

-- Step 5: Create the main function
CREATE OR REPLACE FUNCTION public.save_timetable_configuration(
    p_school_id uuid,
    p_name text,
    p_is_active boolean,
    p_is_default boolean,
    p_academic_year_id uuid,
    p_is_weekly_mode boolean,
    p_selected_days text[],
    p_default_periods jsonb,
    p_fortnight_start_date date DEFAULT NULL::date,
    p_day_specific_periods jsonb DEFAULT NULL::jsonb,
    p_enable_flexible_timings boolean DEFAULT false,
    p_batch_ids uuid[] DEFAULT NULL::uuid[]
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
    v_config_id uuid;
    v_period_record record;
    v_day text;
    v_week int;
    v_custom_days text[];
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
        is_fortnightly,
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
        NOT p_is_weekly_mode,
        p_fortnight_start_date,
        p_selected_days,
        p_default_periods,
        p_enable_flexible_timings,
        p_batch_ids
    )
    RETURNING id INTO v_config_id;

    -- Delete existing period settings
    DELETE FROM period_settings WHERE configuration_id = v_config_id;

    -- Get custom days
    IF p_day_specific_periods IS NOT NULL AND jsonb_typeof(p_day_specific_periods) = 'object' THEN
        SELECT array_agg(key) INTO v_custom_days
        FROM jsonb_object_keys(p_day_specific_periods) AS key;
    ELSE
        v_custom_days := ARRAY[]::text[];
    END IF;

    -- Handle custom days
    IF p_enable_flexible_timings AND v_custom_days IS NOT NULL THEN
        FOREACH v_day IN ARRAY v_custom_days
        LOOP
            -- Get week number and base day
            IF NOT p_is_weekly_mode THEN
                v_week := public.extract_week_number(v_day);
                v_day := public.extract_base_day(v_day);
            ELSE
                v_week := NULL;
            END IF;

            -- Insert periods
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
        END LOOP;
    END IF;

    -- Handle default periods
    IF p_default_periods IS NOT NULL AND jsonb_array_length(p_default_periods) > 0 THEN
        -- Insert for remaining days
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
        SELECT DISTINCT
            v_config_id,
            (p.value->>'number')::int,
            (p.value->>'startTime')::time,
            (p.value->>'endTime')::time,
            p.value->>'type',
            p.value->>'label',
            CASE WHEN NOT p_is_weekly_mode 
                THEN public.extract_base_day(d.day)
                ELSE d.day
            END,
            CASE WHEN NOT p_is_weekly_mode 
                THEN public.extract_week_number(d.day)
                ELSE NULL
            END
        FROM jsonb_array_elements(p_default_periods) p(value)
        CROSS JOIN unnest(p_selected_days) d(day)
        WHERE NOT EXISTS (
            SELECT 1 
            FROM unnest(v_custom_days) cd
            WHERE cd = d.day
        );
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