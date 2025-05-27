-- Grant usage on the schema
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;

-- Grant usage on the user_role type
GRANT USAGE ON TYPE public.user_role TO anon;
GRANT USAGE ON TYPE public.user_role TO authenticated;
GRANT USAGE ON TYPE public.user_role TO service_role;

-- Revoke all existing grants on profiles table
REVOKE ALL ON public.profiles FROM anon;
REVOKE ALL ON public.profiles FROM authenticated;
REVOKE ALL ON public.profiles FROM service_role;

-- Grant all permissions on profiles table
GRANT ALL ON public.profiles TO anon;
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

-- Grant usage on auth schema
GRANT USAGE ON SCHEMA auth TO anon;
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT USAGE ON SCHEMA auth TO service_role;

-- Grant select on auth.users
GRANT SELECT ON auth.users TO anon;
GRANT SELECT ON auth.users TO authenticated;
GRANT SELECT ON auth.users TO service_role; 