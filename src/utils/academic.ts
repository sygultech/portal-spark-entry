
import { Subject, Batch, GradingSystem, SchoolSettings } from "@/types/academic";
import { supabase } from "@/integrations/supabase/client";

/**
 * Resolves the appropriate grading system based on the hierarchy:
 * Subject > Batch > School Default
 */
export const resolveGradingSystem = async (
  subject: Subject,
  batch: Batch,
  schoolSettings: SchoolSettings
): Promise<GradingSystem | null> => {
  // First check subject level
  if (subject.grading_system) {
    return subject.grading_system;
  }
  
  // Then check batch level
  if (batch.grading_system) {
    return batch.grading_system;
  }
  
  if (batch.grading_system_id) {
    const system = await fetchGradingSystem(batch.grading_system_id);
    if (system) return system;
  }

  // Finally fall back to school default
  if (schoolSettings.default_grading_system_id) {
    return await fetchGradingSystem(schoolSettings.default_grading_system_id);
  }

  return null;
};

// Helper function to fetch grading system
export const fetchGradingSystem = async (id: string): Promise<GradingSystem | null> => {
  try {
    const { data, error } = await supabase
      .from('grading_systems')
      .select(`
        *,
        thresholds:grade_thresholds(*)
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching grading system:', error);
      return null;
    }
    
    // Transform data to match GradingSystem interface
    return {
      ...data,
      thresholds: data.thresholds || []
    } as GradingSystem;
  } catch (error) {
    console.error('Error fetching grading system:', error);
    return null;
  }
};

// force update

// force update
