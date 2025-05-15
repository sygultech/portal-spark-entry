
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

// Interface for batch student relationship
export interface BatchStudent {
  id: string;
  batch_id: string;
  student_id: string;
  created_at: string;
}

// Get students assigned to a batch
export const getStudentsByBatch = async (batchId: string) => {
  try {
    const { data, error } = await supabase.rpc('get_students_by_batch', {
      batch_id: batchId
    });

    if (error) {
      console.error('Error fetching students by batch:', error);
      toast({
        title: 'Error',
        description: `Could not fetch students: ${error.message}`,
        variant: 'destructive',
      });
      return [];
    }

    return data || [];
  } catch (error: any) {
    console.error('Exception in getStudentsByBatch:', error);
    toast({
      title: 'Error',
      description: `An unexpected error occurred: ${error.message}`,
      variant: 'destructive',
    });
    return [];
  }
};

// Assign students to a batch
export const assignStudentsToBatch = async (batchId: string, studentIds: string[]) => {
  try {
    // First create the batch_students table if it doesn't exist
    const { error: tableError } = await supabase.rpc('ensure_batch_students_table');
    
    if (tableError) {
      console.error('Error ensuring batch_students table:', tableError);
      throw new Error(`Table creation failed: ${tableError.message}`);
    }
    
    // Prepare batch insert data
    const batchAssignments = studentIds.map(studentId => ({
      batch_id: batchId,
      student_id: studentId
    }));
    
    const { data, error } = await supabase
      .from('batch_students')
      .upsert(batchAssignments, {
        onConflict: 'batch_id,student_id',
        ignoreDuplicates: true
      });

    if (error) {
      console.error('Error assigning students to batch:', error);
      toast({
        title: 'Error',
        description: `Failed to assign students: ${error.message}`,
        variant: 'destructive',
      });
      return false;
    }

    toast({
      title: 'Success',
      description: `Successfully assigned ${studentIds.length} students to the batch`,
    });
    return true;
  } catch (error: any) {
    console.error('Exception in assignStudentsToBatch:', error);
    toast({
      title: 'Error',
      description: `An unexpected error occurred: ${error.message}`,
      variant: 'destructive',
    });
    return false;
  }
};

// Remove a student from a batch
export const removeStudentFromBatch = async (batchId: string, studentId: string) => {
  try {
    const { error } = await supabase
      .from('batch_students')
      .delete()
      .eq('batch_id', batchId)
      .eq('student_id', studentId);

    if (error) {
      console.error('Error removing student from batch:', error);
      toast({
        title: 'Error',
        description: `Could not remove student: ${error.message}`,
        variant: 'destructive',
      });
      return false;
    }

    toast({
      title: 'Success',
      description: 'Student removed from batch',
    });
    return true;
  } catch (error: any) {
    console.error('Exception in removeStudentFromBatch:', error);
    toast({
      title: 'Error',
      description: `An unexpected error occurred: ${error.message}`,
      variant: 'destructive',
    });
    return false;
  }
};
