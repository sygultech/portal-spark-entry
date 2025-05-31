import { supabase } from '@/integrations/supabase/client';
import { Guardian } from '@/types/student';
import { toast } from '@/hooks/use-toast';

interface GuardianResponse {
  guardians: {
    id: string;
    first_name: string;
    last_name: string;
    relation: string;
    occupation: string;
    email: string;
    phone: string;
    address: string;
    is_emergency_contact: boolean;
    can_pickup: boolean;
    school_id: string;
  };
  is_primary: boolean;
}

// Fetch guardians for a student
export const fetchStudentGuardians = async (studentId: string): Promise<Guardian[]> => {
  try {
    const { data, error } = await supabase
      .from('student_guardians')
      .select(`
        guardians (
          id,
          first_name,
          last_name,
          relation,
          occupation,
          email,
          phone,
          address,
          is_emergency_contact,
          can_pickup,
          school_id
        ),
        is_primary
      `)
      .eq('student_id', studentId);

    if (error) throw error;

    const typedData = data as unknown as GuardianResponse[];
    return typedData.map(item => ({
      id: item.guardians.id,
      first_name: item.guardians.first_name,
      last_name: item.guardians.last_name,
      relation: item.guardians.relation,
      occupation: item.guardians.occupation,
      email: item.guardians.email,
      phone: item.guardians.phone,
      address: item.guardians.address,
      is_emergency_contact: item.guardians.is_emergency_contact,
      can_pickup: item.guardians.can_pickup,
      school_id: item.guardians.school_id,
      is_primary: item.is_primary
    }));
  } catch (error) {
    console.error('Error fetching student guardians:', error);
    throw error;
  }
};

// Add guardian to student
export const addGuardianToStudent = async (
  studentId: string,
  guardianData: Omit<Guardian, 'id' | 'school_id'> & { is_primary?: boolean },
  schoolId: string
): Promise<boolean> => {
  try {
    // Create guardian
    const { data: guardian, error: guardianError } = await supabase
      .from('guardians')
      .insert({
        first_name: guardianData.first_name,
        last_name: guardianData.last_name,
        relation: guardianData.relation,
        occupation: guardianData.occupation,
        email: guardianData.email,
        phone: guardianData.phone,
        address: guardianData.address,
        is_emergency_contact: guardianData.is_emergency_contact,
        can_pickup: guardianData.can_pickup,
        school_id: schoolId
      })
      .select('id')
      .single();

    if (guardianError) throw guardianError;

    // If this guardian is primary, unset any existing primary guardians
    if (guardianData.is_primary) {
      const { error: updateError } = await supabase
        .from('student_guardians')
        .update({ is_primary: false })
        .eq('student_id', studentId);

      if (updateError) throw updateError;
    }

    // Link guardian to student
    const { error: linkError } = await supabase
      .from('student_guardians')
      .insert({
        student_id: studentId,
        guardian_id: guardian.id,
        is_primary: guardianData.is_primary || false
      });

    if (linkError) throw linkError;

    // Create notification preferences for the guardian
    const { error: notificationError } = await supabase
      .from('guardian_notification_preferences')
      .insert({
        guardian_id: guardian.id,
        email_notifications: true,
        sms_notifications: true,
        push_notifications: true,
        notification_types: ['attendance', 'grades', 'announcements']
      });

    if (notificationError) {
      console.error('Error creating notification preferences:', notificationError);
      // Don't throw error here as it's not critical
    }

    return true;
  } catch (error) {
    console.error('Error adding guardian:', error);
    throw error;
  }
};

// Update guardian
export const updateGuardian = async (
  guardianId: string,
  guardianData: Partial<Guardian>
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('guardians')
      .update({
        first_name: guardianData.first_name,
        last_name: guardianData.last_name,
        relation: guardianData.relation,
        occupation: guardianData.occupation,
        email: guardianData.email,
        phone: guardianData.phone,
        address: guardianData.address,
        is_emergency_contact: guardianData.is_emergency_contact,
        can_pickup: guardianData.can_pickup
      })
      .eq('id', guardianId);

    if (error) throw error;

    // Update primary status if needed
    if (guardianData.is_primary !== undefined) {
      // If setting as primary, unset other primary guardians
      if (guardianData.is_primary) {
        const { data: studentGuardian } = await supabase
          .from('student_guardians')
          .select('student_id')
          .eq('guardian_id', guardianId)
          .single();

        if (studentGuardian) {
          const { error: updateError } = await supabase
            .from('student_guardians')
            .update({ is_primary: false })
            .eq('student_id', studentGuardian.student_id)
            .neq('guardian_id', guardianId);

          if (updateError) throw updateError;
        }
      }

      // Update this guardian's primary status
      const { error: relationError } = await supabase
        .from('student_guardians')
        .update({ is_primary: guardianData.is_primary })
        .eq('guardian_id', guardianId);

      if (relationError) throw relationError;
    }

    return true;
  } catch (error) {
    console.error('Error updating guardian:', error);
    throw error;
  }
};

// Remove guardian from student
export const removeGuardianFromStudent = async (
  studentId: string,
  guardianId: string
): Promise<boolean> => {
  try {
    // Check if this is the primary guardian
    const { data: guardianData } = await supabase
      .from('student_guardians')
      .select('is_primary')
      .eq('student_id', studentId)
      .eq('guardian_id', guardianId)
      .single();

    // Remove the guardian-student relationship
    const { error: removeError } = await supabase
      .from('student_guardians')
      .delete()
      .eq('student_id', studentId)
      .eq('guardian_id', guardianId);

    if (removeError) throw removeError;

    // If this was the primary guardian, set another guardian as primary
    if (guardianData?.is_primary) {
      const { data: remainingGuardians } = await supabase
        .from('student_guardians')
        .select('guardian_id')
        .eq('student_id', studentId)
        .limit(1);

      if (remainingGuardians && remainingGuardians.length > 0) {
        const { error: updateError } = await supabase
          .from('student_guardians')
          .update({ is_primary: true })
          .eq('student_id', studentId)
          .eq('guardian_id', remainingGuardians[0].guardian_id);

        if (updateError) throw updateError;
      }
    }

    return true;
  } catch (error) {
    console.error('Error removing guardian:', error);
    throw error;
  }
};

// Update guardian notification preferences
export const updateGuardianNotificationPreferences = async (
  guardianId: string,
  preferences: {
    email_notifications?: boolean;
    sms_notifications?: boolean;
    push_notifications?: boolean;
    notification_types?: string[];
  }
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('guardian_notification_preferences')
      .update(preferences)
      .eq('guardian_id', guardianId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    throw error;
  }
}; 