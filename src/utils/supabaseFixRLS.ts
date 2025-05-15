
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export async function fixRLSPolicies() {
  try {
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
    
    console.log('RLS policies updated:', data);
    return true;
  } catch (error) {
    console.error('Exception in fixRLSPolicies:', error);
    return false;
  }
}
