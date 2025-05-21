
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Course } from '@/types/academic';

export async function fetchCourses(schoolId: string, academicYearId?: string) {
  try {
    let query = supabase
      .from('courses')
      .select(`
        *,
        department:departments(id, name)
      `)
      .eq('school_id', schoolId);

    if (academicYearId) {
      query = query.eq('academic_year_id', academicYearId);
    }

    const { data, error } = await query.order('name');

    if (error) {
      throw error;
    }

    return data as (Course & { department: { id: string; name: string } | null })[];
  } catch (error: any) {
    console.error('Error fetching courses:', error.message);
    throw error;
  }
}

export async function createCourse(course: Omit<Course, 'id' | 'created_at' | 'updated_at'>) {
  try {
    const { data, error } = await supabase
      .from('courses')
      .insert(course)
      .select()
      .single();

    if (error) {
      throw error;
    }

    toast({
      title: 'Course created',
      description: `Course ${course.name} was successfully created.`
    });

    return data as Course;
  } catch (error: any) {
    console.error('Error creating course:', error.message);
    toast({
      title: 'Error creating course',
      description: error.message,
      variant: 'destructive'
    });
    throw error;
  }
}

export async function updateCourse(course: Partial<Course> & { id: string }) {
  try {
    const { data, error } = await supabase
      .from('courses')
      .update(course)
      .eq('id', course.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    toast({
      title: 'Course updated',
      description: `Course was successfully updated.`
    });

    return data as Course;
  } catch (error: any) {
    console.error('Error updating course:', error.message);
    toast({
      title: 'Error updating course',
      description: error.message,
      variant: 'destructive'
    });
    throw error;
  }
}

export async function deleteCourse(id: string) {
  try {
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    toast({
      title: 'Course deleted',
      description: 'Course was successfully deleted.'
    });

    return true;
  } catch (error: any) {
    console.error('Error deleting course:', error.message);
    toast({
      title: 'Error deleting course',
      description: error.message,
      variant: 'destructive'
    });
    throw error;
  }
}

// force update
