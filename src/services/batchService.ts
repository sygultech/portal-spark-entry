
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Batch, BatchStudent } from '@/types/academic';

export async function fetchBatches(schoolId: string, academicYearId?: string, courseId?: string) {
  try {
    let query = supabase
      .from('batches')
      .select(`
        *,
        course:courses(id, name),
        class_teacher:profiles(id, first_name, last_name)
      `)
      .eq('school_id', schoolId);

    if (academicYearId) {
      query = query.eq('academic_year_id', academicYearId);
    }

    if (courseId) {
      query = query.eq('course_id', courseId);
    }

    const { data, error } = await query.order('name');

    if (error) {
      throw error;
    }

    return data as (Batch & { 
      course: { id: string; name: string },
      class_teacher: { id: string; first_name: string; last_name: string } | null
    })[];
  } catch (error: any) {
    console.error('Error fetching batches:', error.message);
    throw error;
  }
}

export async function createBatch(batch: Omit<Batch, 'id' | 'created_at' | 'updated_at'>) {
  try {
    const { data, error } = await supabase
      .from('batches')
      .insert(batch)
      .select()
      .single();

    if (error) {
      throw error;
    }

    toast({
      title: 'Batch created',
      description: `Batch ${batch.name} was successfully created.`
    });

    return data as Batch;
  } catch (error: any) {
    console.error('Error creating batch:', error.message);
    toast({
      title: 'Error creating batch',
      description: error.message,
      variant: 'destructive'
    });
    throw error;
  }
}

export async function updateBatch(batch: Partial<Batch> & { id: string }) {
  try {
    const { data, error } = await supabase
      .from('batches')
      .update(batch)
      .eq('id', batch.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    toast({
      title: 'Batch updated',
      description: `Batch was successfully updated.`
    });

    return data as Batch;
  } catch (error: any) {
    console.error('Error updating batch:', error.message);
    toast({
      title: 'Error updating batch',
      description: error.message,
      variant: 'destructive'
    });
    throw error;
  }
}

export async function deleteBatch(id: string) {
  try {
    const { error } = await supabase
      .from('batches')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    toast({
      title: 'Batch deleted',
      description: 'Batch was successfully deleted.'
    });

    return true;
  } catch (error: any) {
    console.error('Error deleting batch:', error.message);
    toast({
      title: 'Error deleting batch',
      description: error.message,
      variant: 'destructive'
    });
    throw error;
  }
}

export async function toggleBatchArchiveStatus(batchId: string, isArchived: boolean) {
  try {
    const { data, error } = await supabase
      .from('batches')
      .update({ is_archived: isArchived })
      .eq('id', batchId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    toast({
      title: isArchived ? 'Batch archived' : 'Batch unarchived',
      description: `Batch was successfully ${isArchived ? 'archived' : 'unarchived'}.`
    });

    return data as Batch;
  } catch (error: any) {
    console.error('Error toggling batch archive status:', error.message);
    toast({
      title: `Error ${isArchived ? 'archiving' : 'unarchiving'} batch`,
      description: error.message,
      variant: 'destructive'
    });
    throw error;
  }
}

export async function fetchBatchStudents(batchId: string) {
  try {
    const { data, error } = await supabase
      .from('batch_students')
      .select(`
        *,
        student:profiles(id, first_name, last_name, email)
      `)
      .eq('batch_id', batchId)
      .order('created_at');

    if (error) {
      throw error;
    }

    return data as (BatchStudent & {
      student: {
        id: string;
        first_name: string | null;
        last_name: string | null;
        email: string;
      };
    })[];
  } catch (error: any) {
    console.error('Error fetching batch students:', error.message);
    throw error;
  }
}

export async function addStudentToBatch(batchId: string, studentId: string, rollNumber?: string) {
  try {
    const { data, error } = await supabase
      .from('batch_students')
      .insert({
        batch_id: batchId,
        student_id: studentId,
        roll_number: rollNumber || null
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    toast({
      title: 'Student added',
      description: 'Student was successfully added to the batch.'
    });

    return data as BatchStudent;
  } catch (error: any) {
    console.error('Error adding student to batch:', error.message);
    toast({
      title: 'Error adding student',
      description: error.message,
      variant: 'destructive'
    });
    throw error;
  }
}

export async function removeStudentFromBatch(batchStudentId: string) {
  try {
    const { error } = await supabase
      .from('batch_students')
      .delete()
      .eq('id', batchStudentId);

    if (error) {
      throw error;
    }

    toast({
      title: 'Student removed',
      description: 'Student was successfully removed from the batch.'
    });

    return true;
  } catch (error: any) {
    console.error('Error removing student from batch:', error.message);
    toast({
      title: 'Error removing student',
      description: error.message,
      variant: 'destructive'
    });
    throw error;
  }
}

export async function ensureBatchStudentsTable(operation?: 'insert' | 'delete', data?: any, conditions?: any) {
  try {
    await supabase.functions.invoke('ensure-tables', {
      body: { 
        table: 'batch_students',
        operation,
        data,
        conditions
      }
    });
    return true;
  } catch (error: any) {
    console.error('Error ensuring batch_students table:', error.message);
    return false;
  }
}
