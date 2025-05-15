
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AdminUserRequest {
  admin_email: string;
  admin_password: string;
  admin_first_name: string;
  admin_last_name: string;
  admin_school_id: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
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
        role: "school_admin",
        school_id: admin_school_id
      }
    });

    if (createError) {
      throw createError;
    }

    // Return success response with user data
    return new Response(
      JSON.stringify({
        user: userData.user,
        message: "Admin user created and confirmed successfully"
      }),
      {
        headers: { "Content-Type": "application/json", ...corsHeaders },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error creating admin user:", error);
    
    return new Response(
      JSON.stringify({
        error: error.message || "Failed to create admin user",
      }),
      {
        headers: { "Content-Type": "application/json", ...corsHeaders },
        status: 500,
      }
    );
  }
});
