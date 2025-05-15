
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
    } = await supabaseClient.auth.getUser()

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    // Fix RLS policy for courses
    // We'll use a direct SQL query instead since the function appears to be having issues
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
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.profiles 
          WHERE public.profiles.id = auth.uid() 
          AND public.profiles.school_id = public.courses.school_id
        )
      );
    `

    // Execute SQL using a more direct approach with rpc
    const { data, error } = await supabaseClient.rpc('execute_admin_sql', { 
      sql: fixCoursesRLS 
    })

    if (error) {
      console.error('Error executing SQL:', error)
      return new Response(
        JSON.stringify({ 
          error: `Failed to fix RLS: ${error.message}`,
          details: error,
          function_call: 'execute_admin_sql'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'RLS policies updated successfully',
        executed_sql: 'Updated courses table policies with fully qualified references'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error('Unhandled error in fix-rls:', error.message)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        stack: error.stack 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
