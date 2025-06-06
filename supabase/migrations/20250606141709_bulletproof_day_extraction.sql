
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

-- Create bulletproof day extraction function
CREATE OR REPLACE FUNCTION "public"."extract_day_name"(
    "input_day" text
) RETURNS text
    LANGUAGE "plpgsql" IMMUTABLE
    AS $$
DECLARE
    v_extracted_day text;
    v_valid_days text[] := ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
BEGIN
    -- Normalize input to lowercase
    input_day := lower(trim(input_day));
    
    -- Pattern 1: Direct match (monday, tuesday, etc.)
    IF input_day = ANY(v_valid_days) THEN
        RETURN input_day;
    END IF;
    
    -- Pattern 2: week1-monday, week2-tuesday, etc.
    IF input_day ~ '^week[12]-(.+)$' THEN
        v_extracted_day := regexp_replace(input_day, '^week[12]-', '');
        IF v_extracted_day = ANY(v_valid_days) THEN
            RETURN v_extracted_day;
        END IF;
    END IF;
    
    -- Pattern 3: w1-monday, w2-tuesday, etc.
    IF input_day ~ '^w[12]-(.+)$' THEN
        v_extracted_day := regexp_replace(input_day, '^w[12]-', '');
        IF v_extracted_day = ANY(v_valid_days) THEN
            RETURN v_extracted_day;
        END IF;
    END IF;
    
    -- Pattern 4: monday-week1, tuesday-week2, etc.
    IF input_day ~ '^(.+)-week[12]$' THEN
        v_extracted_day := regexp_replace(input_day, '-week[12]$', '');
        IF v_extracted_day = ANY(v_valid_days) THEN
            RETURN v_extracted_day;
        END IF;
    END IF;
    
    -- Pattern 5: Check if any valid day is contained in the input
    FOR i IN 1..array_length(v_valid_days, 1) LOOP
        IF position(v_valid_days[i] in input_day) > 0 THEN
            RETURN v_valid_days[i];
        END IF;
    END LOOP;
    
    -- If no pattern matches, return NULL to indicate failure
    RETURN NULL;
END;
$$;

-- Create updated function with bulletproof day extraction
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
    v_days_with_custom text[];
    v_valid_days text[] := ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    v_debug_info text;
    v_invalid_days text[];
    v_extracted_day text;
    v_day_validation_failed boolean := false;
    v_day_validation_errors text[] := ARRAY[]::text[];
