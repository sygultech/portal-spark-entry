-- Drop existing unique constraints if they exist
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'departments_name_key'
    ) THEN
        ALTER TABLE departments DROP CONSTRAINT departments_name_key;
    END IF;
    IF EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'designations_name_key'
    ) THEN
        ALTER TABLE designations DROP CONSTRAINT designations_name_key;
    END IF;
END $$;

-- First, update foreign key references to point to the kept department
WITH duplicates AS (
    SELECT name, MIN(id::text)::uuid AS keep_id
    FROM departments
    GROUP BY name
    HAVING COUNT(*) > 1
)
UPDATE courses
SET department_id = d.keep_id
FROM duplicates d
WHERE courses.department_id IN (
    SELECT id FROM departments 
    WHERE name IN (SELECT name FROM duplicates)
    AND id NOT IN (SELECT keep_id FROM duplicates)
);

-- Now clean up duplicate departments
WITH duplicates AS (
    SELECT name, MIN(id::text)::uuid AS keep_id
    FROM departments
    GROUP BY name
    HAVING COUNT(*) > 1
)
DELETE FROM departments
WHERE name IN (SELECT name FROM duplicates)
AND id NOT IN (SELECT keep_id FROM duplicates);

-- Clean up duplicate designations
WITH duplicates AS (
    SELECT name, MIN(id::text)::uuid AS keep_id
    FROM designations
    GROUP BY name
    HAVING COUNT(*) > 1
)
DELETE FROM designations
WHERE name IN (SELECT name FROM duplicates)
AND id NOT IN (SELECT keep_id FROM duplicates);

-- Add unique constraints back
ALTER TABLE departments ADD CONSTRAINT departments_name_key UNIQUE (name);
ALTER TABLE designations ADD CONSTRAINT designations_name_key UNIQUE (name); 