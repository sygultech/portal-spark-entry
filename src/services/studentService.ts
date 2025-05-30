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
  role,
  school_id,
  created_at,
  updated_at,
  student_details!inner (
    admission_number,
    date_of_birth,
    gender,
    address,
    batch_id,
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
  ),
  batches:student_details!inner (
    batch_id,
    batches (
      name,
      course:course_id (
        name
      ),
      academic_year:academic_year_id (
        name
      )
    )
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
const transformStudent = (data: any): Student => {
  if (!data) return null;
  
  const studentDetails = data.student_details || {};
  const batchInfo = data.batches?.[0]?.batches || {};
  
  return {
    id: data.id,
    first_name: data.first_name,
    last_name: data.last_name,
    email: data.email,
    avatar_url: data.avatar_url,
    school_id: data.school_id,
    created_at: data.created_at,
    updated_at: data.updated_at,
    admission_number: studentDetails.admission_number,
    date_of_birth: studentDetails.date_of_birth,
    gender: studentDetails.gender,
    address: studentDetails.address,
    batch_id: studentDetails.batch_id,
    batch_name: batchInfo.name,
    course_name: batchInfo.course?.name,
    academic_year: batchInfo.academic_year?.name,
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

// Fetch all students for a school
export const fetchStudents = async (schoolId: string): Promise<Student[]> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select(studentQuery)
      .eq('school_id', schoolId)
      .contains('roles', ['student']);

    if (error) throw error;

    return (data || [])
      .map(transformStudent)
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
    // First check if the student exists in student_details
    console.log('🔍 Checking student_details table for student:', studentId);
    const { data: detailsExist, error: detailsError } = await supabase
      .from('student_details')
      .select('id, profile_id')
      .eq('id', studentId)
      .maybeSingle();

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

    // If we have a profile_id, use that to check profiles table
    const profileId = detailsExist.profile_id || studentId;
    
    // Check if the student exists in profiles
    console.log('🔍 Checking profiles table for student:', profileId);
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

    // Fetch the student profile and basic details
    const { data: studentData, error: studentError } = await supabase
      .from('student_details')
      .select(`
        *,
        batches:batch_id (
          name,
          course:course_id (name),
          academic_year:academic_year_id (name)
        )
      `)
      .eq('id', studentId)
      .maybeSingle();

    if (studentError) {
      console.error('Error fetching student details:', {
        error: studentError,
        studentId,
        message: studentError.message,
        details: studentError.details,
        hint: studentError.hint
      });
      throw studentError;
    }

    if (!studentData) {
      throw new Error('Student details not found');
    }

    const student = transformStudent(studentData);

    // Fetch guardians
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
      .eq('student_id', studentId);

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
    // Log the incoming data
    console.log('Incoming student data:', data);

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

    // Transform the data to ensure proper types
    const transformedData = {
      admission_number: data.admission_number,
      school_id: data.school_id,
      gender: data.gender,
      batch_id: data.batch_id,
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

    // Create a student result object
    const studentResult = {
      id: studentId,
      ...transformedData
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

    // Update student details
    const studentDetailsUpdate: any = {};
    const detailsFields = [
      'date_of_birth', 'gender', 'address', 'batch_id', 'nationality',
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

// Delete student
export const deleteStudent = async (studentId: string): Promise<boolean> => {
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
    console.error('Error removing student access:', error);
    toast({
      title: 'Error',
      description: 'Failed to remove student access. Please try again.',
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

// Bulk assign batch
export const bulkAssignBatch = async (
  studentIds: string[],
  batchId: string
): Promise<boolean> => {
  try {
    for (const studentId of studentIds) {
      const { error } = await supabase
        .from('student_details')
        .update({ batch_id: batchId })
        .eq('id', studentId);

      if (error) {
        console.error(`Error assigning batch for student ${studentId}:`, error);
      }
    }
    return true;
  } catch (error) {
    console.error('Error bulk assigning batch:', error);
    toast({
      title: 'Error',
      description: 'Failed to assign batch to all students. Some may have been updated.',
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
    const { data, error } = await supabase
      .from('student_details')
      .select(`
        *,
        batches:batch_id (
          name,
          course:course_id (name)
        )
      `)
      .eq('school_id', schoolId);

    if (error) throw error;

    return (data || []).map((row: any) => ({
      ...row,
      batch_name: row.batches?.name || '',
      course_name: row.batches?.course?.name || '',
      first_name: row.first_name,
      last_name: row.last_name,
      email: row.email,
      profile_id: row.profile_id,
    }));
  } catch (error) {
    console.error('Error fetching students from details:', error);
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
      throw new Error(data.error || 'Failed to create student login');
    }

    return data;
  } catch (error) {
    console.error('Error in createStudentLogin:', error);
    throw error;
  }
};
