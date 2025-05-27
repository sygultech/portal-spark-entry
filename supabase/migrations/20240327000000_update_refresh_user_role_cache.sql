-- Update refresh_user_role_cache function to use correct column names
CREATE OR REPLACE FUNCTION "public"."refresh_user_role_cache"("p_user_id" "uuid") 
RETURNS "void"
LANGUAGE "plpgsql" SECURITY DEFINER AS $$
BEGIN
    -- Delete existing cache entries for this user
    DELETE FROM user_role_cache WHERE user_id = p_user_id;
    
    -- Insert one record per role from the profiles table's roles array
    INSERT INTO user_role_cache (
        user_id,
        school_id,
        user_role,
        created_at,
        updated_at
    )
    SELECT 
        p.id as user_id,
        p.school_id,
        unnest(p.roles) as user_role,
        now() as created_at,
        now() as updated_at
    FROM profiles p
    WHERE p.id = p_user_id;
END;
$$;

ALTER FUNCTION "public"."refresh_user_role_cache"("p_user_id" "uuid") OWNER TO "postgres"; 