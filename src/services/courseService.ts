
import { supabase } from '@/integrations/supabase/client';
import { Course } from '@/types/academic';

export async function fetchCourses(academicYearId?: string) {
  let query = supabase.from('courses')
    .select('*, school:schools(*)'); // Change to "schools" for explicit join to avoid ambiguity
  
  if (academicYearId) {
    query = query.eq('academic_year_id', academicYearId);
  }
  
  const { data, error } = await query.order('name');

  if (error) throw error;
  return data as Course[];
}

export async function fetchCourse(id: string) {
  const { data, error } = await supabase
    .from('courses')
    .select('*, school:schools(*)')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Course;
}

export async function createCourse(course: Omit<Course, 'id' | 'created_at' | 'updated_at'>) {
  // Add proper error handling and logging to trace what's being sent
  try {
    console.log("Creating course with data:", course);
    
    // Explicitly structure the data to avoid any ambiguity
    const courseData = {
      name: course.name,
      description: course.description,
      school_id: course.school_id,
      academic_year_id: course.academic_year_id
    };
    
    const { data, error } = await supabase
      .from('courses')
      .insert(courseData)
      .select('*, school:schools(*)')
      .single();

    if (error) {
      console.error("Error creating course:", error);
      throw error;
    }
    
    console.log("Course created successfully:", data);
    return data as Course;
  } catch (error) {
    console.error("Exception in createCourse:", error);
    throw error;
  }
}

export async function updateCourse(id: string, course: Partial<Course>) {
  const { data, error } = await supabase
    .from('courses')
    .update(course)
    .eq('id', id)
    .select('*, school:schools(*)')
    .single();

  if (error) throw error;
  return data as Course;
}

export async function deleteCourse(id: string) {
  const { error } = await supabase
    .from('courses')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}

export async function assignSubjectToCourse(courseId: string, subjectId: string) {
  const { data, error } = await supabase
    .from('course_subjects')
    .insert({ course_id: courseId, subject_id: subjectId })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function removeSubjectFromCourse(courseId: string, subjectId: string) {
  const { error } = await supabase
    .from('course_subjects')
    .delete()
    .eq('course_id', courseId)
    .eq('subject_id', subjectId);

  if (error) throw error;
  return true;
}

export async function fetchCourseSubjects(courseId: string) {
  const { data, error } = await supabase
    .from('course_subjects')
    .select(`
      *,
      subject:subjects (*)
    `)
    .eq('course_id', courseId);

  if (error) throw error;
  return data;
}
