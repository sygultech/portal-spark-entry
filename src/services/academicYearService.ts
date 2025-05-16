
import { supabase } from '@/integrations/supabase/client';
import { AcademicYear, CloneStructureOptions, CloneStructureResult } from '@/types/academic';

export async function fetchAcademicYears() {
  const { data, error } = await supabase
    .from('academic_years')
    .select('*')
    .order('start_date', { ascending: false });

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
  const { data, error } = await supabase
    .from('academic_years')
    .insert(academicYear)
    .select()
    .single();

  if (error) throw error;
  return data as AcademicYear;
}

export async function updateAcademicYear(id: string, academicYear: Partial<AcademicYear>) {
  const { data, error } = await supabase
    .from('academic_years')
    .update(academicYear)
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
  // First, set all academic years to inactive
  const { error: updateError } = await supabase
    .from('academic_years')
    .update({ is_active: false })
    .eq('school_id', schoolId);

  if (updateError) throw updateError;

  // Then, set the specified one as active
  const { data, error } = await supabase
    .from('academic_years')
    .update({ is_active: true })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as AcademicYear;
}

export async function archiveAcademicYear(id: string) {
  const { data, error } = await supabase
    .from('academic_years')
    .update({ is_archived: true })
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
