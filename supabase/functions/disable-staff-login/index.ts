import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Define CORS headers directly here
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
}

serve(async (req) => {
  console.log('=== Starting disable-staff-login function ===')
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS request')
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    })
  }

  try {
    // Get the request body
    const { staffId } = await req.json()
    console.log('Request body received:', { staffId })

    if (!staffId) {
      console.log('Missing required fields')
      return new Response(
        JSON.stringify({ error: 'Staff ID is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('Creating Supabase admin client')
    // Create Supabase client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get the staff details to find the profile_id
    const { data: staffData, error: staffError } = await supabaseAdmin
      .from('staff_details')
      .select('profile_id')
      .eq('id', staffId)
      .single()

    if (staffError || !staffData) {
      console.log('Staff not found:', staffError)
      return new Response(
        JSON.stringify({ error: 'Staff not found' }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const profileId = staffData.profile_id

    if (!profileId) {
      console.log('No profile_id found for staff')
      return new Response(
        JSON.stringify({ error: 'Staff has no associated profile' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Delete all records in profiles table for this user
    const { error: deleteError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', profileId)

    if (deleteError) {
      console.log('Error deleting profile records:', deleteError)
      return new Response(
        JSON.stringify({ error: 'Failed to delete profile records' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Update profile_id to NULL in staff_details
    const { error: updateError } = await supabaseAdmin
      .from('staff_details')
      .update({ profile_id: null })
      .eq('id', staffId)

    if (updateError) {
      console.log('Error updating staff details:', updateError)
      return new Response(
        JSON.stringify({ error: 'Failed to update staff details' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('Successfully disabled staff login')
    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Unexpected error in disable-staff-login:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
}) 