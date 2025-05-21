
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

    const { table, schema, operation, data, conditions } = await req.json()

    // Ensure the table exists
    if (schema) {
      // Execute schema creation commands
      const { error } = await supabaseClient.rpc('execute_admin_sql', { sql: schema })
      if (error) {
        return new Response(
          JSON.stringify({ error: `Error creating schema: ${error.message}` }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
      }
    }

    // Handle CRUD operations if specified
    if (operation === 'insert' && data) {
      // Handle insert operation
      const { error } = await supabaseClient.rpc('execute_admin_sql', {
        sql: `INSERT INTO public.${table} (${Object.keys(data).join(', ')}) 
              VALUES (${Object.keys(data).map((k, i) => `$${i + 1}`).join(', ')})
              ON CONFLICT (batch_id, student_id) DO NOTHING
              RETURNING id`,
        params: Object.values(data)
      })

      if (error) {
        return new Response(
          JSON.stringify({ error: `Error inserting data: ${error.message}` }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
      }
    } else if (operation === 'delete' && conditions) {
      // Handle delete operation
      let sql = `DELETE FROM public.${table} WHERE `
      const whereConditions = []
      const params = []
      
      let paramIndex = 1
      for (const [key, value] of Object.entries(conditions)) {
        whereConditions.push(`${key} = $${paramIndex}`)
        params.push(value)
        paramIndex++
      }
      
      sql += whereConditions.join(' AND ')
      
      const { error } = await supabaseClient.rpc('execute_admin_sql', {
        sql,
        params
      })

      if (error) {
        return new Response(
          JSON.stringify({ error: `Error deleting data: ${error.message}` }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
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

// force update

// force update
