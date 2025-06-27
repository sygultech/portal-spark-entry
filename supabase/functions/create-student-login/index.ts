import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, accept, origin',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
  'Access-Control-Allow-Credentials': 'true'
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

// Helper function to validate roles
function validateRoles(roles: string[]): boolean {
  const validRoles = ['student', 'teacher', 'school_admin', 'super_admin', 'parent'];
  return Array.isArray(roles) && roles.every(role => validRoles.includes(role));
}

serve(async (req) => {
  console.log('Request received:', {
    method: req.method,
    headers: Object.fromEntries(req.headers.entries()),
    url: req.url
  });

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS request');
    return new Response(null, { 
      status: 204,
      headers: corsHeaders
    });
  }

  try {
    // Get the request body
    const { email, firstName, lastName, schoolId, password, studentId } = await req.json()
    console.log('Request body:', { email, firstName, lastName, schoolId, studentId });

    if (!email || !firstName || !lastName || !schoolId || !studentId) {
      console.log('Missing required fields');
      return createResponse({ error: 'Missing required fields' }, 400)
    }

    // Create Supabase client with admin key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // First check if student exists in student_details
    console.log('Checking student details for:', studentId);
    const { data: studentData, error: studentError } = await supabaseAdmin
      .from('student_details')
      .select('*')
      .eq('id', studentId)
      .eq('school_id', schoolId)
      .single()

    if (studentError || !studentData) {
      console.log('Student not found:', studentError);
      return createResponse({ error: 'Student not found in student_details table' }, 404)
    }

    // Check if user already exists in profiles for this school
    console.log('Checking existing profile for:', email);
    const { data: existingProfile, error: profileCheckError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('email', email)
      .eq('school_id', schoolId)
      .maybeSingle()

    if (profileCheckError) {
      console.log('Error checking profile:', profileCheckError);
      return createResponse({ error: profileCheckError.message }, 500)
    }

    if (existingProfile) {
      console.log('Profile exists, updating student details');
      
      // Validate existing roles
      if (!validateRoles(existingProfile.roles)) {
        console.log('Invalid roles in existing profile, updating to correct format');
        const { error: roleUpdateError } = await supabaseAdmin
          .from('profiles')
          .update({ roles: ['student'] })
          .eq('id', existingProfile.id);
          
        if (roleUpdateError) {
          console.log('Error updating roles:', roleUpdateError);
          return createResponse({ error: roleUpdateError.message }, 500)
        }
      }
      
      // If profile exists, update student_details with the profile_id
      const { error: updateError } = await supabaseAdmin
        .from('student_details')
        .update({ profile_id: existingProfile.id })
        .eq('id', studentId)
        .eq('school_id', schoolId)

      if (updateError) {
        console.log('Error updating student details:', updateError);
        return createResponse({ error: updateError.message }, 500)
      }

      return createResponse({ 
        user_id: existingProfile.id, 
        status: 'linked' 
      })
    }

    let userId: string
    let isExistingAuthUser = false

    // Try to create new user first - if it fails due to existing user, we'll handle it
    console.log('Attempting to create user for:', email);
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        school_id: schoolId,
        student_id: studentId,
        roles: ['student']  // Ensure roles is an array
      }
    })

    if (createError) {
      console.log('User creation failed:', createError.message);
      console.log('Error code:', createError.code);
      console.log('Full error object:', JSON.stringify(createError, null, 2));
      
      // Check if the error is due to user already existing (cast a wider net for error detection)
      const errorMessage = createError.message.toLowerCase();
      const isUserExistsError = 
        createError.message.includes('User already registered') || 
        createError.code === 'email_exists' ||
        errorMessage.includes('already') ||
        errorMessage.includes('exists') ||
        errorMessage.includes('duplicate') ||
        errorMessage.includes('registered') ||
        createError.code === 'user_already_exists';
      
      if (isUserExistsError) {
        
        console.log('User already exists, fetching user details');
        
        // Use the correct API method with email filter
        const { data: users, error: userError } = await supabaseAdmin.auth.admin.listUsers({
          filters: {
            email: email // Use email filter for exact match
          }
        })
        
        if (userError) {
          console.error('Error fetching existing user:', userError);
          return createResponse({ 
            error: 'Failed to get existing user details', 
            details: userError.message || 'Unknown error retrieving user' 
          }, 500)
        }

        if (!users?.users?.[0]?.id) {
          console.error('No user found with email match');
          return createResponse({ 
            error: 'No user found with email match', 
            details: 'User exists but could not be retrieved' 
          }, 404)
        }
        
        const existingUser = users.users[0]
        userId = existingUser.id
        isExistingAuthUser = true
        console.log('Found existing auth user:', userId);
        
        // Check if this user already has a profile before attempting to create one
        console.log('Checking if existing user already has a profile');
        const { data: existingUserProfile, error: profileCheckError } = await supabaseAdmin
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .eq('school_id', schoolId)
          .maybeSingle()

        if (profileCheckError) {
          console.log('Error checking existing user profile:', profileCheckError);
          return createResponse({ error: profileCheckError.message }, 500)
        }

        if (existingUserProfile) {
          console.log('Existing user already has profile, linking student');
          
          // Validate existing roles
          if (!validateRoles(existingUserProfile.roles)) {
            console.log('Invalid roles in existing user profile, updating to correct format');
            const { error: roleUpdateError } = await supabaseAdmin
              .from('profiles')
              .update({ roles: ['student'] })
              .eq('id', existingUserProfile.id);
              
            if (roleUpdateError) {
              console.log('Error updating roles:', roleUpdateError);
              return createResponse({ error: roleUpdateError.message }, 500)
            }
          }
          
          // Update student_details with the existing profile_id
          const { error: updateError } = await supabaseAdmin
            .from('student_details')
            .update({ profile_id: existingUserProfile.id })
            .eq('id', studentId)
            .eq('school_id', schoolId)

          if (updateError) {
            console.log('Error updating student details with existing profile:', updateError);
            return createResponse({ error: updateError.message }, 500)
          }

          return createResponse({ 
            user_id: existingUserProfile.id, 
            status: 'linked' 
          })
        }
        
        console.log('Existing user has no profile, will create one');
        
      } else {
        // Different error - not related to existing user
        console.error('Error creating user (not duplicate):', createError)
        console.error('Create error details:', JSON.stringify(createError, null, 2))
        return createResponse({ 
          error: 'Failed to create user', 
          details: createError.message || 'Unknown error during user creation' 
        }, 500)
      }
    } else {
      // User creation succeeded
      if (!newUser?.user?.id) {
        console.error('No user data returned from createUser')
        return createResponse({ error: 'No user data returned from createUser' }, 500)
      }
      
      userId = newUser.user.id
      console.log('Successfully created new user:', userId);
    }

    // Create profile with student role (works for both new and existing auth users)
    console.log('Creating profile for user:', userId, isExistingAuthUser ? '(existing auth user)' : '(new auth user)');
    const { error: profileCreateError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: userId,
        email,
        first_name: firstName,
        last_name: lastName,
        school_id: schoolId,
        roles: ['student']  // Ensure roles is an array
      })

    if (profileCreateError) {
      console.error('Error creating profile:', profileCreateError)
      // If profile creation fails and we created a new auth user, clean it up
      if (!isExistingAuthUser) {
        console.log('Cleaning up newly created auth user due to profile creation failure');
        await supabaseAdmin.auth.admin.deleteUser(userId)
      }
      return createResponse({ error: `Failed to create profile: ${profileCreateError.message}` }, 500)
    }

    // Verify profile is accessible and has correct roles
    console.log('Verifying profile creation for:', userId);
    const { data: verifyProfile, error: verifyError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (verifyError || !verifyProfile) {
      console.error('Error verifying profile:', verifyError)
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

    // Verify roles are in correct format
    if (!validateRoles(verifyProfile.roles)) {
      console.error('Invalid roles format in created profile:', verifyProfile.roles)
      // Update roles to correct format
      const { error: roleUpdateError } = await supabaseAdmin
        .from('profiles')
        .update({ roles: ['student'] })
        .eq('id', userId);
        
      if (roleUpdateError) {
        console.error('Error updating roles:', roleUpdateError)
        return createResponse({ error: 'Failed to set correct roles format' }, 500)
      }
    }

    // Update student_details with the new profile_id
    const { error: updateStudentError } = await supabaseAdmin
      .from('student_details')
      .update({ profile_id: userId })
      .eq('id', studentId)
      .eq('school_id', schoolId)

    if (updateStudentError) {
      console.error('Error updating student details with new user:', updateStudentError);
      // Clean up everything we created
      await supabaseAdmin.from('profiles').delete().eq('id', userId)
      if (!isExistingAuthUser) {
        await supabaseAdmin.auth.admin.deleteUser(userId)
      }
      return createResponse({ error: `Failed to link student: ${updateStudentError.message}` }, 500)
    }

    const statusMessage = isExistingAuthUser ? 'linked' : 'created';
    console.log(`Successfully ${statusMessage} student login for:`, email);
    return createResponse({ 
      user_id: userId, 
      status: statusMessage 
    })

  } catch (error) {
    console.error('Error in create-student-login:', error)
    return createResponse({ error: error.message }, 500)
  }
}) 