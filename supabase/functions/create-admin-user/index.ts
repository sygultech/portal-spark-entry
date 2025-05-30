import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

interface AdminUserRequest {
  admin_email: string;
  admin_password: string;
  admin_first_name: string;
  admin_last_name: string;
  admin_school_id: string;
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
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { 
      status: 204,
      headers: corsHeaders 
    });
  }

  try {
    const { admin_email, admin_password, admin_first_name, admin_last_name, admin_school_id } = 
      await req.json() as AdminUserRequest;

    // Create Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Create user with admin capabilities using service role
    const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: admin_email,
      password: admin_password,
      email_confirm: true, // Skip confirmation email
      user_metadata: {
        first_name: admin_first_name,
        last_name: admin_last_name,
        school_id: admin_school_id,
        roles: ['school_admin']
      }
    });

    if (createError) {
      return createResponse({ error: createError.message }, 500);
    }

    // Create profile with school_admin role
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: userData.user.id,
        email: admin_email,
        first_name: admin_first_name,
        last_name: admin_last_name,
        school_id: admin_school_id,
        roles: ['school_admin']
      });

    if (profileError) {
      console.error('Error creating profile:', profileError);
      return createResponse({ error: profileError.message }, 500);
    }

    // Return success response with user data
    return createResponse({
      user: userData.user,
      message: "Admin user created and confirmed successfully"
    });

  } catch (error) {
    console.error("Error creating admin user:", error);
    return createResponse({
      error: error.message || "Failed to create admin user",
    }, 500);
  }
});
