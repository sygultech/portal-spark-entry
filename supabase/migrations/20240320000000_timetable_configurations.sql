-- Create timetable_configurations table
CREATE TABLE IF NOT EXISTS "public"."timetable_configurations" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "school_id" uuid NOT NULL,
    "name" text NOT NULL,
    "is_active" boolean DEFAULT false,
    "is_default" boolean DEFAULT false,
    "academic_year_id" uuid NOT NULL,
    "created_at" timestamp with time zone DEFAULT now(),
    "updated_at" timestamp with time zone DEFAULT now(),
    CONSTRAINT "timetable_configurations_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "timetable_configurations_school_id_fkey" FOREIGN KEY (school_id) REFERENCES schools(id),
    CONSTRAINT "timetable_configurations_academic_year_id_fkey" FOREIGN KEY (academic_year_id) REFERENCES academic_years(id)
);

-- Create period_settings table
CREATE TABLE IF NOT EXISTS "public"."period_settings" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "configuration_id" uuid NOT NULL,
    "period_number" integer NOT NULL,
    "start_time" time NOT NULL,
    "end_time" time NOT NULL,
    "type" text NOT NULL CHECK (type IN ('period', 'break')),
    "label" text,
    "day_of_week" text CHECK (day_of_week IN ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')),
    "is_fortnightly" boolean DEFAULT false,
    "fortnight_week" integer CHECK (fortnight_week IN (1, 2)),
    "created_at" timestamp with time zone DEFAULT now(),
    "updated_at" timestamp with time zone DEFAULT now(),
    CONSTRAINT "period_settings_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "period_settings_configuration_id_fkey" FOREIGN KEY (configuration_id) REFERENCES timetable_configurations(id) ON DELETE CASCADE
);

-- Create batch_configuration_mapping table
CREATE TABLE IF NOT EXISTS "public"."batch_configuration_mapping" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "configuration_id" uuid NOT NULL,
    "batch_id" uuid NOT NULL,
    "created_at" timestamp with time zone DEFAULT now(),
    "updated_at" timestamp with time zone DEFAULT now(),
    CONSTRAINT "batch_configuration_mapping_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "batch_configuration_mapping_configuration_id_fkey" FOREIGN KEY (configuration_id) REFERENCES timetable_configurations(id) ON DELETE CASCADE,
    CONSTRAINT "batch_configuration_mapping_batch_id_fkey" FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE CASCADE,
    CONSTRAINT "batch_configuration_mapping_unique" UNIQUE (configuration_id, batch_id)
);

-- Create RLS policies
ALTER TABLE "public"."timetable_configurations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."period_settings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."batch_configuration_mapping" ENABLE ROW LEVEL SECURITY;

-- Timetable configurations policies
CREATE POLICY "School admins can manage their timetable configurations"
    ON "public"."timetable_configurations"
    FOR ALL
    TO authenticated
    USING (
        school_id IN (
            SELECT school_id FROM profiles
            WHERE id = auth.uid()
            AND 'school_admin' = ANY(roles)
        )
    );

-- Period settings policies
CREATE POLICY "School admins can manage period settings"
    ON "public"."period_settings"
    FOR ALL
    TO authenticated
    USING (
        configuration_id IN (
            SELECT id FROM timetable_configurations
            WHERE school_id IN (
                SELECT school_id FROM profiles
                WHERE id = auth.uid()
                AND 'school_admin' = ANY(roles)
            )
        )
    );

-- Batch configuration mapping policies
CREATE POLICY "School admins can manage batch mappings"
    ON "public"."batch_configuration_mapping"
    FOR ALL
    TO authenticated
    USING (
        configuration_id IN (
            SELECT id FROM timetable_configurations
            WHERE school_id IN (
                SELECT school_id FROM profiles
                WHERE id = auth.uid()
                AND 'school_admin' = ANY(roles)
            )
        )
    );

-- Create RPC functions
CREATE OR REPLACE FUNCTION save_timetable_configuration(
    p_school_id uuid,
    p_name text,
    p_is_active boolean,
    p_is_default boolean,
    p_academic_year_id uuid,
    p_periods jsonb,
    p_batch_ids uuid[] DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_config_id uuid;
BEGIN
    -- Insert timetable configuration
    INSERT INTO timetable_configurations (
        school_id,
        name,
        is_active,
        is_default,
        academic_year_id
    ) VALUES (
        p_school_id,
        p_name,
        p_is_active,
        p_is_default,
        p_academic_year_id
    ) RETURNING id INTO v_config_id;

    -- Insert period settings
    INSERT INTO period_settings (
        configuration_id,
        period_number,
        start_time,
        end_time,
        type,
        label,
        day_of_week,
        is_fortnightly,
        fortnight_week
    )
    SELECT
        v_config_id,
        (period->>'number')::integer,
        (period->>'startTime')::time,
        (period->>'endTime')::time,
        period->>'type',
        period->>'label',
        period->>'dayOfWeek',
        (period->>'isFortnightly')::boolean,
        (period->>'fortnightWeek')::integer
    FROM jsonb_array_elements(p_periods) AS period;

    -- Insert batch mappings if provided
    IF p_batch_ids IS NOT NULL THEN
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

CREATE OR REPLACE FUNCTION get_timetable_configurations(
    p_school_id uuid,
    p_academic_year_id uuid
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_result jsonb;
BEGIN
    SELECT jsonb_agg(
        jsonb_build_object(
            'id', tc.id,
            'name', tc.name,
            'isActive', tc.is_active,
            'isDefault', tc.is_default,
            'academicYearId', tc.academic_year_id,
            'periods', (
                SELECT jsonb_agg(
                    jsonb_build_object(
                        'id', ps.id,
                        'number', ps.period_number,
                        'startTime', ps.start_time,
                        'endTime', ps.end_time,
                        'type', ps.type,
                        'label', ps.label,
                        'dayOfWeek', ps.day_of_week,
                        'isFortnightly', ps.is_fortnightly,
                        'fortnightWeek', ps.fortnight_week
                    )
                )
                FROM period_settings ps
                WHERE ps.configuration_id = tc.id
            ),
            'batchIds', (
                SELECT jsonb_agg(bcm.batch_id)
                FROM batch_configuration_mapping bcm
                WHERE bcm.configuration_id = tc.id
            )
        )
    )
    INTO v_result
    FROM timetable_configurations tc
    WHERE tc.school_id = p_school_id
    AND tc.academic_year_id = p_academic_year_id;

    RETURN COALESCE(v_result, '[]'::jsonb);
END;
$$; 