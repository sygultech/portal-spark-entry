
import { supabase } from '@/integrations/supabase/client';
import { GradingSystem, GradeThreshold } from '@/types/academic';

// Fetch all grading systems for a school
export async function fetchGradingSystems(schoolId: string) {
  const { data, error } = await supabase
    .from('grading_systems')
    .select('*, grade_thresholds(*)')
    .eq('school_id', schoolId)
    .order('name');
  
  if (error) {
    console.error('Error fetching grading systems:', error);
    throw error;
  }
  
  // Transform data to match GradingSystem interface structure
  return data.map(system => ({
    ...system,
    thresholds: system.grade_thresholds || []
  })) as GradingSystem[];
}

// Fetch a single grading system by ID
export async function fetchGradingSystem(id: string) {
  const { data, error } = await supabase
    .from('grading_systems')
    .select('*, grade_thresholds(*)')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching grading system:', error);
    throw error;
  }
  
  // Transform data to match GradingSystem interface structure
  return {
    ...data,
    thresholds: data.grade_thresholds || []
  } as GradingSystem;
}

// Create a new grading system with thresholds
export async function createGradingSystem(
  gradingSystem: Omit<GradingSystem, 'id' | 'created_at' | 'updated_at' | 'thresholds'> & { thresholds: Omit<GradeThreshold, 'id' | 'created_at' | 'updated_at' | 'grading_system_id'>[] }
) {
  // First create the grading system
  const { data: newGradingSystem, error } = await supabase
    .from('grading_systems')
    .insert({
      name: gradingSystem.name,
      type: gradingSystem.type,
      description: gradingSystem.description,
      passing_score: gradingSystem.passing_score,
      school_id: gradingSystem.school_id
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error creating grading system:', error);
    throw error;
  }
  
  // Then create the thresholds
  if (gradingSystem.thresholds && gradingSystem.thresholds.length > 0) {
    const thresholdsWithSystemId = gradingSystem.thresholds.map(threshold => ({
      ...threshold,
      grading_system_id: newGradingSystem.id
    }));
    
    const { error: thresholdError } = await supabase
      .from('grade_thresholds')
      .insert(thresholdsWithSystemId);
    
    if (thresholdError) {
      console.error('Error creating grade thresholds:', thresholdError);
      // Roll back grading system creation if thresholds fail
      await supabase.from('grading_systems').delete().eq('id', newGradingSystem.id);
      throw thresholdError;
    }
  }
  
  // Fetch the complete record with thresholds
  return await fetchGradingSystem(newGradingSystem.id);
}

// Update a grading system and its thresholds
export async function updateGradingSystem(
  id: string, 
  gradingSystem: Partial<Omit<GradingSystem, 'id' | 'created_at' | 'updated_at' | 'thresholds'>> & 
  { thresholds?: Partial<GradeThreshold>[] }
) {
  // Update the grading system
  if (Object.keys(gradingSystem).some(key => key !== 'thresholds')) {
    const { error } = await supabase
      .from('grading_systems')
      .update({
        ...gradingSystem,
        updated_at: new Date().toISOString(),
        thresholds: undefined // Remove thresholds from the update payload
      })
      .eq('id', id);
    
    if (error) {
      console.error('Error updating grading system:', error);
      throw error;
    }
  }
  
  // Update thresholds if provided
  if (gradingSystem.thresholds && gradingSystem.thresholds.length > 0) {
    // First delete all existing thresholds
    const { error: deleteError } = await supabase
      .from('grade_thresholds')
      .delete()
      .eq('grading_system_id', id);
    
    if (deleteError) {
      console.error('Error deleting existing grade thresholds:', deleteError);
      throw deleteError;
    }
    
    // Then insert the new thresholds
    const thresholdsWithSystemId = gradingSystem.thresholds.map(threshold => ({
      grade: threshold.grade,
      name: threshold.name,
      min_score: threshold.min_score,
      max_score: threshold.max_score,
      grade_point: threshold.grade_point,
      grading_system_id: id
    }));
    
    const { error: insertError } = await supabase
      .from('grade_thresholds')
      .insert(thresholdsWithSystemId);
    
    if (insertError) {
      console.error('Error inserting new grade thresholds:', insertError);
      throw insertError;
    }
  }
  
  // Fetch the updated record
  return await fetchGradingSystem(id);
}

// Delete a grading system (will cascade to thresholds)
export async function deleteGradingSystem(id: string) {
  // Check if the grading system is set as default for any schools
  const { data: schools, error: schoolError } = await supabase
    .from('schools')
    .select('id')
    .eq('default_grading_system_id', id);
  
  if (schoolError) {
    console.error('Error checking for default grading system usage:', schoolError);
    throw schoolError;
  }
  
  // If the grading system is set as default, remove it as default
  if (schools && schools.length > 0) {
    const { error: updateError } = await supabase
      .from('schools')
      .update({ default_grading_system_id: null })
      .eq('default_grading_system_id', id);
    
    if (updateError) {
      console.error('Error removing default grading system from schools:', updateError);
      throw updateError;
    }
  }
  
  // Check if the grading system is assigned to any batches
  const { data: batches, error: batchError } = await supabase
    .from('batches')
    .select('id')
    .eq('grading_system_id', id);
  
  if (batchError) {
    console.error('Error checking for batch grading system usage:', batchError);
    throw batchError;
  }
  
  // If the grading system is assigned to batches, remove it
  if (batches && batches.length > 0) {
    const { error: updateError } = await supabase
      .from('batches')
      .update({ grading_system_id: null })
      .eq('grading_system_id', id);
    
    if (updateError) {
      console.error('Error removing grading system from batches:', updateError);
      throw updateError;
    }
  }
  
  // Check if the grading system is assigned to any subjects
  const { data: subjects, error: subjectError } = await supabase
    .from('subjects')
    .select('id')
    .eq('grading_system_id', id);
  
  if (subjectError) {
    console.error('Error checking for subject grading system usage:', subjectError);
    throw subjectError;
  }
  
  // If the grading system is assigned to subjects, remove it
  if (subjects && subjects.length > 0) {
    const { error: updateError } = await supabase
      .from('subjects')
      .update({ grading_system_id: null })
      .eq('grading_system_id', id);
    
    if (updateError) {
      console.error('Error removing grading system from subjects:', updateError);
      throw updateError;
    }
  }
  
  // Delete the grading system (will cascade to thresholds)
  const { error } = await supabase
    .from('grading_systems')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting grading system:', error);
    throw error;
  }
  
  return true;
}

