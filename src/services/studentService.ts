import { supabase } from '@/integrations/supabase/client';
import { 
  Student, 
  NewStudentFormData, 
  StudentWithDetails, 
  Guardian, 
  StudentCategory, 
  StudentDocument, 
  DisciplinaryRecord, 
  TransferRecord, 
  Certificate, 
  MedicalRecord,
  DocumentVerificationStatus,
  IncidentSeverity,
  IncidentStatus,
  TransferType,
  TransferStatus,
  CertificateStatus,
  DocumentType
} from '@/types/student';
import { toast } from '@/hooks/use-toast';

// Base query for fetching student profiles with details
const studentQuery = `
  id,
  email,
  first_name,
  last_name,
  avatar_url,
  roles,
  school_id,
  created_at,
  updated_at,
  student_details!inner (
    admission_number,
    date_of_birth,
    gender,
    address,
    nationality,
    mother_tongue,
    blood_group,
    religion,
    caste,
    category,
    phone,
    previous_school_name,
    previous_school_board,
    previous_school_year,
    previous_school_percentage,
    tc_number,
    admission_date,
    status
  )
`;

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

interface CategoryResponse {
  category: {
    id: string;
    name: string;
    description: string;
    color: string;
    school_id: string;
  };
}

interface BatchResponse {
  batches: {
    name: string;
    course: {
      name: string;
    };
    academic_year: {
      name: string;
    };
  };
}

// Transforms the database response to our Student type
const transformStudent = (data: any, batchInfo?: any): Student => {
  if (!data) return null;
  
  // Handle both data structures:
  // 1. From profiles table with nested student_details
  // 2. Direct student_details table data
  const isProfileData = data.student_details !== undefined;
  const studentDetails = isProfileData ? data.student_details : data;
  
  return {
    id: data.id,
    first_name: isProfileData ? data.first_name : studentDetails.first_name,
    last_name: isProfileData ? data.last_name : studentDetails.last_name,
    email: isProfileData ? data.email : studentDetails.email,
    avatar_url: isProfileData ? data.avatar_url : studentDetails.avatar_url,
    school_id: isProfileData ? data.school_id : studentDetails.school_id,
    created_at: isProfileData ? data.created_at : studentDetails.created_at,
    updated_at: isProfileData ? data.updated_at : studentDetails.updated_at,
    admission_number: studentDetails.admission_number,
    date_of_birth: studentDetails.date_of_birth,
    gender: studentDetails.gender,
    address: studentDetails.address,
    // batch information from batch_students table
    batch_id: batchInfo?.batch_id || undefined,
    batch_name: batchInfo?.batch_name || undefined,
    course_name: batchInfo?.course_name || undefined,
    academic_year: batchInfo?.academic_year || undefined,
    nationality: studentDetails.nationality,
    mother_tongue: studentDetails.mother_tongue,
    blood_group: studentDetails.blood_group,
    religion: studentDetails.religion,
    caste: studentDetails.caste,
    category: studentDetails.category,
    phone: studentDetails.phone,
    previous_school_name: studentDetails.previous_school_name,
    previous_school_board: studentDetails.previous_school_board,
    previous_school_year: studentDetails.previous_school_year,
    previous_school_percentage: studentDetails.previous_school_percentage,
    tc_number: studentDetails.tc_number,
    admission_date: studentDetails.admission_date,
    status: studentDetails.status || 'active'
  };
};

// Generate a unique admission number
export const generateAdmissionNumber = async (schoolId: string): Promise<string> => {
  try {
    const { data, error } = await supabase.rpc('generate_admission_number', {
      p_school_id: schoolId
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error generating admission number:', error);
    return '';
  }
};

// Fetch all students for a school with batch information
export const fetchStudents = async (schoolId: string): Promise<Student[]> => {
  try {
    // First fetch basic student data
    const { data: studentsData, error: studentsError } = await supabase
      .from('profiles')
      .select(studentQuery)
      .eq('school_id', schoolId)
      .contains('roles', ['student']);

    if (studentsError) throw studentsError;

    if (!studentsData || studentsData.length === 0) return [];

    // Get student IDs for batch lookup
    const studentIds = studentsData.map(student => student.id);

    // Fetch current batch information for all students
    const { data: batchData, error: batchError } = await supabase
      .from('batch_students')
      .select(`
        student_id,
        batch_id,
        roll_number,
        batches!inner (
          id,
          name,
          course:course_id (
            name
          ),
          academic_year:academic_year_id (
            id,
            name
          )
        )
      `)
      .in('student_id', studentIds)
      .eq('is_current', true)
      .eq('status', 'active');

    if (batchError) {
      console.error('Error fetching batch data:', batchError);
      // Continue without batch data if there's an error
    }

    // Create a map of student_id to batch info
    const batchMap = new Map();
    if (batchData) {
      batchData.forEach((item: any) => {
        const batch = item.batches;
        batchMap.set(item.student_id, {
          batch_id: item.batch_id,
          batch_name: batch?.name,
          course_name: batch?.course?.name,
          academic_year: batch?.academic_year?.id,
          academic_year_name: batch?.academic_year?.name,
          roll_number: item.roll_number
        });
      });
    }

    // Transform students with batch information
    return studentsData
      .map(student => transformStudent(student, batchMap.get(student.id)))
      .filter(student => student !== null);
  } catch (error) {
    console.error('Error fetching students:', error);
    toast({
      title: 'Error',
      description: 'Failed to load students. Please try again later.',
      variant: 'destructive',
    });
    return [];
  }
};

// Helper function to wait
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to retry an operation
const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        console.log(`Retry attempt ${i + 1} of ${maxRetries}...`);
        await wait(delayMs);
      }
    }
  }
  
  throw lastError;
};

