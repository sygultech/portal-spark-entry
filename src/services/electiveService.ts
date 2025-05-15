
import { supabase } from '@/integrations/supabase/client';
import { ElectiveGroup, ElectiveSubject } from '@/types/academic';

// Elective Groups
export async function fetchElectiveGroups(academicYearId?: string, courseId?: string) {
  let query = supabase.from('elective_groups').select('*');
  
  if (academicYearId) {
    query = query.eq('academic_year_id', academicYearId);
  }
  
  if (courseId) {
    query = query.eq('course_id', courseId);
  }
  
  const { data, error } = await query.order('name');

  if (error) throw error;
  return data as ElectiveGroup[];
}

export async function fetchElectiveGroup(id: string) {
  const { data, error } = await supabase
    .from('elective_groups')
    .select(`
      *,
      course:course_id (*)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function createElectiveGroup(group: Omit<ElectiveGroup, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('elective_groups')
    .insert(group)
    .select()
    .single();

  if (error) throw error;
  return data as ElectiveGroup;
}

export async function updateElectiveGroup(id: string, group: Partial<ElectiveGroup>) {
  const { data, error } = await supabase
    .from('elective_groups')
    .update(group)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as ElectiveGroup;
}

export async function deleteElectiveGroup(id: string) {
  const { error } = await supabase
    .from('elective_groups')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}

// Elective Subjects
export async function fetchElectiveSubjects(electiveGroupId: string) {
  const { data, error } = await supabase
    .from('elective_subjects')
    .select(`
      *,
      subject:subject_id (*),
      teacher:teacher_id (*)
    `)
    .eq('elective_group_id', electiveGroupId);

  if (error) throw error;
  return data;
}

export async function addSubjectToElectiveGroup(electiveSubject: Omit<ElectiveSubject, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('elective_subjects')
    .insert(electiveSubject)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateElectiveSubject(id: string, electiveSubject: Partial<ElectiveSubject>) {
  const { data, error } = await supabase
    .from('elective_subjects')
    .update(electiveSubject)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function removeSubjectFromElectiveGroup(id: string) {
  const { error } = await supabase
    .from('elective_subjects')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}
