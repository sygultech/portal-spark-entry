-- Drop existing constraints if they exist
DO $$ 
BEGIN
    -- Drop unique constraint if exists
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'period_settings_unique_key'
        AND table_name = 'period_settings'
    ) THEN
        ALTER TABLE period_settings DROP CONSTRAINT period_settings_unique_key;
    END IF;

    -- Drop foreign key constraint if exists
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'period_settings_configuration_id_fkey'
        AND table_name = 'period_settings'
    ) THEN
        ALTER TABLE period_settings DROP CONSTRAINT period_settings_configuration_id_fkey;
    END IF;

    -- Drop check constraints if they exist
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'period_settings_day_of_week_check'
        AND table_name = 'period_settings'
    ) THEN
        ALTER TABLE period_settings DROP CONSTRAINT period_settings_day_of_week_check;
    END IF;

    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'period_settings_fortnight_week_check'
        AND table_name = 'period_settings'
    ) THEN
        ALTER TABLE period_settings DROP CONSTRAINT period_settings_fortnight_week_check;
    END IF;

    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'period_settings_type_check'
        AND table_name = 'period_settings'
    ) THEN
        ALTER TABLE period_settings DROP CONSTRAINT period_settings_type_check;
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
ALTER TABLE period_settings
    ADD CONSTRAINT period_settings_unique_key 
    UNIQUE (configuration_id, period_number, day_of_week, fortnight_week);

-- Add foreign key constraint to timetable_configurations
ALTER TABLE period_settings
    ADD CONSTRAINT period_settings_configuration_id_fkey
    FOREIGN KEY (configuration_id) REFERENCES timetable_configurations(id)
    ON DELETE CASCADE;

-- Add check constraints for valid values
ALTER TABLE period_settings
    ADD CONSTRAINT period_settings_day_of_week_check 
    CHECK (day_of_week IN ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')),
    ADD CONSTRAINT period_settings_fortnight_week_check 
    CHECK (fortnight_week IN (1, 2)),
    ADD CONSTRAINT period_settings_type_check 
    CHECK (type IN ('period', 'break')); 