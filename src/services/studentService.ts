
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
  student_details:student_details (
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
  batches:student_details (
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

// Fetch a single student by ID with all related details
export const fetchStudentDetails = async (studentId: string): Promise<StudentWithDetails> => {
  try {
    // Fetch the student profile and basic details
    const { data: studentData, error: studentError } = await supabase
      .from('profiles')
      .select(studentQuery)
      .eq('id', studentId)
      .eq('role', 'student')
      .single();

    if (studentError) throw studentError;

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

    if (guardiansError) throw guardiansError;

    const guardians: Guardian[] = guardiansData.map(item => ({
      ...(item.guardians as Guardian),
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

    if (categoriesError) throw categoriesError;

    const categories: StudentCategory[] = categoriesData.map(item => item.category as StudentCategory);

    // Fetch documents
    const { data: documentsData, error: documentsError } = await supabase
      .from('student_documents')
      .select('*')
      .eq('student_id', studentId);

    if (documentsError) throw documentsError;

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

    if (disciplinaryError) throw disciplinaryError;

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

    if (transferError) throw transferError;

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

    if (certificatesError) throw certificatesError;

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
export const createStudent = async (data: NewStudentFormData, schoolId: string): Promise<Student | null> => {
  try {
    // Generate admission number if not provided
    let admissionNumber = data.admission_number;
    if (!admissionNumber) {
      admissionNumber = await generateAdmissionNumber(schoolId);
    }

    // Step 1: Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: Math.random().toString(36).slice(-8), // Generate a random password
      options: {
        data: {
          first_name: data.first_name,
          last_name: data.last_name,
          role: 'student'
        }
      }
    });

    if (authError) throw authError;

    const userId = authData.user.id;

    // Step 2: Create student details
    const { error: detailsError } = await supabase
      .from('student_details')
      .insert({
        id: userId,
        admission_number: admissionNumber,
        date_of_birth: data.date_of_birth,
        gender: data.gender,
        address: data.address,
        batch_id: data.batch_id,
        nationality: data.nationality,
        mother_tongue: data.mother_tongue,
        blood_group: data.blood_group,
        religion: data.religion,
        caste: data.caste,
        category: data.category,
        phone: data.phone,
        previous_school_name: data.previous_school_name,
        previous_school_board: data.previous_school_board,
        previous_school_year: data.previous_school_year,
        previous_school_percentage: data.previous_school_percentage,
        school_id: schoolId,
      });

    if (detailsError) throw detailsError;

    // Step 3: Upload avatar if provided
    if (data.avatar) {
      const avatarPath = `${schoolId}/${userId}/avatar`;
      const { error: uploadError } = await supabase.storage
        .from('student_files')
        .upload(avatarPath, data.avatar);

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
          .eq('id', userId);
      }
    }

    // Step 4: Add guardians if provided
    if (data.guardians && data.guardians.length > 0) {
      for (const guardianData of data.guardians) {
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
          console.error('Error creating guardian:', guardianError);
          continue;
        }

        // Link guardian to student
        await supabase
          .from('student_guardians')
          .insert({
            student_id: userId,
            guardian_id: guardian.id,
            is_primary: guardianData.is_primary
          });
      }
    }

    // Step 5: Upload documents if provided
    if (data.documents && data.documents.length > 0) {
      for (const docData of data.documents) {
        const docPath = `${schoolId}/${userId}/documents/${docData.name}-${Date.now()}`;
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
            student_id: userId,
            name: docData.name,
            type: docData.type,
            description: docData.description,
            file_path: publicUrlData.publicUrl,
            school_id: schoolId
          });
      }
    }

    // Return the created student
    return await fetchStudentDetails(userId);

  } catch (error) {
    console.error('Error creating student:', error);
    toast({
      title: 'Error',
      description: 'Failed to create student. Please try again.',
      variant: 'destructive',
    });
    return null;
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
      const result = await createStudent(student, schoolId);
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
