import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Batch, BatchStudent } from '@/types/academic';

export async function fetchBatches(schoolId: string, academicYearId?: string, courseId?: string) {
  try {
    console.log('fetchBatches called with:', { schoolId, academicYearId, courseId });
    
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
      console.error('Error in fetchBatches query:', error);
      throw error;
    }

    console.log('fetchBatches result:', { count: data?.length || 0, data: data?.slice(0, 2) });

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
        student:student_details(id, first_name, last_name, email, admission_number)
      `)
      .eq('batch_id', batchId)
      .eq('is_current', true)
      .eq('status', 'active')
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
        admission_number: string;
      };
    })[];
  } catch (error: any) {
    console.error('Error fetching batch students:', error.message);
    throw error;
  }
}

export async function addStudentToBatch(batchId: string, studentId: string, rollNumber?: string) {
  try {
    const { data, error } = await supabase.rpc('enroll_student_in_batch', {
      p_student_id: studentId,
      p_batch_id: batchId,
      p_enrollment_type: 'new_admission',
      p_roll_number: rollNumber || null
    });

    if (error) {
      throw error;
    }

    return data;
  } catch (error: any) {
    console.error('Error adding student to batch:', error.message);
    
    if (error.message?.includes('already enrolled')) {
      toast({
        title: 'Already Enrolled',
        description: 'This student is already enrolled in a batch.',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Error',
        description: 'Failed to add student to batch. Please try again.',
        variant: 'destructive',
      });
    }
    
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

export async function fetchBatchesWithStudentCount(schoolId: string, academicYearId?: string, courseId?: string) {
  try {
    console.log('fetchBatchesWithStudentCount called with:', { schoolId, academicYearId, courseId });
    
    // First get all batches
    let batchQuery = supabase
      .from('batches')
      .select(`
        id,
        name,
        code
      `)
      .eq('school_id', schoolId)
      .eq('is_archived', false);

    if (academicYearId) {
      batchQuery = batchQuery.eq('academic_year_id', academicYearId);
    }

    if (courseId) {
      batchQuery = batchQuery.eq('course_id', courseId);
    }

    const { data: batches, error: batchError } = await batchQuery.order('name');

    if (batchError) {
      console.error('Error in fetchBatchesWithStudentCount query:', batchError);
      throw batchError;
    }

    if (!batches || batches.length === 0) {
      return [];
    }

    // Get student counts for each batch
    const batchIds = batches.map(b => b.id);
    const { data: studentCounts, error: countError } = await supabase
      .from('batch_students')
      .select('batch_id')
      .in('batch_id', batchIds)
      .eq('is_current', true)
      .eq('status', 'active');

    if (countError) {
      console.error('Error fetching student counts:', countError);
      // Continue without counts if there's an error
    }

    // Create a count map
    const countMap = new Map<string, number>();
    if (studentCounts) {
      studentCounts.forEach(record => {
        const current = countMap.get(record.batch_id) || 0;
        countMap.set(record.batch_id, current + 1);
      });
    }

    console.log('fetchBatchesWithStudentCount result:', { count: batches?.length || 0 });

    return batches.map(batch => ({
      id: batch.id,
      name: batch.name,
      studentCount: countMap.get(batch.id) || 0
    }));
  } catch (error: any) {
    console.error('Error fetching batches with student count:', error.message);
    throw error;
  }
}
