import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the request body
    const { email, firstName, lastName, schoolId, password, studentId } = await req.json()

    if (!email || !firstName || !lastName || !schoolId || !studentId) {
      throw new Error('Missing required fields')
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
      throw new Error('Student not found in student_details table')
    }

    // Check if user already exists in profiles for this school
    const { data: existingProfile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('email', email)
      .eq('school_id', schoolId)
      .maybeSingle()

    if (profileError) {
      throw profileError
    }

    if (existingProfile) {
      // If profile exists, update student_details with the profile_id
      const { error: updateError } = await supabaseAdmin
        .from('student_details')
        .update({ profile_id: existingProfile.id })
        .eq('id', studentId)
        .eq('school_id', schoolId)

      if (updateError) {
        throw updateError
      }

      return new Response(
        JSON.stringify({ user_id: existingProfile.id, status: 'already_exists' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let userId: string
    let isExistingAuthUser = false

    // Try to create new user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        role: 'student',
        school_id: schoolId
      }
    })

    if (authError) {
      // If user already exists in auth but not in profiles, get their ID
      if (authError.message.includes('User already registered') || authError.code === 'email_exists') {
        const { data: users, error: userError } = await supabaseAdmin.auth.admin.listUsers({
          filters: {
            email: email
          }
        })
        
        if (userError) {
          console.error('Error getting existing user:', userError)
          throw new Error('Failed to get existing user details')
        }

        if (!users?.users?.[0]?.id) {
          throw new Error('No user ID found for existing user')
        }

        userId = users.users[0].id
        isExistingAuthUser = true

        // Check if user already has a profile
        const { data: existingProfile, error: profileCheckError } = await supabaseAdmin
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single()

        if (profileCheckError && profileCheckError.code !== 'PGRST116') { // PGRST116 is "not found" error
          console.error('Error checking existing profile:', profileCheckError)
          throw new Error('Failed to check existing profile')
        }

        if (existingProfile) {
          // If profile exists, update student_details with the profile_id
          const { error: updateError } = await supabaseAdmin
            .from('student_details')
            .update({ profile_id: userId })
            .eq('id', studentId)
            .eq('school_id', schoolId)

          if (updateError) {
            console.error('Error updating student details:', updateError)
            throw new Error('Failed to link existing user to student')
          }

          return new Response(
            JSON.stringify({ user_id: userId, status: 'linked_existing' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
      } else {
        console.error('Auth error:', authError)
        throw new Error(`Authentication error: ${authError.message}`)
      }
    } else if (!authData?.user?.id) {
      throw new Error('No user data returned from createUser')
    } else {
      userId = authData.user.id
    }

    // Create profile
    const { error: createProfileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: userId,
        email: email,
        first_name: firstName,
        last_name: lastName,
        role: 'student',
        school_id: schoolId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (createProfileError) {
      // If profile creation fails and we created a new auth user, clean it up
      if (!isExistingAuthUser) {
        await supabaseAdmin.auth.admin.deleteUser(userId)
      }
      // Always throw error if profile creation fails, regardless of whether it's a new or existing auth user
      throw new Error(`Failed to create profile: ${createProfileError.message}`)
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
      throw new Error('Failed to verify profile creation')
    }

    return new Response(
      JSON.stringify({ user_id: userId, status: 'created' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in create-student-login:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
}) 