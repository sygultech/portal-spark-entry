
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface StudentPromotion {
  id: string;
  from_academic_year_id: string;
  to_academic_year_id: string;
  from_batch_id: string;
  to_batch_id: string;
  school_id: string;
  status: string;
  promoted_by: string;
  created_at: string;
  updated_at: string;
  promotion_date: string;
}

export interface StudentPromotionDetail {
  id: string;
  promotion_id: string;
  student_id: string;
  status: string;
  remarks: string | null;
  created_at: string;
  updated_at: string;
}

// Get all student promotions for the school
export const getStudentPromotions = async () => {
  try {
    const { data, error } = await supabase
      .from('student_promotions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching student promotions:', error);
      toast({
        title: 'Error',
        description: `Could not fetch student promotions: ${error.message}`,
        variant: 'destructive',
      });
      return [];
    }

    return data || [];
  } catch (error: any) {
    console.error('Exception in getStudentPromotions:', error);
    toast({
      title: 'Error',
      description: `An unexpected error occurred: ${error.message}`,
      variant: 'destructive',
    });
    return [];
  }
};

// Get details of a specific promotion
export const getStudentPromotionDetails = async (promotionId: string) => {
  try {
    const { data, error } = await supabase
      .from('student_promotion_details')
      .select(`
        *,
        student:profiles(id, email, first_name, last_name)
      `)
      .eq('promotion_id', promotionId);

    if (error) {
      console.error('Error fetching student promotion details:', error);
      toast({
        title: 'Error',
        description: `Could not fetch promotion details: ${error.message}`,
        variant: 'destructive',
      });
      return [];
    }

    return data || [];
  } catch (error: any) {
    console.error('Exception in getStudentPromotionDetails:', error);
    toast({
      title: 'Error',
      description: `An unexpected error occurred: ${error.message}`,
      variant: 'destructive',
    });
    return [];
  }
};

// Promote students from one batch to another
export const promoteStudents = async (
  fromBatchId: string,
  toBatchId: string,
  fromAcademicYearId: string,
  toAcademicYearId: string,
  studentIds: string[],
  remarks?: string
) => {
  try {
    const { data, error } = await supabase.rpc('promote_students', {
      p_from_batch_id: fromBatchId,
      p_to_batch_id: toBatchId,
      p_from_academic_year_id: fromAcademicYearId,
      p_to_academic_year_id: toAcademicYearId,
      p_student_ids: studentIds,
      p_remarks: remarks || null
    });

    if (error) {
      console.error('Error promoting students:', error);
      toast({
        title: 'Error',
        description: `Failed to promote students: ${error.message}`,
        variant: 'destructive',
      });
      return null;
    }

    toast({
      title: 'Success',
      description: `Successfully promoted ${studentIds.length} students`,
    });
    return data;
  } catch (error: any) {
    console.error('Exception in promoteStudents:', error);
    toast({
      title: 'Error',
      description: `An unexpected error occurred: ${error.message}`,
      variant: 'destructive',
    });
    return null;
  }
};

// Update a student's promotion status
export const updateStudentPromotionStatus = async (
  promotionDetailId: string,
  status: string,
  remarks?: string
) => {
  try {
    const { data, error } = await supabase
      .from('student_promotion_details')
      .update({
        status,
        remarks: remarks || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', promotionDetailId);

    if (error) {
      console.error('Error updating student promotion status:', error);
      toast({
        title: 'Error',
        description: `Could not update status: ${error.message}`,
        variant: 'destructive',
      });
      return false;
    }

    toast({
      title: 'Success',
      description: 'Student promotion status updated',
    });
    return true;
  } catch (error: any) {
    console.error('Exception in updateStudentPromotionStatus:', error);
    toast({
      title: 'Error',
      description: `An unexpected error occurred: ${error.message}`,
      variant: 'destructive',
    });
    return false;
  }
};