BEGIN
    -- Debug logging: Log input parameters
    RAISE NOTICE 'Starting save_timetable_configuration with parameters:';
    RAISE NOTICE 'p_school_id: %, p_name: %, p_is_weekly_mode: %', p_school_id, p_name, p_is_weekly_mode;
    RAISE NOTICE 'p_selected_days: %, p_enable_flexible_timings: %', p_selected_days, p_enable_flexible_timings;
    
    -- Input validation
    IF NOT p_is_weekly_mode AND p_fortnight_start_date IS NULL THEN
        RAISE EXCEPTION 'Fortnight start date is required for fortnightly mode';
    END IF;

    IF array_length(p_selected_days, 1) = 0 THEN
        RAISE EXCEPTION 'At least one school day must be selected';
    END IF;

    -- Bulletproof day name validation
    RAISE NOTICE 'Starting comprehensive day validation...';
    
    FOR i IN 1..array_length(p_selected_days, 1) LOOP
        v_extracted_day := extract_day_name(p_selected_days[i]);
        
        RAISE NOTICE 'Day validation - Input: %, Extracted: %', p_selected_days[i], v_extracted_day;
        
        IF v_extracted_day IS NULL THEN
            v_day_validation_failed := true;
            v_day_validation_errors := v_day_validation_errors || p_selected_days[i];
        END IF;
    END LOOP;

    -- Fail immediately if any day validation failed
    IF v_day_validation_failed THEN
        RAISE EXCEPTION 'Invalid day names detected: %. Valid days are: %. Please ensure all day identifiers can be extracted to valid day names.', 
            v_day_validation_errors, v_valid_days;
    END IF;

    RAISE NOTICE 'All day validations passed successfully';

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

    RAISE NOTICE 'Created timetable configuration with ID: %', v_config_id;

    -- Delete existing period settings for this configuration
    DELETE FROM period_settings WHERE configuration_id = v_config_id;
    RAISE NOTICE 'Deleted existing period settings for configuration %', v_config_id;

    -- Get array of days with custom timings (if any)
    IF p_enable_flexible_timings AND p_day_specific_periods IS NOT NULL THEN
        SELECT array_agg(key) INTO v_days_with_custom
        FROM jsonb_object_keys(p_day_specific_periods) AS key;
        RAISE NOTICE 'Days with custom timings: %', v_days_with_custom;
    ELSE
        v_days_with_custom := ARRAY[]::text[];
        RAISE NOTICE 'No custom timings enabled or provided';
    END IF;

    -- Handle custom timings if enabled and provided
    IF p_enable_flexible_timings AND p_day_specific_periods IS NOT NULL THEN
        RAISE NOTICE 'Processing custom period timings...';
        
        WITH custom_periods AS (
            SELECT
                day_key,
                (period->>'number')::integer as period_number,
                (period->>'startTime')::time as start_time,
                (period->>'endTime')::time as end_time,
                period->>'type' as type,
                period->>'label' as label,
                -- Use the bulletproof extraction function
                extract_day_name(day_key) as base_day,
                -- Extract week number for fortnightly mode
                CASE 
                    WHEN NOT p_is_weekly_mode AND day_key ~* '^week([12])-' THEN 
                        CAST(substring(day_key from '^week([12])-') AS integer)
                    WHEN NOT p_is_weekly_mode AND day_key ~* '^w([12])-' THEN 
                        CAST(substring(day_key from '^w([12])-') AS integer)
                    ELSE 
                        NULL
                END as week_num
            FROM jsonb_each(p_day_specific_periods) AS days(day_key, day_periods),
                 jsonb_array_elements(day_periods) AS period
        ),
        validated_custom_periods AS (
            SELECT 
                cp.*,
                CASE 
                    WHEN cp.base_day IS NOT NULL AND cp.base_day = ANY(v_valid_days) THEN true
                    ELSE false
                END as is_valid_day
            FROM custom_periods cp
        ),
        final_custom_periods AS (
            SELECT *
            FROM validated_custom_periods vcp
            WHERE vcp.is_valid_day = true
        )
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
        SELECT DISTINCT ON (v_config_id, period_number, base_day, week_num)
            v_config_id,
            period_number,
            start_time,
            end_time,
            type,
            label,
            base_day,
            week_num
        FROM final_custom_periods
        WHERE base_day IS NOT NULL
        ORDER BY v_config_id, period_number, base_day, week_num;

        GET DIAGNOSTICS v_debug_info = ROW_COUNT;
        RAISE NOTICE 'Inserted % custom period settings', v_debug_info;
    END IF;

    -- Handle default timings for remaining selected days 
    RAISE NOTICE 'Processing default period timings...';
    
    WITH selected_days_processed AS (
        SELECT 
            day,
            -- Use the bulletproof extraction function
            extract_day_name(day) as base_day,
            -- Extract week number for fortnightly mode
            CASE 
                WHEN NOT p_is_weekly_mode AND day ~* '^week([12])-' THEN 
                    CAST(substring(day from '^week([12])-') AS integer)
                WHEN NOT p_is_weekly_mode AND day ~* '^w([12])-' THEN 
                    CAST(substring(day from '^w([12])-') AS integer)
                ELSE 
                    NULL
            END AS week_num
        FROM unnest(p_selected_days) AS day
        WHERE (
            NOT p_enable_flexible_timings  -- Include all days when flexible timings is disabled
            OR NOT (day = ANY(COALESCE(v_days_with_custom, ARRAY[]::text[])))  -- Include days without custom timings when flexible timings is enabled
        )
    ),
    validated_selected_days AS (
        SELECT 
            sdp.*,
            CASE 
                WHEN sdp.base_day IS NOT NULL AND sdp.base_day = ANY(v_valid_days) THEN true
                ELSE false
            END as is_valid_day
        FROM selected_days_processed sdp
    ),
    final_selected_days AS (
        SELECT *
        FROM validated_selected_days vsd
        WHERE vsd.is_valid_day = true
    ),
    default_periods AS (
        SELECT
            (period->>'number')::integer as period_number,
            (period->>'startTime')::time as start_time,
            (period->>'endTime')::time as end_time,
            period->>'type' as type,
            period->>'label' as label
        FROM jsonb_array_elements(p_default_periods) AS period
    )
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
    SELECT DISTINCT ON (v_config_id, dp.period_number, fsd.base_day, fsd.week_num)
        v_config_id,
        dp.period_number,
        dp.start_time,
        dp.end_time,
        dp.type,
        dp.label,
        fsd.base_day,
        fsd.week_num
    FROM default_periods dp
    CROSS JOIN final_selected_days fsd
    WHERE fsd.base_day IS NOT NULL
    ORDER BY v_config_id, dp.period_number, fsd.base_day, fsd.week_num;

    GET DIAGNOSTICS v_debug_info = ROW_COUNT;
    RAISE NOTICE 'Inserted % default period settings', v_debug_info;

    -- Insert batch mappings if provided and not default
    IF NOT p_is_default AND p_batch_ids IS NOT NULL AND array_length(p_batch_ids, 1) > 0 THEN
        INSERT INTO batch_configuration_mapping (
            configuration_id,
            batch_id
        )
        SELECT
            v_config_id,
            batch_id
        FROM unnest(p_batch_ids) AS batch_id
        ON CONFLICT (configuration_id, batch_id) DO NOTHING;

        GET DIAGNOSTICS v_debug_info = ROW_COUNT;
        RAISE NOTICE 'Inserted % batch mappings', v_debug_info;
    END IF;

    RAISE NOTICE 'Successfully completed save_timetable_configuration for config ID: %', v_config_id;
    RETURN v_config_id;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error in save_timetable_configuration: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
        RAISE;
END;
$$;

-- Grant permissions
GRANT ALL ON FUNCTION "public"."extract_day_name"("input_day" text) TO "anon", "authenticated", "service_role";

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
