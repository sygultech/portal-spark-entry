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
      .eq('role', 'student');

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
    // First check if the student exists in profiles
    console.log('🔍 Checking profiles table for student:', studentId);
    const { data: profileExists, error: profileError } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', studentId)
      .maybeSingle();

    if (profileError) {
      console.error('❌ Error checking profiles table:', {
        error: profileError,
        studentId,
        message: profileError.message,
        details: profileError.details,
        hint: profileError.hint
      });
      throw profileError;
    }

    if (!profileExists) {
      console.error('❌ Student not found in profiles table:', { studentId });
      throw new Error('Student not found in profiles table');
    }

    if (profileExists.role !== 'student') {
      console.error('❌ User exists but is not a student:', { 
        studentId, 
        role: profileExists.role 
      });
      throw new Error('User exists but is not a student');
    }

    // Check if student details exist
    console.log('🔍 Checking student_details table for student:', studentId);
    const { data: detailsExist, error: detailsError } = await supabase
      .from('student_details')
      .select('id')
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

    // Fetch the student profile and basic details
    const { data: studentData, error: studentError } = await supabase
      .from('profiles')
      .select(`
        id,
        email,
        first_name,
        last_name,
        avatar_url,
        role,
        school_id,
        created_at,
        updated_at,
        student_details (
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
        )
      `)
      .eq('id', studentId)
      .eq('role', 'student')
      .maybeSingle();

    if (studentError) {
      console.error('Error fetching student profile:', {
        error: studentError,
        studentId,
        message: studentError.message,
        details: studentError.details,
        hint: studentError.hint
      });
      throw studentError;
    }

    if (!studentData) {
      throw new Error('Student profile not found');
    }

    const student = transformStudent(studentData);

    // Fetch batch details separately
    const { data: batchData, error: batchError } = await supabase
      .from('student_details')
      .select(`
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
      `)
      .eq('id', studentId)
      .single();

    if (batchError) {
      console.error('Error fetching batch details:', batchError);
    } else if (batchData) {
      const batchInfo = batchData as unknown as BatchResponse;
      student.batch_name = batchInfo.batches?.name;
      student.course_name = batchInfo.batches?.course?.name;
      student.academic_year = batchInfo.batches?.academic_year?.name;
    }

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

    // Fetch categories
    const { data: categoriesData, error: categoriesError } = await supabase
      .from('student_category_assignments')
      .select(`
        category:category_id (
          id,
          name,
          description,
          color,
          school_id
        )
      `)
      .eq('student_id', studentId);

    if (categoriesError) {
      console.error('Error fetching categories:', categoriesError);
      throw categoriesError;
    }

    const categories: StudentCategory[] = (categoriesData as unknown as CategoryResponse[]).map(item => ({
      id: item.category.id,
      name: item.category.name,
      description: item.category.description,
      color: item.category.color,
      school_id: item.category.school_id
    }));

    // Fetch documents
    const { data: documentsData, error: documentsError } = await supabase
      .from('student_documents')
      .select('*')
      .eq('student_id', studentId);

    if (documentsError) {
      console.error('Error fetching documents:', documentsError);
      throw documentsError;
    }

    // Cast types to match our type definitions
    const documents: StudentDocument[] = documentsData.map(doc => ({
      ...doc,
      verification_status: doc.verification_status as DocumentVerificationStatus,
      type: doc.type as string,
    }));

    // Fetch disciplinary records
    const { data: disciplinaryData, error: disciplinaryError } = await supabase
      .from('disciplinary_records')
      .select('*')
      .eq('student_id', studentId);

    if (disciplinaryError) {
      console.error('Error fetching disciplinary records:', disciplinaryError);
      throw disciplinaryError;
    }

    // Cast types to match our type definitions
    const disciplinaryRecords: DisciplinaryRecord[] = disciplinaryData.map(record => ({
      ...record,
      severity: record.severity as IncidentSeverity,
      status: record.status as IncidentStatus,
    }));

    // Fetch transfer records
    const { data: transferData, error: transferError } = await supabase
      .from('transfer_records')
      .select('*')
      .eq('student_id', studentId);

    if (transferError) {
      console.error('Error fetching transfer records:', transferError);
      throw transferError;
    }

    // Cast types to match our type definitions
    const transferRecords: TransferRecord[] = transferData.map(record => ({
      ...record,
      type: record.type as TransferType,
      status: record.status as TransferStatus,
    }));

    // Fetch certificates
    const { data: certificatesData, error: certificatesError } = await supabase
      .from('certificates')
      .select('*')
      .eq('student_id', studentId);

    if (certificatesError) {
      console.error('Error fetching certificates:', certificatesError);
      throw certificatesError;
    }

    // Cast types to match our type definitions
    const certificates: Certificate[] = certificatesData.map(cert => ({
      ...cert,
      status: cert.status as CertificateStatus,
    }));

    return {
      ...student,
      guardians,
      categories,
      documents,
      disciplinary_records: disciplinaryRecords,
      transfer_records: transferRecords,
      certificates
    };
  } catch (error) {
    console.error('Error fetching student details:', error);
    toast({
      title: 'Error',
      description: 'Failed to load student details. Please try again later.',
      variant: 'destructive',
    });
    return null;
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
    // Email is now optional, so do not throw if missing

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

    const { data: result, error } = await supabase
      .rpc('add_student_v2', {
        p_data: transformedData
      });

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    return result;
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
    // First update the profile status to inactive
    const { error: detailsError } = await supabase
      .from('student_details')
      .update({ status: 'inactive' })
      .eq('id', studentId);

    if (detailsError) throw detailsError;

    // Disable auth user login
    // Note: For safety, we're not actually deleting the user data from auth
    // We could do that, but it's generally better to keep the data and just disable access
    const { error: authError } = await supabase.rpc('update_auth_user', {
      p_user_id: studentId,
      p_banned: true
    });

    if (authError) {
      console.error('Error disabling user account:', authError);
    }

    return true;
  } catch (error) {
    console.error('Error deleting student:', error);
    toast({
      title: 'Error',
      description: 'Failed to delete student. Please try again.',
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

    // Link guardian to student
    const { error: linkError } = await supabase
      .from('student_guardians')
      .insert({
        student_id: studentId,
        guardian_id: guardian.id,
        is_primary: guardianData.is_primary || false
      });

    if (linkError) throw linkError;

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

// Create student login (calls the new SQL function)
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
    
    // Call the RPC function to create the user and profile
    const { data, error } = await supabase.rpc('create_student_login', {
      p_email: email,
      p_first_name: firstName,
      p_last_name: lastName,
      p_school_id: schoolId,
      p_password: password,
      p_student_id: studentId
    });

    if (error) {
      console.error('Error creating student login:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in createStudentLogin:', error);
    throw error;
  }
};
