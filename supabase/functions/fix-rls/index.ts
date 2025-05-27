import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

interface FixRLSRequest {
  action: 'verify' | 'fix';
}

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
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 204,
      headers: corsHeaders 
    })
  }

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseServiceKey) {
      return createResponse({ error: 'Missing environment variables' }, 500)
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { data: requestData } = await req.json() as { data: FixRLSRequest };
    const action = requestData?.action || 'verify';

    if (action === 'fix') {
      // Apply RLS policies to required tables
      await fixAcademicYearsRLS(supabase);

      return createResponse({
        message: "Row Level Security policies have been successfully applied.",
        success: true
      });
    } else {
      // Verify RLS status
      const academicYearsRLS = await verifyTableRLS(supabase, 'academic_years');

      return createResponse({
        tables: {
          academic_years: academicYearsRLS,
        },
        message: "RLS verification completed"
      });
    }
  } catch (error) {
    console.error("Error in fix-rls function:", error);
    return createResponse({ 
      message: "Error fixing RLS policies", 
      error: error.message 
    }, 500);
  }
})

async function verifyTableRLS(supabase, tableName) {
  const { data, error } = await supabase
    .rpc('admin_execute_sql', {
      sql: `SELECT rls_enabled FROM pg_tables WHERE tablename = '${tableName}' AND schemaname = 'public'`
    });

  if (error) {
    throw error;
  }

  return data && data.length > 0 ? data[0].rls_enabled : false;
}

async function fixAcademicYearsRLS(supabase) {
  // Enable RLS on academic_years table
  await supabase.rpc('admin_execute_sql', {
    sql: `
      ALTER TABLE public.academic_years ENABLE ROW LEVEL SECURITY;
      
      -- Drop existing policies if they exist
      DROP POLICY IF EXISTS "Users can view academic years for their school" ON public.academic_years;
      DROP POLICY IF EXISTS "School admins can manage academic years" ON public.academic_years;
      DROP POLICY IF EXISTS "Super admins can manage all academic years" ON public.academic_years;
      
      -- Create view policy for all users in the same school
      CREATE POLICY "Users can view academic years for their school"
        ON public.academic_years
        FOR SELECT
        USING (
          auth.uid() IN (
            SELECT id FROM public.profiles 
            WHERE school_id = academic_years.school_id
          )
        );
        
      -- Create management policy for school admins
      CREATE POLICY "School admins can manage academic years"
        ON public.academic_years
        FOR ALL
        USING (
          EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() 
            AND school_id = academic_years.school_id
            AND 'school_admin' = ANY(roles)
          )
        )
        WITH CHECK (
          EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() 
            AND school_id = academic_years.school_id
            AND 'school_admin' = ANY(roles)
          )
        );
        
      -- Create management policy for super admins
      CREATE POLICY "Super admins can manage all academic years"
        ON public.academic_years
        FOR ALL
        USING (
          EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND 'super_admin' = ANY(roles)
          )
        )
        WITH CHECK (
          EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND 'super_admin' = ANY(roles)
          )
        );
    `
  });
}
