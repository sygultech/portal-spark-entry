
import { supabase } from '@/integrations/supabase/client';
import { Batch } from '@/types/academic';

export async function fetchBatches(courseId?: string, academicYearId?: string) {
  let query = supabase.from('batches').select('*');
  
  if (courseId) {
    query = query.eq('course_id', courseId);
  }
  
  if (academicYearId) {
    query = query.eq('academic_year_id', academicYearId);
  }
  
  const { data, error } = await query.order('name');

  if (error) throw error;
  return data as Batch[];
}

export async function fetchBatch(id: string) {
  const { data, error } = await supabase
    .from('batches')
    .select(`
      *,
      course:course_id (*),
      class_teacher:class_teacher_id (*)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function createBatch(batch: Omit<Batch, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('batches')
    .insert(batch)
    .select()
    .single();

  if (error) throw error;
  return data as Batch;
}

export async function updateBatch(id: string, batch: Partial<Batch>) {
  const { data, error } = await supabase
    .from('batches')
    .update(batch)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Batch;
}

export async function deleteBatch(id: string) {
  const { error } = await supabase
    .from('batches')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}

export async function archiveBatch(id: string) {
  const { data, error } = await supabase
    .from('batches')
    .update({ is_archived: true, is_active: false })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Batch;
}

export async function assignSubjectToBatch(batchId: string, subjectId: string, teacherId?: string) {
  const { data, error } = await supabase
    .from('batch_subjects')
    .insert({ 
      batch_id: batchId, 
      subject_id: subjectId,
      teacher_id: teacherId || null 
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateBatchSubjectTeacher(batchId: string, subjectId: string, teacherId: string) {
  const { data, error } = await supabase
    .from('batch_subjects')
    .update({ teacher_id: teacherId })
    .eq('batch_id', batchId)
    .eq('subject_id', subjectId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function removeSubjectFromBatch(batchId: string, subjectId: string) {
  const { error } = await supabase
    .from('batch_subjects')
    .delete()
    .eq('batch_id', batchId)
    .eq('subject_id', subjectId);

  if (error) throw error;
  return true;
}

export async function fetchBatchSubjects(batchId: string) {
  const { data, error } = await supabase
    .from('batch_subjects')
    .select(`
      *,
      subject:subject_id (*),
      teacher:teacher_id (*)
    `)
    .eq('batch_id', batchId);

  if (error) throw error;
  return data;
}
