import { supabase } from '@/integrations/supabase/client';
import { Subject, SubjectCategory } from '@/types/academic';

// Subject Categories
export async function fetchSubjectCategories(schoolId: string) {
  const { data, error } = await supabase
    .from('subject_categories')
    .select('*')
    .eq('school_id', schoolId)
    .order('name');
  
  if (error) {
    console.error('Error fetching subject categories:', error);
    throw error;
  }
  
  return data || [];
}

export async function createSubjectCategory(category: Omit<SubjectCategory, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('subject_categories')
    .insert(category)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating subject category:', error);
    throw error;
  }
  
  return data;
}

export async function updateSubjectCategory(id: string, category: Partial<SubjectCategory>) {
  const { data, error } = await supabase
    .from('subject_categories')
    .update({
      ...category,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating subject category:', error);
    throw error;
  }
  
  return data;
}

export async function deleteSubjectCategory(id: string) {
  const { error } = await supabase
    .from('subject_categories')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting subject category:', error);
    throw error;
  }
  
  return true;
}

// Subjects
export async function fetchSubjects(schoolId: string, academicYearId?: string, categoryId?: string) {
  let query = supabase
    .from('subjects')
    .select(`
      *,
      category:subject_categories(id, name)
    `)
    .eq('school_id', schoolId);
  
  if (academicYearId) {
    query = query.eq('academic_year_id', academicYearId);
  }
  
  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }
  
  const { data, error } = await query.order('name');
  
  if (error) {
    console.error('Error fetching subjects:', error);
    throw error;
  }
  
  return data || [];
}

export async function fetchSubject(id: string) {
  const { data, error } = await supabase
    .from('subjects')
    .select(`
      *,
      category:subject_categories(id, name)
    `)
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching subject:', error);
    throw error;
  }
  
  return data;
}

export async function createSubject(subject: {
  name: string,
  code?: string,
  description?: string,
  category_id?: string,
  subject_type?: string,
  weightage?: number,
  academic_year_id: string,
  school_id: string
}) {
  const { data, error } = await supabase
    .from('subjects')
    .insert(subject)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating subject:', error);
    throw error;
  }
  
  return data;
}

export async function updateSubject(id: string, subject: Partial<Subject>) {
  // Remove category from update data if it exists
  if ('category' in subject) {
    delete (subject as any).category;
  }
  
  const { data, error } = await supabase
    .from('subjects')
    .update({
      ...subject,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating subject:', error);
    throw error;
  }
  
  return data;
}

export async function deleteSubject(id: string) {
  const { error } = await supabase
    .from('subjects')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting subject:', error);
    throw error;
  }
  
  return true;
}

// Subject Batch assignments
export async function fetchBatchSubjects(batchId: string) {
  const { data, error } = await supabase
    .from('batch_subjects')
    .select(`
      *,
      subject:subjects(*)
    `)
    .eq('batch_id', batchId);
  
  if (error) {
    console.error('Error fetching batch subjects:', error);
    throw error;
  }
  
  return data || [];
}

export async function assignSubjectToBatch(batchId: string, subjectId: string, isMandatory: boolean = true) {
  const { data, error } = await supabase
    .from('batch_subjects')
    .insert({
      batch_id: batchId,
      subject_id: subjectId,
      is_mandatory: isMandatory
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error assigning subject to batch:', error);
    throw error;
  }
  
  return data;
}

export async function removeSubjectFromBatch(id: string) {
  const { error } = await supabase
    .from('batch_subjects')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error removing subject from batch:', error);
    throw error;
  }
  
  return true;
}
