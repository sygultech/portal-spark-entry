
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export interface AcademicSettings {
  id: string;
  school_id: string;
  default_academic_year_id: string | null;
  enable_audit_log: boolean;
  student_self_enroll: boolean;
  teacher_edit_subjects: boolean;
  created_at: string;
  updated_at: string;
}

// Get academic settings for the school
export const getAcademicSettings = async () => {
  try {
    const { data, error } = await supabase
      .from('academic_settings')
      .select('*')
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
      console.error('Error fetching academic settings:', error);
      toast({
        title: 'Error',
        description: `Could not fetch academic settings: ${error.message}`,
        variant: 'destructive',
      });
      return null;
    }

    return data;
  } catch (error: any) {
    console.error('Exception in getAcademicSettings:', error);
    toast({
      title: 'Error',
      description: `An unexpected error occurred: ${error.message}`,
      variant: 'destructive',
    });
    return null;
  }
};

// Create or update academic settings
export const saveAcademicSettings = async (settings: Partial<AcademicSettings>) => {
  try {
    const { profile } = useAuth();
    
    if (!profile || !profile.school_id) {
      toast({
        title: 'Error',
        description: 'School information not available',
        variant: 'destructive',
      });
      return null;
    }

    const { data: existingData } = await supabase
      .from('academic_settings')
      .select('id')
      .eq('school_id', profile.school_id)
      .maybeSingle();

    let result;
    
    if (existingData) {
      // Update existing settings
      const { data, error } = await supabase
        .from('academic_settings')
        .update({
          ...settings,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingData.id)
        .select();

      if (error) {
        console.error('Error updating academic settings:', error);
        toast({
          title: 'Error',
          description: `Could not update settings: ${error.message}`,
          variant: 'destructive',
        });
        return null;
      }
      
      result = data?.[0];
    } else {
      // Create new settings
      const { data, error } = await supabase
        .from('academic_settings')
        .insert({
          ...settings,
          school_id: profile.school_id
        })
        .select();

      if (error) {
        console.error('Error creating academic settings:', error);
        toast({
          title: 'Error',
          description: `Could not create settings: ${error.message}`,
          variant: 'destructive',
        });
        return null;
      }
      
      result = data?.[0];
    }

    toast({
      title: 'Success',
      description: 'Academic settings saved successfully',
    });
    
    return result;
  } catch (error: any) {
    console.error('Exception in saveAcademicSettings:', error);
    toast({
      title: 'Error',
      description: `An unexpected error occurred: ${error.message}`,
      variant: 'destructive',
    });
    return null;
  }
};

// Get audit logs
export const getAcademicAuditLogs = async (limit = 50, offset = 0) => {
  try {
    const { data, error } = await supabase
      .from('academic_audit_logs')
      .select(`
        *,
        user:profiles(id, email, first_name, last_name)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching audit logs:', error);
      toast({
        title: 'Error',
        description: `Could not fetch audit logs: ${error.message}`,
        variant: 'destructive',
      });
      return [];
    }

    return data || [];
  } catch (error: any) {
    console.error('Exception in getAcademicAuditLogs:', error);
    toast({
      title: 'Error',
      description: `An unexpected error occurred: ${error.message}`,
      variant: 'destructive',
    });
    return [];
  }
};

// Clone academic structure from one year to another
export const cloneAcademicStructure = async (
  sourceYearId: string,
  targetYearId: string,
  options = {
    cloneCourses: true,
    cloneBatches: true,
    cloneSubjects: true,
    cloneGrading: false,
    cloneElectives: false
  }
) => {
  try {
    const { data, error } = await supabase.rpc('clone_academic_structure', {
      source_year_id: sourceYearId,
      target_year_id: targetYearId,
      clone_courses: options.cloneCourses,
      clone_batches: options.cloneBatches,
      clone_subjects: options.cloneSubjects,
      clone_grading: options.cloneGrading,
      clone_electives: options.cloneElectives
    });

    if (error) {
      console.error('Error cloning academic structure:', error);
      toast({
        title: 'Error',
        description: `Failed to clone: ${error.message}`,
        variant: 'destructive',
      });
      return null;
    }

    toast({
      title: 'Success',
      description: 'Academic structure cloned successfully',
    });
    
    return data;
  } catch (error: any) {
    console.error('Exception in cloneAcademicStructure:', error);
    toast({
      title: 'Error',
      description: `An unexpected error occurred: ${error.message}`,
      variant: 'destructive',
    });
    return null;
  }
};
