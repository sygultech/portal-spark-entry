
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

    // Fix RLS policies for courses table
    const fixCoursesRLS = `
      -- Drop existing policies if they're causing conflicts
      DROP POLICY IF EXISTS "School admins can manage courses" ON public.courses;
      
      -- Create a clear policy with qualified table references
      CREATE POLICY "School admins can manage courses" 
      ON public.courses
      USING (
        public.courses.school_id = (SELECT school_id FROM public.profiles WHERE id = auth.uid())
      )
      WITH CHECK (
        public.courses.school_id = (SELECT school_id FROM public.profiles WHERE id = auth.uid())
      );
    `

    // Execute SQL to fix RLS - using the correct function name
    const { error } = await supabaseClient.rpc('execute_admin_sql', { 
      sql: fixCoursesRLS 
    })

    if (error) {
      console.error('Error fixing RLS:', error)
      return new Response(
        JSON.stringify({ error: `Failed to fix RLS: ${error.message}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    return new Response(
      JSON.stringify({ success: true, message: 'RLS policies updated successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error('Error:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
