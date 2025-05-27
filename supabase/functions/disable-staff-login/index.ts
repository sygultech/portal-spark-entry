import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Define CORS headers directly here
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
}

// Helper function to create consistent responses with CORS headers
function createResponse(data: any, status = 200) {
  return new Response(
    JSON.stringify(data),
    { 
      status,
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json' 
      }
    }
  );
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
      return createResponse({ error: 'Staff ID is required' }, 400)
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
      return createResponse({ error: 'Staff not found' }, 404)
    }

    const profileId = staffData.profile_id

    if (!profileId) {
      console.log('No profile_id found for staff')
      return createResponse({ error: 'Staff has no associated profile' }, 400)
    }

    // Delete all records in profiles table for this user
    const { error: deleteError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', profileId)

    if (deleteError) {
      console.log('Error deleting profile records:', deleteError)
      return createResponse({ error: 'Failed to delete profile records' }, 500)
    }

    // Update profile_id to NULL in staff_details
    const { error: updateError } = await supabaseAdmin
      .from('staff_details')
      .update({ profile_id: null })
      .eq('id', staffId)

    if (updateError) {
      console.log('Error updating staff details:', updateError)
      return createResponse({ error: 'Failed to update staff details' }, 500)
    }

    console.log('Successfully disabled staff login')
    return createResponse({ success: true })

  } catch (error) {
    console.error('Unexpected error in disable-staff-login:', error)
    return createResponse({ error: error.message }, 500)
  }
}) 