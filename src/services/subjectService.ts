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
export async function fetchSubjects(schoolId: string, academicYearId?: string, categoryId?: string, includeArchived: boolean = false) {
  let query = supabase
    .from('subjects')
    .select(`
      *,
      category:subject_categories(id, name),
      batch_assignments:batch_subjects(
        id,
        batch_id,
        is_mandatory
      )
    `)
    .eq('school_id', schoolId);
  
  if (!includeArchived) {
    query = query.is('is_archived', false);
  }
  
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

export interface SubjectDependencies {
  batchAssignments: number;
  batches: Array<{
    id: string;
    name: string;
    course_name: string;
  }>;
  teacherAssignments: number;
  timeSlots: number;
}

export async function getSubjectDependencies(subjectId: string): Promise<SubjectDependencies> {
  // Get batch assignments with batch and course details
  const { data: batchData, error: batchError } = await supabase
    .from('batch_subjects')
    .select(`
      batch_id,
      batches (
        id,
        name,
        courses (
          name
        )
      )
    `)
    .eq('subject_id', subjectId);

  if (batchError) throw batchError;

  // Check teacher assignments
  const { count: teacherCount, error: teacherError } = await supabase
    .from('subject_teachers')
    .select('*', { count: 'exact', head: true })
    .eq('subject_id', subjectId);

  if (teacherError) throw teacherError;

  // Check time slots through subject_teachers
  const { count: timeSlotCount, error: timeSlotError } = await supabase
    .from('subject_time_slots')
    .select('subject_teachers!inner(*)', { count: 'exact', head: true })
    .eq('subject_teachers.subject_id', subjectId);

  if (timeSlotError) throw timeSlotError;

  // Format batch data
  const batches = batchData?.map(assignment => ({
    id: assignment.batches.id,
    name: assignment.batches.name,
    course_name: assignment.batches.courses.name
  })) || [];

  return {
    batchAssignments: batches.length,
    batches,
    teacherAssignments: teacherCount || 0,
    timeSlots: timeSlotCount || 0
  };
}

export async function archiveSubject(id: string) {
  const { error } = await supabase
    .from('subjects')
    .update({
      is_archived: true,
      archived_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    } as Partial<Subject>)
    .eq('id', id);
  
  if (error) throw error;
}

export async function deleteSubject(id: string) {
  // First remove all dependencies
  const { error: batchError } = await supabase
    .from('batch_subjects')
    .delete()
    .eq('subject_id', id);
  
  if (batchError) throw batchError;

  // Remove teacher assignments (this will cascade delete time slots)
  const { error: teacherError } = await supabase
    .from('subject_teachers')
    .delete()
    .eq('subject_id', id);
  
  if (teacherError) throw teacherError;

  // Finally delete the subject
  const { error } = await supabase
    .from('subjects')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
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
