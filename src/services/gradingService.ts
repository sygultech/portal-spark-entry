
import { supabase } from '@/integrations/supabase/client';
import { GradingSystem, GradeScale } from '@/types/academic';

// Grading Systems
export async function fetchGradingSystems(academicYearId?: string) {
  let query = supabase.from('grading_systems').select('*');
  
  if (academicYearId) {
    query = query.eq('academic_year_id', academicYearId);
  }
  
  const { data, error } = await query.order('name');

  if (error) throw error;
  return data as GradingSystem[];
}

export async function fetchGradingSystem(id: string) {
  const { data, error } = await supabase
    .from('grading_systems')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as GradingSystem;
}

export async function createGradingSystem(system: Omit<GradingSystem, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('grading_systems')
    .insert(system)
    .select()
    .single();

  if (error) throw error;
  return data as GradingSystem;
}

export async function updateGradingSystem(id: string, system: Partial<GradingSystem>) {
  const { data, error } = await supabase
    .from('grading_systems')
    .update(system)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as GradingSystem;
}

export async function deleteGradingSystem(id: string) {
  const { error } = await supabase
    .from('grading_systems')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}

// Grade Scales
export async function fetchGradeScales(gradingSystemId: string) {
  const { data, error } = await supabase
    .from('grade_scales')
    .select('*')
    .eq('grading_system_id', gradingSystemId)
    .order('min_marks', { ascending: false });

  if (error) throw error;
  return data as GradeScale[];
}

export async function createGradeScale(scale: Omit<GradeScale, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('grade_scales')
    .insert(scale)
    .select()
    .single();

  if (error) throw error;
  return data as GradeScale;
}

export async function updateGradeScale(id: string, scale: Partial<GradeScale>) {
  const { data, error } = await supabase
    .from('grade_scales')
    .update(scale)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as GradeScale;
}

export async function deleteGradeScale(id: string) {
  const { error } = await supabase
    .from('grade_scales')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}
