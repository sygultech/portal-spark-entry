
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
      // Explicitly qualify all column names to avoid ambiguity
      const columns = Object.keys(data).map(k => `${table}.${k}`).join(', ')
      const placeholders = Object.keys(data).map((_, i) => `$${i + 1}`).join(', ')
      const sql = `INSERT INTO public.${table} (${columns}) 
                  VALUES (${placeholders})
                  ON CONFLICT (${table}.batch_id, ${table}.student_id) DO NOTHING
                  RETURNING ${table}.id`

      const { error } = await supabaseClient.rpc('execute_admin_sql', {
        sql,
        params: Object.values(data)
      })

      if (error) {
        return new Response(
          JSON.stringify({ error: `Error inserting data: ${error.message}` }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
      }
    } else if (operation === 'delete' && conditions) {
      // Handle delete operation with proper column name qualification
      let sql = `DELETE FROM public.${table} WHERE `
      const whereConditions = []
      const params = []
      
      let paramIndex = 1
      for (const [key, value] of Object.entries(conditions)) {
        // Explicitly qualify column names to avoid ambiguity
        whereConditions.push(`${table}.${key} = $${paramIndex}`)
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
