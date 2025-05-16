import { Subject, Batch, GradingSystem, SchoolSettings } from "@/types/academic";

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
  if (subject.grading_system_id) {
    return subject.grading_system || await fetchGradingSystem(subject.grading_system_id);
  }

  // Then check batch level
  if (batch.grading_system_id) {
    return batch.grading_system || await fetchGradingSystem(batch.grading_system_id);
  }

  // Finally fall back to school default
  if (schoolSettings.default_grading_system_id) {
    return await fetchGradingSystem(schoolSettings.default_grading_system_id);
  }

  return null;
};

// Helper function to fetch grading system (implementation depends on your data layer)
const fetchGradingSystem = async (id: string): Promise<GradingSystem | null> => {
  // This is a placeholder - implement according to your data access layer
  try {
    // Implementation would depend on your data access layer
    // Example implementation:
    // const response = await fetch(`/api/grading-systems/${id}`);
    // const data = await response.json();
    // return data;
    
    // For now, return null as this needs to be implemented
    return null;
  } catch (error) {
    console.error('Error fetching grading system:', error);
    return null;
  }
}; 