// Set a grading system as the default for a school
export async function setDefaultGradingSystem(schoolId: string, gradingSystemId: string) {
  const { data, error } = await supabase
    .from('schools')
    .update({
      default_grading_system_id: gradingSystemId,
      updated_at: new Date().toISOString()
    })
    .eq('id', schoolId)
    .select()
    .single();
  
  if (error) {
    console.error('Error setting default grading system:', error);
    throw error;
  }
  
  return data;
}

// Get batch and subject usage stats for a grading system
export async function getGradingSystemUsage(gradingSystemId: string) {
  // Get batch count
  const { count: batchCount, error: batchError } = await supabase
    .from('batches')
    .select('*', { count: 'exact', head: true })
    .eq('grading_system_id', gradingSystemId);
  
  if (batchError) {
    console.error('Error getting batch count:', batchError);
    throw batchError;
  }
  
  // Get subject count
  const { count: subjectCount, error: subjectError } = await supabase
    .from('subjects')
    .select('*', { count: 'exact', head: true })
    .eq('grading_system_id', gradingSystemId);
  
  if (subjectError) {
    console.error('Error getting subject count:', subjectError);
    throw subjectError;
  }
  
  return {
    batch_count: batchCount || 0,
    subject_count: subjectCount || 0
  };
}

// Assign grading system to batches
export async function assignGradingSystemToBatches(gradingSystemId: string, batchIds: string[]) {
  if (!batchIds.length) return { count: 0 };
  
  const { data, error } = await supabase
    .from('batches')
    .update({ 
      grading_system_id: gradingSystemId,
      updated_at: new Date().toISOString()
    })
    .in('id', batchIds);
  
  if (error) {
    console.error('Error assigning grading system to batches:', error);
    throw error;
  }
  
  return { count: batchIds.length };
}
