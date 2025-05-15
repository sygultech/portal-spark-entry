
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData = await req.json();
    const { tableName } = requestData;

    if (!tableName) {
      throw new Error("Table name is required");
    }

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

    let sqlQuery = '';
    
    // Handle different table creations
    switch(tableName) {
      case 'batch_students':
        sqlQuery = `
          CREATE TABLE IF NOT EXISTS public.batch_students (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            batch_id UUID REFERENCES batches(id) NOT NULL,
            student_id UUID REFERENCES profiles(id) NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            UNIQUE(batch_id, student_id)
          );
          
          -- Add RLS policies
          ALTER TABLE public.batch_students ENABLE ROW LEVEL SECURITY;
          
          DO $$
          BEGIN
            IF NOT EXISTS (
              SELECT 1 FROM pg_policies 
              WHERE tablename = 'batch_students' 
              AND policyname = 'School admins can view student assignments'
            ) THEN
              CREATE POLICY "School admins can view student assignments" 
              ON public.batch_students FOR SELECT 
              TO authenticated
              USING (
                EXISTS (
                  SELECT 1 FROM public.batches 
                  WHERE public.batches.id = public.batch_students.batch_id 
                  AND public.batches.school_id = (SELECT school_id FROM profiles WHERE id = auth.uid())
                )
              );
            END IF;
            
            IF NOT EXISTS (
              SELECT 1 FROM pg_policies 
              WHERE tablename = 'batch_students' 
              AND policyname = 'School admins can insert student assignments'
            ) THEN
              CREATE POLICY "School admins can insert student assignments" 
              ON public.batch_students FOR INSERT 
              TO authenticated
              WITH CHECK (
                EXISTS (
                  SELECT 1 FROM public.batches 
                  WHERE public.batches.id = public.batch_students.batch_id 
                  AND public.batches.school_id = (SELECT school_id FROM profiles WHERE id = auth.uid())
                )
              );
            END IF;
            
            IF NOT EXISTS (
              SELECT 1 FROM pg_policies 
              WHERE tablename = 'batch_students' 
              AND policyname = 'School admins can update student assignments'
            ) THEN
              CREATE POLICY "School admins can update student assignments" 
              ON public.batch_students FOR UPDATE 
              TO authenticated
              USING (
                EXISTS (
                  SELECT 1 FROM public.batches 
                  WHERE public.batches.id = public.batch_students.batch_id 
                  AND public.batches.school_id = (SELECT school_id FROM profiles WHERE id = auth.uid())
                )
              );
            END IF;
            
            IF NOT EXISTS (
              SELECT 1 FROM pg_policies 
              WHERE tablename = 'batch_students' 
              AND policyname = 'School admins can delete student assignments'
            ) THEN
              CREATE POLICY "School admins can delete student assignments" 
              ON public.batch_students FOR DELETE 
              TO authenticated
              USING (
                EXISTS (
                  SELECT 1 FROM public.batches 
                  WHERE public.batches.id = public.batch_students.batch_id 
                  AND public.batches.school_id = (SELECT school_id FROM profiles WHERE id = auth.uid())
                )
              );
            END IF;
          END$$;
        `;
        break;
      
      default:
        throw new Error(`Unknown table: ${tableName}`);
    }

    // Execute the SQL
    const { error } = await supabaseAdmin.rpc('execute_admin_sql', { sql: sqlQuery });

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Table ${tableName} ensured`
      }),
      {
        headers: { "Content-Type": "application/json", ...corsHeaders },
        status: 200,
      }
    );
  } catch (error) {
    console.error(`Error ensuring table:`, error);
    
    return new Response(
      JSON.stringify({
        error: error.message || "Failed to ensure table",
      }),
      {
        headers: { "Content-Type": "application/json", ...corsHeaders },
        status: 500,
      }
    );
  }
});
