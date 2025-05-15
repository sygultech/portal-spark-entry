
import { supabase } from '@/integrations/supabase/client';
import { AcademicYear, CloneStructureOptions, CloneStructureResult } from '@/types/academic';

export async function fetchAcademicYears(schoolId?: string) {
  const query = supabase
    .from('academic_years')
    .select('*')
    .order('start_date', { ascending: false });
    
  // Add school_id filter if provided
  if (schoolId) {
    query.eq('school_id', schoolId);
  }
  
  const { data, error } = await query;

  if (error) throw error;
  return data as AcademicYear[];
}

export async function fetchAcademicYear(id: string) {
  const { data, error } = await supabase
    .from('academic_years')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as AcademicYear;
}

export async function createAcademicYear(academicYear: Omit<AcademicYear, 'id' | 'created_at' | 'updated_at'>) {
  try {
    // Format dates properly
    const formattedYear = {
      name: academicYear.name,
      start_date: new Date(academicYear.start_date).toISOString().split('T')[0],
      end_date: new Date(academicYear.end_date).toISOString().split('T')[0],
      school_id: academicYear.school_id,
      is_active: academicYear.is_active !== undefined ? academicYear.is_active : false,
      is_archived: academicYear.is_archived !== undefined ? academicYear.is_archived : false
    };

    // Insert with explicit column selection
    const { data, error } = await supabase
      .from('academic_years')
      .insert([formattedYear])
      .select();

    if (error) {
      console.error('Error creating academic year:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      throw new Error('No data returned after creating academic year');
    }

    return data[0] as AcademicYear;
  } catch (error) {
    console.error('Error creating academic year:', error);
    throw error;
  }
}

export async function updateAcademicYear(id: string, academicYear: Partial<AcademicYear>) {
  // Format dates if they are included in the update
  const formattedUpdate = { ...academicYear };
  if (academicYear.start_date) {
    formattedUpdate.start_date = new Date(academicYear.start_date).toISOString().split('T')[0];
  }
  if (academicYear.end_date) {
    formattedUpdate.end_date = new Date(academicYear.end_date).toISOString().split('T')[0];
  }
  
  // Add updated_at timestamp
  formattedUpdate.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('academic_years')
    .update(formattedUpdate)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as AcademicYear;
}

export async function deleteAcademicYear(id: string) {
  const { error } = await supabase
    .from('academic_years')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}

export async function setActiveAcademicYear(id: string, schoolId: string) {
  try {
    // First, set all academic years to inactive using a filter object
    const { error: updateError } = await supabase
      .from('academic_years')
      .update({
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .filter('school_id', 'eq', schoolId)
      .select('id');

    if (updateError) throw updateError;

    // Then, set the specified one as active using a filter object
    const { data, error } = await supabase
      .from('academic_years')
      .update({
        is_active: true,
        updated_at: new Date().toISOString()
      })
      .filter('id', 'eq', id)
      .filter('school_id', 'eq', schoolId)
      .select('*');

    if (error) throw error;
    
    if (!data || data.length === 0) {
      throw new Error('No data returned after setting active academic year');
    }

    return data[0] as AcademicYear;
  } catch (error) {
    console.error('Error setting active academic year:', error);
    throw error;
  }
}

export async function archiveAcademicYear(id: string) {
  const { data, error } = await supabase
    .from('academic_years')
    .update({ is_archived: true, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as AcademicYear;
}

export async function cloneAcademicStructure(options: CloneStructureOptions) {
  const { data, error } = await supabase
    .rpc('clone_academic_structure', options);

  if (error) throw error;
  return data as CloneStructureResult;
}
