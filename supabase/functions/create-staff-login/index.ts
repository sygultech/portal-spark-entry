import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
}

// Helper function to normalize email
function normalizeEmail(email: string): string {
  if (!email) return '';
  // Only convert to lowercase and trim whitespace
  return email.toLowerCase().trim();
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
  console.log('=== Starting create-staff-login function ===')
  
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
    const { email, firstName, lastName, schoolId, password, staffId, roles } = await req.json()
    const normalizedEmail = normalizeEmail(email)
    console.log('Request body received:', { 
      originalEmail: email,
      normalizedEmail,
      firstName, 
      lastName, 
      schoolId, 
      staffId, 
      roles 
    })

    if (!email || !firstName || !lastName || !schoolId || !staffId || !roles) {
      console.log('Missing required fields')
      return createResponse({
        error: 'Missing required fields',
        details: {
          email: !email,
          firstName: !firstName,
          lastName: !lastName,
          schoolId: !schoolId,
          staffId: !staffId,
          roles: !roles
        }
      }, 400)
    }

    console.log('Creating Supabase admin client')
    // Create Supabase client with admin key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Checking staff existence in staff_details')
    // First check if staff exists in staff_details
    const { data: staffData, error: staffError } = await supabaseAdmin
      .from('staff_details')
      .select('*')
      .eq('id', staffId)
      .eq('school_id', schoolId)
      .single()

    if (staffError || !staffData) {
      console.log('Staff not found:', staffError)
      return createResponse({ error: 'Staff not found in staff_details table' }, 404)
    }
    console.log('Staff found:', staffData)

    // Verify email matches after normalization
    const staffEmail = normalizeEmail(staffData.email);
    console.log('Comparing normalized emails:', {
      staffEmail,
      normalizedEmail,
      originalStaffEmail: staffData.email,
      originalProvidedEmail: email
    });

    // Check if normalized versions match
    if (staffEmail !== normalizedEmail) {
      console.log('Email mismatch:', { 
        staffEmail,
        normalizedEmail,
        originalStaffEmail: staffData.email,
        originalProvidedEmail: email
      });
      return createResponse({ 
        error: 'Email does not match staff record',
        details: {
          staffEmail: staffData.email,
          providedEmail: email
        }
      }, 400);
    }

    // Convert roles to array if it's a single role
    const rolesToAdd = Array.isArray(roles) ? roles : [roles];
    console.log('Roles to add:', rolesToAdd)

    let userId: string
    let isExistingAuthUser = false

    console.log('Attempting to create new user')
    // Try to create new user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password,
      email_confirm: true,
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        school_id: schoolId,
        staff_id: staffId,
        roles: rolesToAdd
      }
    })

    if (authError) {
      console.log('Auth error occurred:', authError.message)
      // If user already exists in auth but not in profiles, get their ID
      if (authError.message.includes('User already registered') || authError.code === 'email_exists') {
        console.log('User already exists, fetching user details')
        // Use original email for exact match
        const { data: users, error: userError } = await supabaseAdmin.auth.admin.listUsers({
          filters: {
            email: email // Use original email for exact match
          }
        })
        
        if (userError) {
          console.log('Error fetching existing user:', userError)
          return createResponse({ error: 'Failed to get existing user details' }, 500)
        }

        if (!users?.users?.[0]?.id) {
          console.log('No user found with email match')
          return createResponse({ error: 'No user found with email match' }, 404)
        }

        // Verify normalized email match
        const existingUser = users.users[0]
        const existingUserEmail = normalizeEmail(existingUser.email)
        console.log('Comparing normalized emails:', {
          existingUserEmail,
          normalizedEmail,
          originalExistingEmail: existingUser.email,
          originalProvidedEmail: email,
          staffEmail: staffData.email,
          normalizedStaffEmail: staffEmail
        })

        // Check if the existing user's email matches either the staff email or the provided email
        if (existingUserEmail !== normalizedEmail && existingUserEmail !== staffEmail) {
          console.log('Normalized email mismatch:', {
            existingUserEmail,
            normalizedEmail,
            staffEmail,
            originalExistingEmail: existingUser.email,
            originalProvidedEmail: email,
            originalStaffEmail: staffData.email
          })
          return createResponse({ 
            error: 'Email does not match existing user record',
            details: {
              existingEmail: existingUser.email,
              providedEmail: email,
              staffEmail: staffData.email
            }
          }, 400)
        }

        userId = existingUser.id
        isExistingAuthUser = true
        console.log('Found existing user ID:', userId)

        console.log('Checking for existing profile')
        // Check if user already has a profile
        const { data: existingProfile, error: profileCheckError } = await supabaseAdmin
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single()

        if (profileCheckError && profileCheckError.code !== 'PGRST116') {
          console.log('Error checking existing profile:', profileCheckError)
          return createResponse({ error: 'Failed to check existing profile' }, 500)
        }

        if (existingProfile) {
          console.log('Existing profile found, updating with new roles')
          // Update the existing profile with all roles
          const { error: updateError } = await supabaseAdmin
            .from('profiles')
            .update({
              first_name: firstName,
              last_name: lastName,
              school_id: schoolId,
              roles: rolesToAdd // Now saving all roles as an array
            })
            .eq('id', userId)

          if (updateError) {
            console.log('Error updating existing profile:', updateError)
            return createResponse({ error: 'Failed to update existing profile' }, 500)
          }

          console.log('Updating staff_details with profile_id')
          // Update staff_details with the profile_id
          const { error: updateStaffError } = await supabaseAdmin
            .from('staff_details')
            .update({ profile_id: userId })
            .eq('id', staffId)
            .eq('school_id', schoolId)

          if (updateStaffError) {
            console.log('Error updating staff details:', updateStaffError)
            return createResponse({ error: 'Failed to link existing user to staff' }, 500)
          }

          console.log('Successfully linked existing user')
          return createResponse({ 
            user_id: userId, 
            status: 'linked_existing',
            roles: rolesToAdd
          })
        }
      } else {
        console.log('Authentication error:', authError)
        return createResponse({ error: `Authentication error: ${authError.message}` }, 500)
      }
    } else if (!authData?.user?.id) {
      console.log('No user data returned from createUser')
      return createResponse({ error: 'No user data returned from createUser' }, 500)
    } else {
      userId = authData.user.id
      console.log('New user created with ID:', userId)
    }

    console.log('Creating profile for new user')
    // Create profile with the first role
    const { error: createProfileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: userId,
        email: email,
        first_name: firstName,
        last_name: lastName,
        school_id: schoolId,
        roles: rolesToAdd, // Now saving all roles as an array
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (createProfileError) {
      console.log('Error creating profile:', createProfileError)
      // If profile creation fails and we created a new auth user, clean it up
      if (!isExistingAuthUser) {
        console.log('Cleaning up auth user due to profile creation failure')
        await supabaseAdmin.auth.admin.deleteUser(userId)
      }
      return createResponse({ error: `Failed to create profile: ${createProfileError.message}` }, 500)
    }

    console.log('Updating staff_details with profile_id')
    // Update staff_details with the profile_id
    const { error: updateStaffError } = await supabaseAdmin
      .from('staff_details')
      .update({ profile_id: userId })
      .eq('id', staffId)
      .eq('school_id', schoolId)

    if (updateStaffError) {
      console.log('Error updating staff details:', updateStaffError)
      // If staff details update fails, clean up everything
      console.log('Cleaning up due to staff details update failure')
      await supabaseAdmin
        .from('profiles')
        .delete()
        .eq('id', userId)
      if (!isExistingAuthUser) {
        await supabaseAdmin.auth.admin.deleteUser(userId)
      }
      return createResponse({ error: 'Failed to update staff details' }, 500)
    }

    console.log('Successfully completed staff login creation')
    return createResponse({ 
      user_id: userId, 
      status: 'created',
      roles: rolesToAdd
    })

  } catch (error) {
    console.error('Unexpected error in create-staff-login:', error)
    return createResponse({ error: error.message }, 500)
  }
}) 