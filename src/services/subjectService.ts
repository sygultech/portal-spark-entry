
import { supabase } from '@/integrations/supabase/client';
import { Subject, SubjectCategory } from '@/types/academic';

// Subject Categories
export async function fetchSubjectCategories() {
  const { data, error } = await supabase
    .from('subject_categories')
    .select('*')
    .order('name');

  if (error) throw error;
  return data as SubjectCategory[];
}

export async function createSubjectCategory(category: Omit<SubjectCategory, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('subject_categories')
    .insert(category)
    .select()
    .single();

  if (error) throw error;
  return data as SubjectCategory;
}

export async function updateSubjectCategory(id: string, category: Partial<SubjectCategory>) {
  const { data, error } = await supabase
    .from('subject_categories')
    .update(category)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as SubjectCategory;
}

export async function deleteSubjectCategory(id: string) {
  const { error } = await supabase
    .from('subject_categories')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}

// Subjects
export async function fetchSubjects(academicYearId?: string, categoryId?: string) {
  let query = supabase.from('subjects').select(`
    *,
    category:category_id (*)
  `);
  
  if (academicYearId) {
    query = query.eq('academic_year_id', academicYearId);
  }
  
  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }
  
  const { data, error } = await query.order('name');

  if (error) throw error;
  return data;
}

export async function fetchSubject(id: string) {
  const { data, error } = await supabase
    .from('subjects')
    .select(`
      *,
      category:category_id (*)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function createSubject(subject: Omit<Subject, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('subjects')
    .insert(subject)
    .select()
    .single();

  if (error) throw error;
  return data as Subject;
}

export async function updateSubject(id: string, subject: Partial<Subject>) {
  const { data, error } = await supabase
    .from('subjects')
    .update(subject)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Subject;
}

export async function deleteSubject(id: string) {
  const { error } = await supabase
    .from('subjects')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}
