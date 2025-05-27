-- Drop the trigger first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop the trigger function
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Revoke the permissions we granted
REVOKE USAGE ON SCHEMA public FROM authenticated;
REVOKE ALL ON public.profiles FROM authenticated;
REVOKE USAGE ON SCHEMA auth FROM authenticated;
REVOKE SELECT ON auth.users FROM authenticated; 