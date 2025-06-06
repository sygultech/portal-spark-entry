-- Drop existing constraints if they exist
DO $$ 
BEGIN
    -- Drop unique constraint if exists
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'batch_configuration_mapping_unique_key'
        AND table_name = 'batch_configuration_mapping'
    ) THEN
        ALTER TABLE batch_configuration_mapping DROP CONSTRAINT batch_configuration_mapping_unique_key;
    END IF;

    -- Drop foreign key constraints if they exist
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'batch_configuration_mapping_configuration_id_fkey'
        AND table_name = 'batch_configuration_mapping'
    ) THEN
        ALTER TABLE batch_configuration_mapping DROP CONSTRAINT batch_configuration_mapping_configuration_id_fkey;
    END IF;

    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'batch_configuration_mapping_batch_id_fkey'
        AND table_name = 'batch_configuration_mapping'
    ) THEN
        ALTER TABLE batch_configuration_mapping DROP CONSTRAINT batch_configuration_mapping_batch_id_fkey;
    END IF;
END $$;

-- Remove duplicate entries
DELETE FROM batch_configuration_mapping
WHERE id IN (
    SELECT id
    FROM (
        SELECT id,
               ROW_NUMBER() OVER (
                   PARTITION BY configuration_id, batch_id
                   ORDER BY created_at DESC
               ) as rnum
        FROM batch_configuration_mapping
    ) t
    WHERE t.rnum > 1
);

-- Add unique constraint to prevent duplicates
ALTER TABLE batch_configuration_mapping
    ADD CONSTRAINT batch_configuration_mapping_unique_key 
    UNIQUE (configuration_id, batch_id);

-- Add foreign key constraints
ALTER TABLE batch_configuration_mapping
    ADD CONSTRAINT batch_configuration_mapping_configuration_id_fkey
    FOREIGN KEY (configuration_id) REFERENCES timetable_configurations(id)
    ON DELETE CASCADE;

ALTER TABLE batch_configuration_mapping
    ADD CONSTRAINT batch_configuration_mapping_batch_id_fkey
    FOREIGN KEY (batch_id) REFERENCES batches(id)
    ON DELETE CASCADE; 