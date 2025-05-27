import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 204,
      headers: corsHeaders 
    })
  }

  try {
    // Get the request body
    const { email, firstName, lastName, schoolId, password, studentId } = await req.json()

    if (!email || !firstName || !lastName || !schoolId || !studentId) {
      return createResponse({ error: 'Missing required fields' }, 400)
    }

    // Create Supabase client with admin key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // First check if student exists in student_details
    const { data: studentData, error: studentError } = await supabaseAdmin
      .from('student_details')
      .select('*')
      .eq('id', studentId)
      .eq('school_id', schoolId)
      .single()

    if (studentError || !studentData) {
      return createResponse({ error: 'Student not found in student_details table' }, 404)
    }

    // Check if user already exists in profiles for this school
    const { data: existingProfile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('email', email)
      .eq('school_id', schoolId)
      .maybeSingle()

    if (profileError) {
      return createResponse({ error: profileError.message }, 500)
    }

    if (existingProfile) {
      // If profile exists, update student_details with the profile_id
      const { error: updateError } = await supabaseAdmin
        .from('student_details')
        .update({ profile_id: existingProfile.id })
        .eq('id', studentId)
        .eq('school_id', schoolId)

      if (updateError) {
        return createResponse({ error: updateError.message }, 500)
      }

      return createResponse({ 
        user_id: existingProfile.id, 
        status: 'already_exists' 
      })
    }

    let userId: string
    let isExistingAuthUser = false

    // Try to create new user
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        school_id: schoolId,
        student_id: studentId,
        roles: ['student']
      }
    })

    if (createError) {
      console.error('Error creating user:', createError)
      return createResponse({ error: 'Failed to create user' }, 500)
    }

    if (!newUser?.user?.id) {
      return createResponse({ error: 'No user data returned from createUser' }, 500)
    } else {
      userId = newUser.user.id
    }

    // Create profile with student role
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: userId,
        email,
        first_name: firstName,
        last_name: lastName,
        school_id: schoolId,
        roles: ['student']
      })

    if (profileError) {
      // If profile creation fails and we created a new auth user, clean it up
      if (!isExistingAuthUser) {
        await supabaseAdmin.auth.admin.deleteUser(userId)
      }
      return createResponse({ error: `Failed to create profile: ${profileError.message}` }, 500)
    }

    // Verify profile is accessible
    const { data: verifyProfile, error: verifyError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (verifyError || !verifyProfile) {
      // If verification fails, clean up everything
      await supabaseAdmin
        .from('profiles')
        .delete()
        .eq('id', userId)
      if (!isExistingAuthUser) {
        await supabaseAdmin.auth.admin.deleteUser(userId)
      }
      return createResponse({ error: 'Failed to verify profile creation' }, 500)
    }

    return createResponse({ 
      user_id: userId, 
      status: 'created' 
    })

  } catch (error) {
    console.error('Error in create-student-login:', error)
    return createResponse({ error: error.message }, 500)
  }
}) 