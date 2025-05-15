
import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the Auth context of the logged in user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // Get the current authenticated user
    const {
      data: { user },
      error: authError
    } = await supabaseClient.auth.getUser()

    if (authError || !user) {
      console.error('Authentication error:', authError)
      return new Response(
        JSON.stringify({ error: 'Unauthorized', details: authError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    // Check if user is a super admin
    const { data: isSuperAdmin, error: roleError } = await supabaseClient.rpc('is_super_admin')
    if (roleError) {
      console.error('Error checking super admin status:', roleError)
      return new Response(
        JSON.stringify({ error: 'Failed to verify admin status', details: roleError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    if (!isSuperAdmin) {
      return new Response(
        JSON.stringify({ error: 'Only super administrators can update RLS policies' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      )
    }

    // Fix RLS policy for courses with fully qualified references to avoid ambiguity
    const fixCoursesRLS = `
      -- Drop existing policies if they're causing conflicts
      DROP POLICY IF EXISTS "School admins can manage courses" ON public.courses;
      
      -- Create a clear policy with fully qualified table references
      CREATE POLICY "School admins can manage courses" 
      ON public.courses
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles 
          WHERE public.profiles.id = auth.uid() 
          AND public.profiles.school_id = public.courses.school_id
          AND (public.profiles.role = 'school_admin' OR public.profiles.role = 'super_admin')
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.profiles 
          WHERE public.profiles.id = auth.uid() 
          AND public.profiles.school_id = public.courses.school_id
          AND (public.profiles.role = 'school_admin' OR public.profiles.role = 'super_admin')
        )
      );
      
      -- Fix academic years RLS policy to avoid ambiguous column references
      DROP POLICY IF EXISTS "School admins can manage their school's academic years" ON public.academic_years;
      
      CREATE POLICY "School admins can manage their school's academic years" 
      ON public.academic_years
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles 
          WHERE public.profiles.id = auth.uid() 
          AND public.profiles.school_id = public.academic_years.school_id
          AND (public.profiles.role = 'school_admin' OR public.profiles.role = 'super_admin')
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.profiles 
          WHERE public.profiles.id = auth.uid() 
          AND public.profiles.school_id = public.academic_years.school_id
          AND (public.profiles.role = 'school_admin' OR public.profiles.role = 'super_admin')
        )
      );
    `

    // Execute SQL using the execute_admin_sql function
    const { data, error } = await supabaseClient.rpc('execute_admin_sql', { 
      sql: fixCoursesRLS 
    })

    if (error) {
      console.error('Error executing SQL:', error)
      return new Response(
        JSON.stringify({ 
          error: `Failed to fix RLS: ${error.message}`,
          details: error
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'RLS policies updated successfully',
        details: data
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error('Unhandled error in fix-rls:', error.message, error.stack)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        stack: error.stack 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
