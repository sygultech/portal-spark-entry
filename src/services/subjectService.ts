
import { supabase } from '@/integrations/supabase/client';
import { Subject, SubjectCategory } from '@/types/academic';

// Subject Categories
export async function fetchSubjectCategories() {
  // This function is disabled as the table doesn't exist
  console.warn('fetchSubjectCategories is disabled - table does not exist');
  return [];
}

export async function createSubjectCategory(category: Omit<SubjectCategory, 'id' | 'created_at' | 'updated_at'>) {
  // This function is disabled as the table doesn't exist
  console.warn('createSubjectCategory is disabled - table does not exist');
  return {} as SubjectCategory;
}

export async function updateSubjectCategory(id: string, category: Partial<SubjectCategory>) {
  // This function is disabled as the table doesn't exist
  console.warn('updateSubjectCategory is disabled - table does not exist');
  return {} as SubjectCategory;
}

export async function deleteSubjectCategory(id: string) {
  // This function is disabled as the table doesn't exist
  console.warn('deleteSubjectCategory is disabled - table does not exist');
  return true;
}

// Subjects
export async function fetchSubjects(academicYearId?: string, categoryId?: string) {
  // This function is disabled as the table doesn't exist
  console.warn('fetchSubjects is disabled - table does not exist');
  return [];
}

export async function fetchSubject(id: string) {
  // This function is disabled as the table doesn't exist
  console.warn('fetchSubject is disabled - table does not exist');
  return {} as Subject;
}

export async function createSubject(subject: Omit<Subject, 'id' | 'created_at' | 'updated_at'>) {
  // This function is disabled as the table doesn't exist
  console.warn('createSubject is disabled - table does not exist');
  return {} as Subject;
}

export async function updateSubject(id: string, subject: Partial<Subject>) {
  // This function is disabled as the table doesn't exist
  console.warn('updateSubject is disabled - table does not exist');
  return {} as Subject;
}

export async function deleteSubject(id: string) {
  // This function is disabled as the table doesn't exist
  console.warn('deleteSubject is disabled - table does not exist');
  return true;
}
