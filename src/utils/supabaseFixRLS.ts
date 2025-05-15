
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export async function fixRLSPolicies() {
  try {
    console.log('Attempting to fix RLS policies...');
    
    const { data, error } = await supabase.functions.invoke('fix-rls');
    
    if (error) {
      console.error('Error fixing RLS policies:', error);
      toast({
        title: 'Error',
        description: 'Failed to update database security policies.',
        variant: 'destructive',
      });
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
    toast({
      title: 'Error',
      description: 'An unexpected error occurred while updating security policies.',
      variant: 'destructive',
    });
    return false;
  }
}
