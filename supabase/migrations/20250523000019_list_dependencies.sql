-- List all dependencies on the role column
SELECT DISTINCT
    c.relname AS dependent_object,
    CASE c.relkind
        WHEN 'r' THEN 'table'
        WHEN 'v' THEN 'view'
        WHEN 'm' THEN 'materialized view'
        WHEN 'f' THEN 'foreign table'
        WHEN 'p' THEN 'partitioned table'
        WHEN 'i' THEN 'index'
        WHEN 'S' THEN 'sequence'
        WHEN 't' THEN 'TOAST table'
        WHEN 'c' THEN 'composite type'
        WHEN 'd' THEN 'domain'
        WHEN 'y' THEN 'type'
        WHEN 'l' THEN 'large object'
        WHEN 'F' THEN 'foreign table'
        WHEN 'I' THEN 'partitioned index'
        ELSE c.relkind::text
    END AS object_type,
    pg_get_object_address(c.oid, c.relkind) AS object_address
FROM pg_depend d
JOIN pg_class c ON c.oid = d.refobjid
JOIN pg_attribute a ON a.attrelid = d.refobjid AND a.attnum = d.refobjsubid
JOIN pg_class c2 ON c2.oid = d.classid
WHERE c2.relname = 'profiles'
AND a.attname = 'role'
AND c.relkind IN ('r', 'v', 'm', 'f', 'p', 'i', 'S', 't', 'c', 'd', 'y', 'l', 'F', 'I');

-- List all functions that reference the role column
SELECT DISTINCT
    p.proname AS function_name,
    pg_get_functiondef(p.oid) AS function_definition
FROM pg_proc p
JOIN pg_depend d ON d.refobjid = p.oid
JOIN pg_class c ON c.oid = d.classid
JOIN pg_attribute a ON a.attrelid = c.oid AND a.attnum = d.refobjsubid
WHERE c.relname = 'profiles'
AND a.attname = 'role';

-- List all triggers that reference the role column
SELECT DISTINCT
    t.tgname AS trigger_name,
    pg_get_triggerdef(t.oid) AS trigger_definition
FROM pg_trigger t
JOIN pg_depend d ON d.refobjid = t.oid
JOIN pg_class c ON c.oid = d.classid
JOIN pg_attribute a ON a.attrelid = c.oid AND a.attnum = d.refobjsubid
WHERE c.relname = 'profiles'
AND a.attname = 'role'; 