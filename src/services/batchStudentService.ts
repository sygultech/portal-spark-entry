
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

// Create batch_students table if it doesn't exist
export const ensureBatchStudentsTable = async () => {
  try {
    const { error } = await supabase.functions.invoke('ensure-tables', {
      body: { table: 'batch_students' }
    });
    
    if (error) {
      console.error('Error ensuring batch_students table:', error);
      return false;
    }
    
    return true;
  } catch (error: any) {
    console.error('Exception in ensureBatchStudentsTable:', error);
    return false;
  }
};

// Assign students to a batch
export const assignStudentsToBatch = async (batchId: string, studentIds: string[]) => {
  try {
    // First ensure the batch_students table exists
    const tableCreated = await ensureBatchStudentsTable();
    
    if (!tableCreated) {
      throw new Error('Failed to ensure batch_students table exists');
    }
    
    // Prepare batch insert data
    const batchAssignments = studentIds.map(studentId => ({
      batch_id: batchId,
      student_id: studentId
    }));
    
    // Create a custom table if it doesn't exist
    await supabase.functions.invoke('ensure-tables', {
      body: {
        table: 'batch_students',
        schema: `
          CREATE TABLE IF NOT EXISTS public.batch_students (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            batch_id UUID REFERENCES batches(id) NOT NULL,
            student_id UUID REFERENCES profiles(id) NOT NULL,
            created_at TIMESTAMPTZ DEFAULT now(),
            UNIQUE (batch_id, student_id)
          );
          
          ALTER TABLE public.batch_students ENABLE ROW LEVEL SECURITY;
          
          CREATE POLICY "School admins can view batch students" 
          ON public.batch_students FOR SELECT 
          TO authenticated
          USING (
            EXISTS (
              SELECT 1 FROM public.batches 
              WHERE public.batches.id = public.batch_students.batch_id 
              AND public.batches.school_id = (SELECT school_id FROM profiles WHERE id = auth.uid())
            )
          );
          
          CREATE POLICY "School admins can insert batch students" 
          ON public.batch_students FOR INSERT 
          TO authenticated
          WITH CHECK (
            EXISTS (
              SELECT 1 FROM public.batches 
              WHERE public.batches.id = public.batch_students.batch_id 
              AND public.batches.school_id = (SELECT school_id FROM profiles WHERE id = auth.uid())
            )
          );
          
          CREATE POLICY "School admins can delete batch students" 
          ON public.batch_students FOR DELETE 
          TO authenticated
          USING (
            EXISTS (
              SELECT 1 FROM public.batches 
              WHERE public.batches.id = public.batch_students.batch_id 
              AND public.batches.school_id = (SELECT school_id FROM profiles WHERE id = auth.uid())
            )
          );
        `
      }
    });
    
    // Now insert the batch assignments using a custom function
    for (const assignment of batchAssignments) {
      // Use functions.invoke instead of direct table operations
      const { error } = await supabase.functions.invoke('ensure-tables', {
        body: {
          operation: 'insert',
          table: 'batch_students',
          data: assignment
        }
      });
        
      if (error) {
        console.error('Error assigning student to batch:', error);
      }
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
    // Using functions.invoke instead of direct table access for type safety
    const { error } = await supabase.functions.invoke('ensure-tables', {
      body: {
        operation: 'delete',
        table: 'batch_students',
        conditions: {
          batch_id: batchId,
          student_id: studentId
        }
      }
    });

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