// Fetch a single student by ID with all related details
export const fetchStudentDetails = async (studentId: string): Promise<StudentWithDetails> => {
  try {
    // First check if the student exists in student_details by ID
    console.log('🔍 Checking student_details table for student ID:', studentId);
    let { data: detailsExist, error: detailsError } = await supabase
      .from('student_details')
      .select('id, profile_id')
      .eq('id', studentId)
      .maybeSingle();

    // If not found by student_details.id, try by profile_id
    if (!detailsExist && !detailsError) {
      console.log('🔍 Student not found by ID, checking by profile_id:', studentId);
      const { data: detailsByProfileId, error: profileError } = await supabase
        .from('student_details')
        .select('id, profile_id')
        .eq('profile_id', studentId)
        .maybeSingle();
      
      detailsExist = detailsByProfileId;
      detailsError = profileError;
    }

    if (detailsError) {
      console.error('❌ Error checking student_details table:', {
        error: detailsError,
        studentId,
        message: detailsError.message,
        details: detailsError.details,
        hint: detailsError.hint
      });
      throw detailsError;
    }

    if (!detailsExist) {
      console.error('❌ Student details not found in student_details table:', { studentId });
      throw new Error('Student details not found in student_details table');
    }

    // Use the actual student_details.id for subsequent queries
    const actualStudentId = detailsExist.id;
    const profileId = detailsExist.profile_id;
    
    // Check if the student exists in profiles
    if (profileId) {
      console.log('🔍 Checking profiles table for profile_id:', profileId);
      const { data: profileExists, error: profileError } = await supabase
        .from('profiles')
        .select('id, roles')
        .eq('id', profileId)
        .maybeSingle();

      if (profileError) {
        console.error('❌ Error checking profiles table:', {
          error: profileError,
          studentId: profileId,
          message: profileError.message,
          details: profileError.details,
          hint: profileError.hint
        });
        throw profileError;
      }

      // If profile doesn't exist, we'll still proceed with student details
      if (!profileExists) {
        console.warn('⚠️ Student not found in profiles table, proceeding with student details only');
      } else if (!profileExists.roles?.includes('student')) {
        console.error('❌ User exists but is not a student:', { 
          studentId: profileId, 
          roles: profileExists.roles 
        });
        throw new Error('User exists but is not a student');
      }
    }

    // Fetch the student profile and basic details using the actual student_details.id
    console.log('🔍 Fetching student details for student_details.id:', actualStudentId);
    const { data: studentData, error: studentError } = await supabase
      .from('student_details')
      .select('*')
      .eq('id', actualStudentId)
      .maybeSingle();

    if (studentError) {
      console.error('Error fetching student details:', {
        error: studentError,
        studentId: actualStudentId,
        message: studentError.message,
        details: studentError.details,
        hint: studentError.hint
      });
      throw studentError;
    }

    if (!studentData) {
      throw new Error('Student details not found');
    }

    // Fetch current batch information using the actual student_details.id
    const batchInfo = await getStudentCurrentBatch(actualStudentId);
    
    // Transform student data with batch information
    const student = transformStudent(studentData, batchInfo ? {
      batch_id: batchInfo.batch_id,
      batch_name: batchInfo.batch_name,
      course_name: batchInfo.course_name,
      academic_year: batchInfo.academic_year_name
    } : undefined);

    // Fetch guardians using the actual student_details.id
    const { data: guardiansData, error: guardiansError } = await supabase
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
      .eq('student_id', actualStudentId);

    if (guardiansError) {
      console.error('Error fetching guardians:', guardiansError);
      throw guardiansError;
    }

    const guardians: Guardian[] = (guardiansData as unknown as GuardianResponse[]).map(item => ({
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

    // Add guardians to student object
    student.guardians = guardians;

    return student;
  } catch (error) {
    console.error('Error fetching student details:', error);
    throw error;
  }
};

// Create a new student
export const createStudent = async (data: any) => {
  try {
    console.log('Creating student with data:', data);

    // Validate required fields
    if (!data.admission_number) {
      throw new Error('Admission number is required');
    }
    if (!data.school_id) {
      throw new Error('School ID is required');
    }
    if (!data.gender) {
      throw new Error('Gender is required');
    }
    if (!data.batch_id) {
      throw new Error('Batch is required');
    }
    if (!data.first_name) {
      throw new Error('First name is required');
    }
    if (!data.last_name) {
      throw new Error('Last name is required');
    }

    // Store batch_id separately - we'll use it after creating the student
    const batchId = data.batch_id;

    // Transform the data to ensure proper types 
    // Note: batch_id is no longer stored in student_details table, but we keep it in data for backwards compatibility
    const transformedData = {
      admission_number: data.admission_number,
      school_id: data.school_id,
      gender: data.gender,
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email || null,
      date_of_birth: data.date_of_birth || null,
      address: data.address || null,
      nationality: data.nationality || null,
      mother_tongue: data.mother_tongue || null,
      blood_group: data.blood_group || null,
      religion: data.religion || null,
      caste: data.caste || null,
      category: data.category || null,
      phone: data.phone || null,
      previous_school_name: data.previous_school_name || null,
      previous_school_board: data.previous_school_board || null,
      previous_school_year: data.previous_school_year || null,
      previous_school_percentage: data.previous_school_percentage || null
    };

    // Log the transformed data
    console.log('Transformed data:', transformedData);

    // Create the student first
    const { data: studentId, error: studentError } = await supabase
      .rpc('add_student_v2', {
        p_data: transformedData
      });

    if (studentError) {
      console.error('Error creating student:', studentError);
      throw studentError;
    }

    if (!studentId) {
      throw new Error('Failed to create student: No ID returned');
    }

    console.log('Student created successfully with ID:', studentId);

    // Now enroll the student in the specified batch
    try {
      // Try using the RPC function first
      try {
        // Get batch details to extract academic_year_id
        const { data: batchData, error: batchFetchError } = await supabase
          .from('batches')
          .select('academic_year_id')
          .eq('id', batchId)
          .single();

        if (batchFetchError || !batchData) {
          console.error('Error fetching batch details:', batchFetchError);
          throw new Error('Invalid batch specified');
        }

        const { data: enrollmentId, error: enrollmentError } = await supabase.rpc('enroll_student_in_batch', {
          p_student_id: studentId,
          p_batch_id: batchId,
          p_enrollment_type: 'new_admission',
          p_roll_number: null, // Auto-generate roll number
          p_academic_year_id: batchData.academic_year_id,
          p_enrollment_date: new Date().toISOString().split('T')[0] // Today's date in YYYY-MM-DD format
        });

        if (enrollmentError) {
          console.error('Error enrolling student in batch via RPC:', enrollmentError);
          throw enrollmentError;
        }
        
        console.log('Student enrolled in batch successfully with enrollment ID:', enrollmentId);
      } catch (rpcError) {
        console.warn('RPC enrollment failed, trying direct batch_students insert:', rpcError);
        
        // Fallback to direct batch_students table insert
        const success = await addStudentToBatch(studentId, batchId);
        if (!success) {
          console.error('Direct batch enrollment also failed');
          throw new Error('Failed to enroll student in batch');
        }
        
        console.log('Student enrolled in batch successfully via direct insert');
      }
    } catch (batchError) {
      console.error('Error during batch enrollment:', batchError);
      // Continue with guardian creation even if batch enrollment fails
      console.warn('Student was created but batch enrollment failed. Student can be enrolled manually.');
    }

    // Create a student result object
    const studentResult = {
      id: studentId,
      ...transformedData,
      batch_id: batchId // Include for backward compatibility
    };

    // Now create guardians if they exist
    if (data.guardians && Array.isArray(data.guardians)) {
      console.log('Creating guardians for student:', studentId, data.guardians);
      
      for (const guardian of data.guardians) {
        try {
          // Log guardian data before processing
          console.log('Processing guardian:', guardian);

          // Ensure guardian has required fields
          if (!guardian.first_name || !guardian.relation || !guardian.phone) {
            console.warn('Skipping guardian due to missing required fields:', {
              first_name: guardian.first_name,
              relation: guardian.relation,
              phone: guardian.phone
            });
            continue;
          }

          // Add guardian to student
          console.log('Adding guardian to student:', {
            studentId: studentId,
            guardianData: guardian,
            schoolId: data.school_id
          });

          const success = await addGuardianToStudent(
            studentId,
            {
              first_name: guardian.first_name,
              last_name: guardian.last_name || '',
              relation: guardian.relation,
              occupation: guardian.occupation || '',
              email: guardian.email || '',
              phone: guardian.phone,
              address: guardian.address || '',
              is_emergency_contact: guardian.is_emergency_contact || false,
              can_pickup: guardian.can_pickup || false,
              is_primary: guardian.is_primary || false
            },
            data.school_id
          );

          if (!success) {
            console.error('Failed to add guardian:', guardian);
          } else {
            console.log('Successfully added guardian:', guardian);
          }
        } catch (guardianError) {
          console.error('Error adding guardian:', guardianError);
          // Continue with other guardians even if one fails
        }
      }
      
      console.log('Finished creating guardians for student:', studentId);
    } else {
      console.log('No guardians to create for student:', studentId);
    }

    return studentResult;
  } catch (error: any) {
    console.error('Error creating student:', error);
    throw error;
  }
};

// Update student
export const updateStudent = async (studentId: string, data: Partial<NewStudentFormData>, schoolId: string): Promise<Student | null> => {
  try {
    // Handle batch change separately if provided
    if (data.batch_id) {
      try {
        // First remove from current batch
        const { data: currentBatch } = await supabase
          .from('batch_students')
          .select('batch_id')
          .eq('student_id', studentId)
          .single();

        if (currentBatch && currentBatch.batch_id !== data.batch_id) {
          await removeStudentFromBatch(studentId, currentBatch.batch_id);
        }

        // Try RPC function first, then fallback to direct insert
        try {
          const { error: batchError } = await supabase.rpc('enroll_student_in_batch', {
            p_student_id: studentId,
            p_batch_id: data.batch_id,
            p_enrollment_type: 'transferred'
          });
          
          if (batchError) {
            console.warn('RPC batch update failed, trying direct insert:', batchError);
            const success = await addStudentToBatch(studentId, data.batch_id);
            if (!success) {
              console.error('Both RPC and direct batch update failed');
            }
          }
        } catch (rpcError) {
          console.warn('RPC batch update failed, trying direct insert:', rpcError);
          const success = await addStudentToBatch(studentId, data.batch_id);
          if (!success) {
            console.error('Direct batch update also failed');
          }
        }
      } catch (batchError) {
        console.error('Error during batch update:', batchError);
      }
    }

    // Update profile
    if (data.first_name || data.last_name || data.email) {
      const updateData: any = {};
      if (data.first_name) updateData.first_name = data.first_name;
      if (data.last_name) updateData.last_name = data.last_name;
      if (data.email) updateData.email = data.email;

      const { error: profileError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', studentId);

      if (profileError) throw profileError;
    }

    // Update student details (excluding batch_id which is handled separately)
    const studentDetailsUpdate: any = {};
    const detailsFields = [
      'date_of_birth', 'gender', 'address', 'nationality',
      'mother_tongue', 'blood_group', 'religion', 'caste', 'category',
      'phone', 'previous_school_name', 'previous_school_board',
      'previous_school_year', 'previous_school_percentage', 'admission_number'
    ];

    detailsFields.forEach(field => {
      if (data[field] !== undefined) {
        studentDetailsUpdate[field] = data[field];
      }
    });

    if (Object.keys(studentDetailsUpdate).length > 0) {
      const { error: detailsError } = await supabase
        .from('student_details')
        .update(studentDetailsUpdate)
        .eq('id', studentId);

      if (detailsError) throw detailsError;
    }

    // Upload new avatar if provided
    if (data.avatar) {
      const avatarPath = `${schoolId}/${studentId}/avatar`;
      const { error: uploadError } = await supabase.storage
        .from('student_files')
        .upload(avatarPath, data.avatar, { upsert: true });

      if (uploadError) {
        console.error('Error uploading avatar:', uploadError);
      } else {
        // Update profile with avatar URL
        const { data: publicUrlData } = supabase.storage
          .from('student_files')
          .getPublicUrl(avatarPath);

        await supabase
          .from('profiles')
          .update({ avatar_url: publicUrlData.publicUrl })
          .eq('id', studentId);
      }
    }

    // Upload new documents if provided
    if (data.documents && data.documents.length > 0) {
      for (const docData of data.documents) {
        const docPath = `${schoolId}/${studentId}/documents/${docData.name}-${Date.now()}`;
        const { error: uploadError } = await supabase.storage
          .from('student_files')
          .upload(docPath, docData.file);

        if (uploadError) {
          console.error('Error uploading document:', uploadError);
          continue;
        }

        const { data: publicUrlData } = supabase.storage
          .from('student_files')
          .getPublicUrl(docPath);

        await supabase
          .from('student_documents')
          .insert({
            student_id: studentId,
            name: docData.name,
            type: docData.type,
            description: docData.description,
            file_path: publicUrlData.publicUrl,
            school_id: schoolId
          });
      }
    }

    return await fetchStudentDetails(studentId);

  } catch (error) {
    console.error('Error updating student:', error);
    toast({
      title: 'Error',
      description: 'Failed to update student. Please try again.',
      variant: 'destructive',
    });
    return null;
  }
};

/**
 * Removes login access for a student by deleting their profile and clearing the profile_id
 * This does NOT delete the student record itself, only removes their ability to log in
 * The student record remains in student_details table with profile_id set to null
 */
export const removeStudentLoginAccess = async (studentId: string): Promise<boolean> => {
  try {
    // First get the profile_id from student_details
    const { data: studentData, error: studentError } = await supabase
      .from('student_details')
      .select('profile_id')
      .eq('id', studentId)
      .single();

    if (studentError) throw studentError;
    if (!studentData?.profile_id) {
      console.error('No profile_id found for student');
      return false;
    }

    // Delete the profile entry to prevent login
    const { error: profileDeleteError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', studentData.profile_id);

    if (profileDeleteError) {
      console.error('Error deleting profile:', profileDeleteError);
      throw profileDeleteError;
    }

    // Only after successful profile deletion, update student_details
    const { error: profileError } = await supabase
      .from('student_details')
      .update({ profile_id: null })
      .eq('id', studentId);

    if (profileError) {
      console.error('Error updating student_details:', profileError);
      throw profileError;
    }

    return true;
  } catch (error) {
    console.error('Error removing student login access:', error);
    toast({
      title: 'Error',
      description: 'Failed to remove student login access. Please try again.',
      variant: 'destructive',
    });
    return false;
  }
};

// Legacy alias for backward compatibility (deprecated)
// TODO: Remove this alias in future version and update all callers to use removeStudentLoginAccess
export const deleteStudent = removeStudentLoginAccess;

/**
 * Actually deletes a student record from the database (DESTRUCTIVE OPERATION)
 * This removes the student completely from student_details table
 * WARNING: This is irreversible and should be used with extreme caution
 * Consider using removeStudentLoginAccess instead if you just want to disable login
 */
export const deleteStudentRecord = async (studentId: string): Promise<boolean> => {
  try {
    // First remove login access if it exists
    await removeStudentLoginAccess(studentId);
    
    // Then delete the actual student record
    const { error } = await supabase
      .from('student_details')
      .delete()
      .eq('id', studentId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting student record:', error);
    toast({
      title: 'Error',
      description: 'Failed to delete student record. Please try again.',
      variant: 'destructive',
    });
    return false;
  }
};

// Add guardian to student
export const addGuardianToStudent = async (
  studentId: string, 
  guardianData: Omit<Guardian, 'id' | 'school_id'> & { is_primary?: boolean },
  schoolId: string
): Promise<boolean> => {
  try {
    console.log('Creating guardian record:', {
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
    });

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

    if (guardianError) {
      console.error('Error creating guardian record:', guardianError);
      throw guardianError;
    }

    console.log('Created guardian record:', guardian);

    // Link guardian to student
    console.log('Linking guardian to student:', {
      student_id: studentId,
      guardian_id: guardian.id,
      is_primary: guardianData.is_primary || false
    });

    const { error: linkError } = await supabase
      .from('student_guardians')
      .insert({
        student_id: studentId,
        guardian_id: guardian.id,
        is_primary: guardianData.is_primary || false
      });

    if (linkError) {
      console.error('Error linking guardian to student:', linkError);
      throw linkError;
    }

    console.log('Successfully linked guardian to student');
    return true;
  } catch (error) {
    console.error('Error adding guardian:', error);
    toast({
      title: 'Error',
      description: 'Failed to add guardian. Please try again.',
      variant: 'destructive',
    });
    return false;
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
      const { error: relationError } = await supabase
        .from('student_guardians')
        .update({ is_primary: guardianData.is_primary })
        .eq('guardian_id', guardianId);

      if (relationError) throw relationError;
    }

    return true;
  } catch (error) {
    console.error('Error updating guardian:', error);
    toast({
      title: 'Error',
      description: 'Failed to update guardian. Please try again.',
      variant: 'destructive',
    });
    return false;
  }
};

// Add student to category
export const addStudentToCategory = async (
  studentId: string,
  categoryId: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('student_category_assignments')
      .insert({
        student_id: studentId,
        category_id: categoryId
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error adding student to category:', error);
    toast({
      title: 'Error',
      description: 'Failed to add student to category. Please try again.',
      variant: 'destructive',
    });
    return false;
  }
};

// Remove student from category
export const removeStudentFromCategory = async (
  studentId: string,
  categoryId: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('student_category_assignments')
      .delete()
      .eq('student_id', studentId)
      .eq('category_id', categoryId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error removing student from category:', error);
    toast({
      title: 'Error',
      description: 'Failed to remove student from category. Please try again.',
      variant: 'destructive',
    });
    return false;
  }
};

// Create category
export const createCategory = async (
  name: string,
  description: string | null,
  color: string | null,
  schoolId: string
): Promise<StudentCategory | null> => {
  try {
    const { data, error } = await supabase
      .from('student_categories')
      .insert({
        name,
        description,
        color,
        school_id: schoolId
      })
      .select('*')
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating category:', error);
    toast({
      title: 'Error',
      description: 'Failed to create category. Please try again.',
      variant: 'destructive',
    });
    return null;
  }
};

// Add disciplinary record
export const addDisciplinaryRecord = async (
  studentId: string,
  data: Omit<DisciplinaryRecord, 'id' | 'student_id' | 'created_at' | 'updated_at'>,
  evidenceFiles?: { type: string; file: File }[]
): Promise<boolean> => {
  try {
    const { data: record, error } = await supabase
      .from('disciplinary_records')
      .insert({
        student_id: studentId,
        incident_type: data.incident_type,
        description: data.description,
        date: data.date,
        severity: data.severity,
        status: data.status,
        action_taken: data.action_taken,
        reported_by: data.reported_by,
        school_id: data.school_id
      })
      .select('id')
      .single();

    if (error) throw error;

    // Upload evidence files if provided
    if (evidenceFiles && evidenceFiles.length > 0) {
      for (const evidence of evidenceFiles) {
        const evidencePath = `${data.school_id}/${studentId}/discipline/${record.id}/${Date.now()}`;
        const { error: uploadError } = await supabase.storage
          .from('student_files')
          .upload(evidencePath, evidence.file);

        if (uploadError) {
          console.error('Error uploading evidence:', uploadError);
          continue;
        }

        const { data: publicUrlData } = supabase.storage
          .from('student_files')
          .getPublicUrl(evidencePath);

        await supabase
          .from('disciplinary_evidence')
          .insert({
            disciplinary_record_id: record.id,
            type: evidence.type,
            file_path: publicUrlData.publicUrl,
            school_id: data.school_id
          });
      }
    }

    return true;
  } catch (error) {
    console.error('Error adding disciplinary record:', error);
    toast({
      title: 'Error',
      description: 'Failed to add disciplinary record. Please try again.',
      variant: 'destructive',
    });
    return false;
  }
};

// Add transfer record
export const addTransferRecord = async (
  data: Omit<TransferRecord, 'id' | 'created_at' | 'updated_at'>
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('transfer_records')
      .insert({
        student_id: data.student_id,
        type: data.type,
        date: data.date,
        from_batch_id: data.from_batch_id,
        to_batch_id: data.to_batch_id,
        to_school: data.to_school,
        reason: data.reason,
        tc_number: data.tc_number,
        status: data.status,
        school_id: data.school_id
      });

    if (error) throw error;

    // If it's a internal transfer and approved, update the batch
    if (data.type === 'internal' && data.status === 'approved' && data.to_batch_id) {
      const { error: updateError } = await supabase
        .from('student_details')
        .update({ batch_id: data.to_batch_id })
        .eq('id', data.student_id);

      if (updateError) throw updateError;
    }
    
    // If it's an external transfer and approved, update status to transferred
    if (data.type === 'external' && data.status === 'approved') {
      const { error: updateError } = await supabase
        .from('student_details')
        .update({ status: 'transferred' })
        .eq('id', data.student_id);

      if (updateError) throw updateError;
    }

    return true;
  } catch (error) {
    console.error('Error adding transfer record:', error);
    toast({
      title: 'Error',
      description: 'Failed to add transfer record. Please try again.',
      variant: 'destructive',
    });
    return false;
  }
};

// Generate certificate
export const generateCertificate = async (
  data: Omit<Certificate, 'id' | 'created_at' | 'updated_at'>
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('certificates')
      .insert({
        student_id: data.student_id,
        type: data.type,
        template_id: data.template_id,
        issued_date: data.issued_date,
        valid_until: data.valid_until,
        serial_number: data.serial_number,
        status: data.status,
        issued_by: data.issued_by,
        data: data.data,
        school_id: data.school_id
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error generating certificate:', error);
    toast({
      title: 'Error',
      description: 'Failed to generate certificate. Please try again.',
      variant: 'destructive',
    });
    return false;
  }
};

// Import students from CSV
export const importStudentsFromCSV = async (
  students: Array<NewStudentFormData>,
  schoolId: string
): Promise<{ success: number; failed: number }> => {
  let successCount = 0;
  let failedCount = 0;

  for (const student of students) {
    try {
      // Transform camelCase to snake_case
      const transformedData = {
        admission_number: student.admission_number,
        school_id: schoolId,
        gender: student.gender,
        batch_id: student.batch_id,
        date_of_birth: student.date_of_birth,
        address: student.address,
        nationality: student.nationality,
        mother_tongue: student.mother_tongue,
        blood_group: student.blood_group,
        religion: student.religion,
        caste: student.caste,
        category: student.category,
        phone: student.phone,
        previous_school_name: student.previous_school_name,
        previous_school_board: student.previous_school_board,
        previous_school_year: student.previous_school_year,
        previous_school_percentage: student.previous_school_percentage
      };

      const result = await createStudent(transformedData);
      if (result) {
        successCount++;
      } else {
        failedCount++;
      }
    } catch (error) {
      console.error(`Error importing student ${student.email}:`, error);
      failedCount++;
    }
  }

  return { success: successCount, failed: failedCount };
};

// Bulk assign batch - Updated to use batch_students table directly
export const bulkAssignBatch = async (
  studentIds: string[],
  batchId: string,
  enrollmentType: 'new_admission' | 'promoted' | 'transferred' | 'repeated' = 'transferred'
): Promise<boolean> => {
  try {
    // Use improved batch assignment with proper historical tracking
    const results = await Promise.allSettled(
      studentIds.map(async (studentId) => {
        // First try RPC function, then fallback to direct insert
        try {
          const { data, error } = await supabase.rpc('enroll_student_in_batch', {
            p_student_id: studentId,
            p_batch_id: batchId,
            p_enrollment_type: enrollmentType
          });
          
          if (error) {
            console.warn(`RPC enrollment failed for student ${studentId}, trying direct insert:`, error);
            const success = await addStudentToBatch(studentId, batchId, undefined, enrollmentType);
            if (!success) throw new Error('Both RPC and direct insert failed');
            return 'direct_insert';
          }
          return data;
        } catch (rpcError) {
          console.warn(`Enrollment failed for student ${studentId}:`, rpcError);
          throw rpcError;
        }
      })
    );

    // Check if all operations succeeded
    const failed = results.filter(result => result.status === 'rejected');
    if (failed.length > 0) {
      console.error(`Failed to enroll ${failed.length} students`);
      toast({
        title: 'Partial Success',
        description: `${results.length - failed.length} students enrolled successfully. ${failed.length} failed.`,
        variant: 'destructive',
      });
      return false;
    }

    toast({
      title: 'Success',
      description: `All ${studentIds.length} students enrolled successfully.`,
    });
    return true;
  } catch (error) {
    console.error('Error bulk assigning batch:', error);
    toast({
      title: 'Error',
      description: 'Failed to assign batch to students. Please try again.',
      variant: 'destructive',
    });
    return false;
  }
};

// Fetch all categories for a school
export const fetchCategories = async (schoolId: string): Promise<StudentCategory[]> => {
  try {
    const { data, error } = await supabase
      .from('student_categories')
      .select('*')
      .eq('school_id', schoolId);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    toast({
      title: 'Error',
      description: 'Failed to load student categories. Please try again later.',
      variant: 'destructive',
    });
    return [];
  }
};

export const fetchStudentsFromDetails = async (schoolId: string): Promise<Student[]> => {
  try {
    console.log('Fetching students for school_id:', schoolId);
    
    // Get student details with profile information
    const { data: studentsData, error: studentsError } = await supabase
      .from('student_details')
      .select(`
        *,
        profile:profile_id (
          id,
          email,
          first_name,
          last_name,
          avatar_url,
          roles
        )
      `)
      .eq('school_id', schoolId);

    if (studentsError) {
      console.error('Error fetching student details:', studentsError);
      throw studentsError;
    }

    console.log('Found students:', studentsData?.length || 0);

    if (!studentsData || studentsData.length === 0) return [];

    // Get student detail IDs for batch lookup, filtering out null profile IDs
    const studentDetailIds = studentsData
      .filter(student => student.profile_id)
      .map(student => student.id); // Use student_details.id, not profile_id

    console.log('Student detail IDs for batch lookup:', studentDetailIds);

    // Only fetch batch data if we have valid student IDs
    let batchData: any[] = [];
    let batchError = null;

    if (studentDetailIds.length > 0) {
      // Fetch current batch information from batch_students table
      const batchResult = await supabase
        .from('batch_students')
        .select(`
          student_id,
          batch_id,
          roll_number,
          batches!inner (
            id,
            name,
            course:course_id (
              name
            ),
            academic_year:academic_year_id (
              id,
              name
            )
          )
        `)
        .in('student_id', studentDetailIds) // Use student_details.id
        .eq('is_current', true)
        .eq('status', 'active');

      batchData = batchResult.data || [];
      batchError = batchResult.error;
    }

    if (batchError) {
      console.warn('Error fetching batch data:', batchError);
    }

    console.log('Batch data found:', batchData?.length || 0);
    console.log('Sample batch data:', batchData?.slice(0, 2));

    // Create a map of student_details.id to batch info
    const batchMap = new Map();
    if (batchData) {
      batchData.forEach((item: any) => {
        const batch = item.batches;
        console.log('Mapping batch for student_detail_id:', item.student_id, 'to batch:', item.batch_id);
        batchMap.set(item.student_id, {
          batch_id: item.batch_id,
          batch_name: batch?.name,
          course_name: batch?.course?.name,
          academic_year: batch?.academic_year?.id,
          academic_year_name: batch?.academic_year?.name,
          roll_number: item.roll_number
        });
      });
    }

    console.log('Batch map size:', batchMap.size);

    return (studentsData || [])
      .map((row: any) => {
        const batchInfo = batchMap.get(row.id); // Use student_details.id to lookup batch info
        return {
          id: row.id, // Always use student_details.id as the primary ID
          first_name: row.profile?.first_name || row.first_name || '',
          last_name: row.profile?.last_name || row.last_name || '',
          email: row.profile?.email || row.email || '',
          profile_id: row.profile_id, // Include profile_id to determine login status
          avatar_url: row.profile?.avatar_url,
          school_id: row.school_id,
          admission_number: row.admission_number,
          date_of_birth: row.date_of_birth,
          gender: row.gender,
          address: row.address,
          nationality: row.nationality,
          mother_tongue: row.mother_tongue,
          blood_group: row.blood_group,
          religion: row.religion,
          caste: row.caste,
          category: row.category,
          phone: row.phone,
          previous_school_name: row.previous_school_name,
          previous_school_board: row.previous_school_board,
          previous_school_year: row.previous_school_year,
          previous_school_percentage: row.previous_school_percentage,
          tc_number: row.tc_number,
          admission_date: row.admission_date,
          status: row.status || 'active',
          batch_id: batchInfo?.batch_id || undefined,
          batch_name: batchInfo?.batch_name || '',
          course_name: batchInfo?.course_name || '',
          academic_year: batchInfo?.academic_year || '',
        };
      });
  } catch (error) {
    console.error('Error fetching students from details:', error);
    return [];
  }
};

// Get current batch information for a student
export const getStudentCurrentBatch = async (studentId: string): Promise<{
  batch_id: string;
  batch_name: string;
  batch_code?: string;
  course_name: string;
  academic_year_name: string;
  enrollment_date: string;
  enrollment_type: string;
  roll_number?: string;
  status: string;
} | null> => {
  try {
    const { data, error } = await supabase
      .from('batch_students')
      .select(`
        batch_id,
        roll_number,
        created_at,
        enrollment_date,
        enrollment_type,
        status,
        batches!inner (
          id,
          name,
          code,
          course:course_id (
            name
          ),
          academic_year:academic_year_id (
            id,
            name
          )
        )
      `)
      .eq('student_id', studentId)
      .eq('is_current', true)
      .eq('status', 'active')
      .single();

    if (error) {
      console.error('Error fetching student current batch:', error);
      return null;
    }

    if (!data) return null;

    const batch = data.batches as any;
    return {
      batch_id: data.batch_id,
      batch_name: batch.name,
      batch_code: batch.code,
      course_name: batch.course?.name || '',
      academic_year_name: batch.academic_year?.name || '',
      enrollment_date: data.enrollment_date || data.created_at,
      enrollment_type: data.enrollment_type || 'active',
      roll_number: data.roll_number,
      status: data.status || 'active'
    };
  } catch (error) {
    console.error('Error fetching student current batch:', error);
    return null;
  }
};

// Add student to batch using batch_students table with proper historical tracking
export const addStudentToBatch = async (
  studentId: string,
  batchId: string,
  rollNumber?: string,
  enrollmentType?: 'new_admission' | 'promoted' | 'transferred' | 'repeated'
): Promise<boolean> => {
  try {
    // Get the academic year for the target batch
    const { data: batchInfo, error: batchError } = await supabase
      .from('batches')
      .select('academic_year_id')
      .eq('id', batchId)
      .single();

    if (batchError) {
      console.error('Error fetching batch info:', batchError);
      throw batchError;
    }

    // Check if student is already in a current active batch
    const { data: existingBatch, error: checkError } = await supabase
      .from('batch_students')
      .select('id, batch_id, enrollment_type')
      .eq('student_id', studentId)
      .eq('is_current', true)
      .eq('status', 'active')
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing batch:', checkError);
      throw checkError;
    }

    // Check if already in the same current batch
    if (existingBatch && existingBatch.batch_id === batchId) {
      console.log('Student is already enrolled in this batch');
      return true;
    }

    // Determine enrollment type if not provided
    let finalEnrollmentType = enrollmentType;
    if (!finalEnrollmentType) {
      if (existingBatch) {
        finalEnrollmentType = 'transferred';
      } else {
        // Check if this is a re-enrollment (student was in this batch before)
        const { data: historicalBatch } = await supabase
          .from('batch_students')
          .select('id')
          .eq('student_id', studentId)
          .eq('batch_id', batchId)
          .limit(1)
          .maybeSingle();
        
        finalEnrollmentType = historicalBatch ? 'repeated' : 'new_admission';
      }
    }

    // If student is already in a different batch, set it to not current
    if (existingBatch) {
      const { error: updateError } = await supabase
        .from('batch_students')
        .update({ 
          is_current: false,
          end_date: new Date().toISOString().split('T')[0],
          updated_at: new Date().toISOString()
        })
        .eq('id', existingBatch.id);

      if (updateError) {
        console.error('Error updating previous batch:', updateError);
        throw updateError;
      }
    }

    // Add student to new batch
    const { error: insertError } = await supabase
      .from('batch_students')
      .insert({
        student_id: studentId,
        batch_id: batchId,
        roll_number: rollNumber || null,
        enrollment_date: new Date().toISOString().split('T')[0],
        enrollment_type: finalEnrollmentType,
        academic_year_id: batchInfo.academic_year_id,
        is_current: true,
        status: 'active'
      });

    if (insertError) {
      console.error('Error adding student to batch:', insertError);
      throw insertError;
    }

    console.log('Student added to batch successfully');
    return true;
  } catch (error) {
    console.error('Error in addStudentToBatch:', error);
    return false;
  }
};

// Remove student from batch (sets as inactive rather than deleting for historical tracking)
export const removeStudentFromBatch = async (
  studentId: string,
  batchId?: string
): Promise<boolean> => {
  try {
    // If no specific batch provided, remove from current active batch
    let query = supabase
      .from('batch_students')
      .update({ 
        is_current: false,
        end_date: new Date().toISOString().split('T')[0],
        status: 'inactive',
        updated_at: new Date().toISOString()
      })
      .eq('student_id', studentId)
      .eq('is_current', true)
      .eq('status', 'active');

    // If specific batch provided, target that batch
    if (batchId) {
      query = query.eq('batch_id', batchId);
    }

    const { error } = await query;

    if (error) throw error;

    console.log('Student removed from batch successfully');
    return true;
  } catch (error) {
    console.error('Error removing student from batch:', error);
    return false;
  }
};

// Update student's roll number in a batch
export const updateStudentRollNumber = async (
  studentId: string,
  batchId: string,
  rollNumber: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('batch_students')
      .update({ roll_number: rollNumber })
      .eq('student_id', studentId)
      .eq('batch_id', batchId);

    if (error) throw error;

    console.log('Student roll number updated successfully');
    return true;
  } catch (error) {
    console.error('Error updating student roll number:', error);
    return false;
  }
};

// Get all students in a batch (current enrollments only by default)
export const getStudentsInBatch = async (batchId: string, includeInactive: boolean = false): Promise<Student[]> => {
  try {
    let query = supabase
      .from('batch_students')
      .select(`
        student_id,
        roll_number,
        enrollment_date,
        enrollment_type,
        is_current,
        status,
        profiles!inner (
          id,
          email,
          first_name,
          last_name,
          avatar_url,
          school_id,
          created_at,
          updated_at,
          student_details!inner (
            admission_number,
            date_of_birth,
            gender,
            address,
            nationality,
            mother_tongue,
            blood_group,
            religion,
            caste,
            category,
            phone,
            previous_school_name,
            previous_school_board,
            previous_school_year,
            previous_school_percentage,
            tc_number,
            admission_date,
            status
          )
        )
      `)
      .eq('batch_id', batchId);

    // Filter for current active students unless requested otherwise
    if (!includeInactive) {
      query = query.eq('is_current', true).eq('status', 'active');
    }

    const { data, error } = await query;

    if (error) throw error;

    return (data || []).map((item: any) => {
      const profile = item.profiles;
      const studentDetails = profile.student_details;
      
      return {
        id: profile.id,
        first_name: profile.first_name,
        last_name: profile.last_name,
        email: profile.email,
        avatar_url: profile.avatar_url,
        school_id: profile.school_id,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
        admission_number: studentDetails.admission_number,
        date_of_birth: studentDetails.date_of_birth,
        gender: studentDetails.gender,
        address: studentDetails.address,
        batch_id: batchId,
        nationality: studentDetails.nationality,
        mother_tongue: studentDetails.mother_tongue,
        blood_group: studentDetails.blood_group,
        religion: studentDetails.religion,
        caste: studentDetails.caste,
        category: studentDetails.category,
        phone: studentDetails.phone,
        previous_school_name: studentDetails.previous_school_name,
        previous_school_board: studentDetails.previous_school_board,
        previous_school_year: studentDetails.previous_school_year,
        previous_school_percentage: studentDetails.previous_school_percentage,
        tc_number: studentDetails.tc_number,
        admission_date: studentDetails.admission_date,
        status: studentDetails.status || 'active'
      };
    });
  } catch (error) {
    console.error('Error fetching students in batch:', error);
    return [];
  }
};

// Reporting functions using student_batch_history view
export const getStudentBatchHistory = async (studentId: string): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('student_batch_history')
      .select('*')
      .eq('student_id', studentId)
      .order('enrollment_date', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching student batch history:', error);
    return [];
  }
};

export const getBatchHistoryReport = async (
  batchId: string,
  includeInactive: boolean = false
): Promise<any[]> => {
  try {
    let query = supabase
      .from('student_batch_history')
      .select('*')
      .eq('batch_id', batchId)
      .order('enrollment_date', { ascending: false });

    if (!includeInactive) {
      query = query.eq('is_current', true).eq('status', 'active');
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching batch history report:', error);
    return [];
  }
};

export const getStudentPromotionHistory = async (schoolId: string): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('student_batch_history')
      .select('*')
      .eq('enrollment_type', 'promoted')
      .order('enrollment_date', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching promotion history:', error);
    return [];
  }
};

// Create student login using Supabase Auth API
export const createStudentLogin = async (
  email: string,
  firstName: string,
  lastName: string,
  schoolId: string,
  password: string,
  studentId: string
): Promise<{ user_id: string; status: string } | null> => {
  try {
    console.log('Creating student login:', { email, firstName, lastName, schoolId, studentId });
    
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-student-login`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          email,
          firstName,
          lastName,
          schoolId,
          password,
          studentId,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Edge Function error:', data);
      const errorMessage = data.details || data.error || 'Failed to create student login';
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    console.error('Error in createStudentLogin:', error);
    throw error;
  }
};
