
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
      .select(`
        id,
        name,
        start_date,
        end_date,
        is_active,
        is_archived,
        school_id,
        created_at,
        updated_at
      `)
      .single();

    if (error) {
      console.error('Error creating academic year:', error);
      throw error;
    }

    return data as AcademicYear;
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
    .match({ id })
    .select(`
      id,
      name,
      start_date,
      end_date,
      is_active,
      is_archived,
      school_id,
      created_at,
      updated_at
    `)
    .single();

  if (error) throw error;
  return data as AcademicYear;
}

export async function deleteAcademicYear(id: string) {
  const { error } = await supabase
    .from('academic_years')
    .delete()
    .match({ id });

  if (error) throw error;
  return true;
}

export async function setActiveAcademicYear(id: string, schoolId: string) {
  try {
    // First, set all academic years to inactive
    const { error: updateError } = await supabase
      .from('academic_years')
      .update({
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('school_id', schoolId);

    if (updateError) throw updateError;

    // Then, set the specified one as active with explicit school_id match
    const { data, error } = await supabase
      .from('academic_years')
      .update({
        is_active: true,
        updated_at: new Date().toISOString()
      })
      .match({ id, school_id: schoolId })
      .select(`
        id,
        name,
        start_date,
        end_date,
        is_active,
        is_archived,
        school_id,
        created_at,
        updated_at
      `)
      .single();

    if (error) throw error;
    return data as AcademicYear;
  } catch (error) {
    console.error('Error setting active academic year:', error);
    throw error;
  }
}

export async function archiveAcademicYear(id: string) {
  const { data, error } = await supabase
    .from('academic_years')
    .update({ is_archived: true, updated_at: new Date().toISOString() })
    .match({ id })
    .select(`
      id,
      name,
      start_date,
      end_date,
      is_active,
      is_archived,
      school_id,
      created_at,
      updated_at
    `)
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
