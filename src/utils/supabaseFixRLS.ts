
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export async function fixRLSPolicies() {
  try {
    console.log('Attempting to fix RLS policies...');
    
    // Add more detailed logging for debugging
    const { data, error } = await supabase.functions.invoke('fix-rls', {
      method: 'POST',
      body: { timestamp: new Date().toISOString() } // Add payload for tracking
    });
    
    if (error) {
      console.error('Error fixing RLS policies:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      
      // Only show toast for unexpected errors, not authorization errors
      if (!error.message?.includes('Unauthorized') && !error.message?.includes('administrators')) {
        toast({
          title: 'Error',
          description: 'Failed to update database security policies. Please try again later.',
          variant: 'destructive',
        });
      }
      return false;
    }
    
    console.log('RLS policies updated successfully:', data);
    toast({
      title: 'Success',
      description: 'Database security policies updated successfully.',
    });
    return true;
  } catch (error) {
    console.error('Exception in fixRLSPolicies:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    
    toast({
      title: 'Error',
      description: 'An unexpected error occurred while updating security policies.',
      variant: 'destructive',
    });
    return false;
  }
}

// force update

// force update
