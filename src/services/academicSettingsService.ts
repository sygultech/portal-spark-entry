
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

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
export const fetchAcademicSettings = async (schoolId: string) => {
  try {
    const { data, error } = await supabase
      .from('academic_settings')
      .select('*')
      .eq('school_id', schoolId)
      .maybeSingle();

    if (error) {
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
    console.error('Exception in fetchAcademicSettings:', error);
    toast({
      title: 'Error',
      description: `An unexpected error occurred: ${error.message}`,
      variant: 'destructive',
    });
    return null;
  }
};

// Create or update academic settings
export const updateAcademicSettings = async (id: string, settings: Partial<AcademicSettings>) => {
  try {
    const { data, error } = await supabase
      .from('academic_settings')
      .update({
        ...settings,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
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
    
    toast({
      title: 'Success',
      description: 'Academic settings saved successfully',
    });
    
    return data?.[0];
  } catch (error: any) {
    console.error('Exception in updateAcademicSettings:', error);
    toast({
      title: 'Error',
      description: `An unexpected error occurred: ${error.message}`,
      variant: 'destructive',
    });
    return null;
  }
};

// Set default academic year
export const setDefaultAcademicYear = async (settingsId: string, academicYearId: string) => {
  try {
    const { data, error } = await supabase
      .from('academic_settings')
      .update({
        default_academic_year_id: academicYearId,
        updated_at: new Date().toISOString()
      })
      .eq('id', settingsId)
      .select();

    if (error) {
      console.error('Error setting default academic year:', error);
      toast({
        title: 'Error',
        description: `Could not set default year: ${error.message}`,
        variant: 'destructive',
      });
      return null;
    }
    
    toast({
      title: 'Success',
      description: 'Default academic year set successfully',
    });
    
    return data?.[0];
  } catch (error: any) {
    console.error('Exception in setDefaultAcademicYear:', error);
    toast({
      title: 'Error',
      description: `An unexpected error occurred: ${error.message}`,
      variant: 'destructive',
    });
    return null;
  }
};

// Create academic settings if they don't exist
export const createAcademicSettings = async (schoolId: string, settings: Partial<AcademicSettings>) => {
  try {
    const { data, error } = await supabase
      .from('academic_settings')
      .insert({
        ...settings,
        school_id: schoolId
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
    
    toast({
      title: 'Success',
      description: 'Academic settings created successfully',
    });
    
    return data?.[0];
  } catch (error: any) {
    console.error('Exception in createAcademicSettings:', error);
    toast({
      title: 'Error',
      description: `An unexpected error occurred: ${error.message}`,
      variant: 'destructive',
    });
    return null;
  }
};

// Get audit logs
export const fetchAcademicAuditLogs = async (schoolId: string, filters?: {
  entityType?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
}) => {
  try {
    let query = supabase
      .from('academic_audit_logs')
      .select(`
        *,
        user:user_id (id, email, first_name, last_name)
      `)
      .eq('school_id', schoolId)
      .order('created_at', { ascending: false });
    
    if (filters?.entityType) {
      query = query.eq('entity_type', filters.entityType);
    }
    
    if (filters?.userId) {
      query = query.eq('user_id', filters.userId);
    }
    
    if (filters?.startDate) {
      query = query.gte('created_at', filters.startDate);
    }
    
    if (filters?.endDate) {
      query = query.lte('created_at', filters.endDate);
    }
    
    const { data, error } = await query.limit(100);

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
    console.error('Exception in fetchAcademicAuditLogs:', error);
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
