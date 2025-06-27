import { supabase } from '../integrations/supabase/client';

export interface StudentFee {
  id: string;
  studentId: string;
  studentName: string;
  admissionNumber: string;
  feeStructureId: string;
  feeStructureName: string;
  academicYearId: string;
  batchId: string;
  batchName: string;
  totalAmount: number;
  paidAmount: number;
  balance: number;
  status: 'pending' | 'partial' | 'paid' | 'overdue' | 'waived';
  assignmentDate: string;
  dueDate: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FeePayment {
  id: string;
  studentFeeId: string;
  amount: number;
  paymentDate: string;
  paymentMode: 'cash' | 'card' | 'bank_transfer' | 'online' | 'cheque' | 'dd';
  receiptNumber: string | null;
  transactionId: string | null;
  referenceNumber: string | null;
  notes: string | null;
  createdBy: string;
  createdAt: string;
}

export interface FeeAssignment {
  id: string;
  feeStructureId: string;
  feeStructureName: string;
  assignmentType: 'batch' | 'individual';
  assignedBy: string;
  assignedByName: string;
  batchIds: string[];
  studentIds: string[];
  assignmentDate: string;
  studentsCount: number;
  totalAmount: number;
  notes: string | null;
  academicYearId: string;
  createdAt: string;
}

export interface AssignmentData {
  feeStructureId: string;
  assignmentType: 'batch' | 'individual';
  selectedBatches: string[];
  selectedStudents: string[];
  notes?: string;
  dueDate?: string;
}

export interface AssignmentResult {
  success: boolean;
  assignmentId: string;
  totalStudents: number;
  newAssignments: number;
  skippedStudentsCount: number;
  totalAmount: number;
  assignedStudents: {
    id: string;
    name: string;
    admissionNumber: string;
    amount: number;
  }[];
  skippedStudents: {
    id: string;
    name: string;
    admissionNumber: string;
    reason: string;
  }[];
}

export interface AssignmentPreview {
  totalStudents: number;
  newAssignments: number;
  alreadyAssigned: number;
  totalAmount: number;
  newAssignmentAmount: number;
  studentsToAssign: {
    id: string;
    name: string;
    admissionNumber: string;
    batchName: string;
  }[];
  alreadyAssignedStudents: {
    id: string;
    name: string;
    admissionNumber: string;
    batchName: string;
    assignedDate: string;
  }[];
}

export interface PaymentData {
  studentFeeId: string;
  amount: number;
  paymentDate: string;
  paymentMode: 'cash' | 'card' | 'bank_transfer' | 'online' | 'cheque' | 'dd';
  receiptNumber?: string;
  transactionId?: string;
  referenceNumber?: string;
  notes?: string;
}

class FeeAssignmentService {
  /**
   * Get preview of assignment before actually creating it
   * Shows how many students are new vs already assigned
   */
  async getAssignmentPreview(data: AssignmentData): Promise<AssignmentPreview> {
    console.log('Getting assignment preview:', data);
    
    // Get current user and school
    const { data: user, error: userError } = await supabase.auth.getUser();
    
    if (!user.user) {
      throw new Error('User not authenticated');
    }

    const { data: userRole, error: userRoleError } = await supabase
      .from('user_role_cache')
      .select('school_id, user_role')
      .eq('user_id', user.user.id)
      .single();

    if (userRoleError || !userRole?.school_id) {
      // Fallback to profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('school_id')
        .eq('id', user.user.id)
        .single();
      
      if (profileError || !profile?.school_id) {
        throw new Error(`User school not found`);
      }
      
      userRole.school_id = profile.school_id;
    }

    // Get current academic year
    const { data: academicYear, error: yearError } = await supabase
      .from('academic_years')
      .select('id')
      .eq('school_id', userRole.school_id)
      .eq('is_current', true)
      .single();

    if (yearError || !academicYear) {
      throw new Error(`Current academic year not found`);
    }

    // Get fee structure details
    const { data: feeStructure, error: structureError } = await supabase
      .from('fee_structures')
      .select('id, name, total_amount')
      .eq('id', data.feeStructureId)
      .eq('school_id', userRole.school_id)
      .single();

    if (structureError || !feeStructure) {
      throw new Error(`Fee structure not found`);
    }

    // Get all students in selection
    let allStudentsQuery;
    if (data.assignmentType === 'batch') {
      // Use the database function for batch assignments
      const { data: batchStudents, error: batchError } = await supabase
        .rpc('get_batch_students_for_fee_assignment', {
          p_batch_ids: data.selectedBatches,
          p_school_id: userRole.school_id
        });

      if (batchError) {
        throw new Error(`Error getting batch students: ${batchError.message}`);
      }

      allStudentsQuery = batchStudents || [];
    } else {
      // For individual assignment, get student details
      const { data: individualStudents, error: individualError } = await supabase
        .from('student_details')
        .select(`
          id,
          first_name,
          last_name,
          admission_number,
          batch_students!inner(
            batches!inner(
              name
            )
          )
        `)
        .in('id', data.selectedStudents)
        .eq('school_id', userRole.school_id);

      if (individualError) {
        throw new Error(`Error getting individual students: ${individualError.message}`);
      }

             // Transform to match the batch function format
       allStudentsQuery = (individualStudents || []).map(student => ({
         student_id: student.id,
         student_name: `${student.first_name} ${student.last_name}`,
         admission_number: student.admission_number,
         batch_name: (student as any).batch_students?.[0]?.batches?.name || 'No batch'
       }));
    }

    // Get students who already have this fee structure assigned
    const studentIds = allStudentsQuery.map((s: any) => s.student_id);
    const { data: existingAssignments, error: existingError } = await supabase
      .from('student_fees')
      .select(`
        student_id,
        created_at,
        student_details!inner(
          first_name,
          last_name,
          admission_number
        )
      `)
      .eq('fee_structure_id', data.feeStructureId)
      .in('student_id', studentIds);

    if (existingError) {
      console.error('Error getting existing assignments:', existingError);
      // Continue without existing assignments data
    }

    const existingStudentIds = new Set((existingAssignments || []).map(a => a.student_id));

    // Separate students into new vs already assigned
    const studentsToAssign = allStudentsQuery
      .filter((s: any) => !existingStudentIds.has(s.student_id))
      .map((s: any) => ({
        id: s.student_id,
        name: s.student_name,
        admissionNumber: s.admission_number,
        batchName: s.batch_name
      }));

         const alreadyAssignedStudents = (existingAssignments || []).map(assignment => {
       const studentData = allStudentsQuery.find((s: any) => s.student_id === assignment.student_id);
       const studentDetails = (assignment as any).student_details;
       return {
         id: assignment.student_id,
         name: `${studentDetails.first_name} ${studentDetails.last_name}`,
         admissionNumber: studentDetails.admission_number,
         batchName: studentData?.batch_name || 'Unknown batch',
         assignedDate: assignment.created_at
       };
     });

    return {
      totalStudents: allStudentsQuery.length,
      newAssignments: studentsToAssign.length,
      alreadyAssigned: alreadyAssignedStudents.length,
      totalAmount: feeStructure.total_amount * allStudentsQuery.length,
      newAssignmentAmount: feeStructure.total_amount * studentsToAssign.length,
      studentsToAssign,
      alreadyAssignedStudents
    };
  }

  /**
   * Assign fee structure to students (batch or individual)
   * Handles duplicate prevention for late joiners automatically
   */
  async assignFeeStructure(data: AssignmentData): Promise<AssignmentResult> {
    console.log('Starting fee assignment:', data);
    
    // Get current user and school
    const { data: user, error: userError } = await supabase.auth.getUser();
    console.log('Auth user:', user?.user?.id, 'Error:', userError);
    
    if (!user.user) {
      throw new Error('User not authenticated');
    }

    const { data: userRole, error: userRoleError } = await supabase
      .from('user_role_cache')
      .select('school_id, user_role')
      .eq('user_id', user.user.id)
      .single();

    console.log('User role data:', userRole, 'Error:', userRoleError);

    if (userRoleError || !userRole?.school_id) {
      // If user_role_cache fails, try getting from profiles table as fallback
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('school_id')
        .eq('id', user.user.id)
        .single();
      
      console.log('Profile fallback:', profile, 'Error:', profileError);
      
      if (profileError || !profile?.school_id) {
        throw new Error(`User school not found. UserRole Error: ${userRoleError?.message}, Profile Error: ${profileError?.message}`);
      }
      
      // Use profile school_id
      userRole.school_id = profile.school_id;
    }

    console.log('Using school_id:', userRole.school_id);

    // Get current academic year
    const { data: academicYear, error: yearError } = await supabase
      .from('academic_years')
      .select('id')
      .eq('school_id', userRole.school_id)
      .eq('is_current', true)
      .single();

    console.log('Academic year:', academicYear, 'Error:', yearError);

    if (yearError || !academicYear) {
      throw new Error(`Current academic year not found: ${yearError?.message}`);
    }

    // Validate fee structure exists and belongs to school
    const { data: feeStructure, error: structureError } = await supabase
      .from('fee_structures')
      .select('id, name, total_amount')
      .eq('id', data.feeStructureId)
      .eq('school_id', userRole.school_id)
      .single();

    console.log('Fee structure:', feeStructure, 'Error:', structureError);

    if (structureError || !feeStructure) {
      throw new Error(`Fee structure not found or access denied: ${structureError?.message}`);
    }

    // Get eligible students (those who don't already have this fee structure)
    console.log('Getting eligible students...');
    const eligibleStudents = await this.getEligibleStudents(
      data.assignmentType,
      data.selectedBatches,
      data.selectedStudents,
      data.feeStructureId,
      academicYear.id,
      userRole.school_id
    );

    console.log('Eligible students:', eligibleStudents.length);

    if (eligibleStudents.length === 0) {
      return {
        success: true,
        assignmentId: '',
        totalStudents: data.assignmentType === 'batch' 
          ? await this.getTotalStudentsInBatches(data.selectedBatches, academicYear.id)
          : data.selectedStudents.length,
        newAssignments: 0,
        skippedStudentsCount: data.assignmentType === 'batch' 
          ? await this.getTotalStudentsInBatches(data.selectedBatches, academicYear.id)
          : data.selectedStudents.length,
        totalAmount: 0,
        assignedStudents: [],
        skippedStudents: await this.getSkippedStudentsDetails(
          data.assignmentType === 'batch' ? data.selectedBatches : data.selectedStudents,
          data.assignmentType,
          data.feeStructureId,
          academicYear.id
        )
      };
    }

    // Create fee assignment record
    console.log('Creating assignment record...');
    const assignmentData = {
      fee_structure_id: data.feeStructureId,
      assignment_type: data.assignmentType,
      assigned_by: user.user.id,
      batch_ids: data.assignmentType === 'batch' ? data.selectedBatches : [],
      student_ids: data.assignmentType === 'individual' ? data.selectedStudents : eligibleStudents.map(s => s.student_id),
      assignment_date: new Date().toISOString().split('T')[0],
      students_count: eligibleStudents.length,
      total_amount: eligibleStudents.length * feeStructure.total_amount,
      notes: data.notes || null,
      school_id: userRole.school_id,
      academic_year_id: academicYear.id
    };
    
    console.log('Assignment data to insert:', assignmentData);

    const { data: assignment, error: assignmentError } = await supabase
      .from('fee_assignments')
      .insert(assignmentData)
      .select()
      .single();

    console.log('Assignment result:', assignment, 'Error:', assignmentError);

    if (assignmentError) {
      throw new Error(`Failed to create assignment record: ${assignmentError.message}`);
    }

    // Create individual student fee records
    const studentFeeRecords = eligibleStudents.map(student => ({
      student_id: student.student_id,
      fee_structure_id: data.feeStructureId,
      academic_year_id: academicYear.id,
      batch_id: student.batch_id,
      school_id: userRole.school_id,
      total_amount: feeStructure.total_amount,
      paid_amount: 0,
      status: 'pending' as const,
      assignment_date: new Date().toISOString().split('T')[0],
      due_date: data.dueDate || null,
      notes: data.notes || null
    }));

    const { error: studentFeesError } = await supabase
      .from('student_fees')
      .insert(studentFeeRecords);

    if (studentFeesError) {
      // Cleanup: delete the assignment record if student fees creation failed
      await supabase.from('fee_assignments').delete().eq('id', assignment.id);
      throw new Error(`Failed to create student fee records: ${studentFeesError.message}`);
    }

    // Get skipped students details
    const totalStudents = data.assignmentType === 'batch' 
      ? await this.getTotalStudentsInBatches(data.selectedBatches, academicYear.id)
      : data.selectedStudents.length;

    const skippedStudents = await this.getSkippedStudentsDetails(
      data.assignmentType === 'batch' ? data.selectedBatches : data.selectedStudents,
      data.assignmentType,
      data.feeStructureId,
      academicYear.id
    );

    return {
      success: true,
      assignmentId: assignment.id,
      totalStudents,
      newAssignments: eligibleStudents.length,
      skippedStudentsCount: totalStudents - eligibleStudents.length,
      totalAmount: eligibleStudents.length * feeStructure.total_amount,
      assignedStudents: eligibleStudents.map(student => ({
        id: student.student_id,
        name: student.student_name,
        admissionNumber: student.admission_number,
        amount: feeStructure.total_amount
      })),
      skippedStudents: skippedStudents
    };
  }

  /**
   * Get eligible students who don't already have the fee structure assigned
   */
  private async getEligibleStudents(
    assignmentType: 'batch' | 'individual',
    selectedBatches: string[],
    selectedStudents: string[],
    feeStructureId: string,
    academicYearId: string,
    schoolId: string
  ): Promise<Array<{
    student_id: string;
    student_name: string;
    admission_number: string;
    batch_id: string;
    batch_name: string;
  }>> {
    console.log('🔍 Getting eligible students:', { assignmentType, selectedBatches, selectedStudents, feeStructureId, academicYearId });

    if (assignmentType === 'batch') {
      // Get ALL students from selected batches (regardless of academic year)
      const { data: batchStudents, error: batchError } = await supabase
        .rpc('get_batch_students_for_fee_assignment', {
          p_batch_ids: selectedBatches,
          p_school_id: schoolId
        });

      if (batchError) {
        console.error('Error fetching batch students:', batchError);
        // Fallback to direct query
        const { data: directQuery, error: directError } = await supabase
          .from('batch_students')
          .select(`
            student_id,
            batch_id
          `)
          .in('batch_id', selectedBatches)
          .eq('is_current', true)
          .eq('status', 'active');

        if (directError) {
          throw new Error(`Failed to fetch batch students: ${directError.message}`);
        }

        // Get student and batch details separately
        const studentIds = directQuery?.map(s => s.student_id) || [];
        
        const [profilesResponse, batchesResponse] = await Promise.all([
          supabase
            .from('profiles')
            .select('id, first_name, last_name, student_details(admission_number)')
            .in('id', studentIds)
            .eq('school_id', schoolId),
          supabase
            .from('batches')
            .select('id, name')
            .in('id', selectedBatches)
        ]);

        if (profilesResponse.error) {
          throw new Error(`Failed to fetch student profiles: ${profilesResponse.error.message}`);
        }

        if (batchesResponse.error) {
          throw new Error(`Failed to fetch batch details: ${batchesResponse.error.message}`);
        }

        // Combine data manually
        const combinedData = directQuery?.map(bs => {
          const profile = profilesResponse.data?.find(p => p.id === bs.student_id);
          const batch = batchesResponse.data?.find(b => b.id === bs.batch_id);
          
          if (!profile || !batch) return null;
          
          return {
            student_id: bs.student_id,
            student_name: `${profile.first_name} ${profile.last_name}`,
            admission_number: (profile.student_details as any)?.[0]?.admission_number || 'N/A',
            batch_id: bs.batch_id,
            batch_name: batch.name
          };
        }).filter(Boolean) || [];

        console.log('📊 Found students from fallback query:', combinedData.length);

        // Filter out students who already have this fee structure
        const eligibleStudents = [];
        for (const student of combinedData) {
          const { data: existingFee } = await supabase
            .from('student_fees')
            .select('id')
            .eq('student_id', student.student_id)
            .eq('fee_structure_id', feeStructureId)
            .eq('academic_year_id', academicYearId)
            .maybeSingle();

          if (!existingFee) {
            eligibleStudents.push(student);
          }
        }

        console.log('✅ Eligible students after filtering:', eligibleStudents.length);
        return eligibleStudents;
      }

      // Use RPC result if available
      const eligibleStudents = [];
      for (const student of batchStudents || []) {
        const { data: existingFee } = await supabase
          .from('student_fees')
          .select('id')
          .eq('student_id', student.student_id)
          .eq('fee_structure_id', feeStructureId)
          .eq('academic_year_id', academicYearId)
          .maybeSingle();

        if (!existingFee) {
          eligibleStudents.push(student);
        }
      }

      return eligibleStudents;
    } else {
      // Individual assignment logic
      const studentDetails = [];
      
      for (const studentId of selectedStudents) {
        // Get student profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select(`
            id,
            first_name,
            last_name,
            student_details(admission_number)
          `)
          .eq('id', studentId)
          .eq('school_id', schoolId)
          .single();

        if (profileError || !profile) continue;

        // Get current batch
        const { data: batchInfo, error: batchError } = await supabase
          .from('batch_students')
          .select(`
            batch_id,
            batches(id, name)
          `)
          .eq('student_id', studentId)
          .eq('is_current', true)
          .eq('status', 'active')
          .single();

        if (batchError || !batchInfo) continue;

        // Check if student already has this fee structure
        const { data: existingFee } = await supabase
          .from('student_fees')
          .select('id')
          .eq('student_id', studentId)
          .eq('fee_structure_id', feeStructureId)
          .eq('academic_year_id', academicYearId)
          .maybeSingle();

        if (!existingFee) {
          studentDetails.push({
            student_id: studentId,
            student_name: `${profile.first_name} ${profile.last_name}`,
            admission_number: (profile.student_details as any)?.[0]?.admission_number || 'N/A',
            batch_id: batchInfo.batch_id,
            batch_name: (batchInfo.batches as any)?.name || 'Unknown'
          });
        }
      }

      return studentDetails;
    }
  }

  /**
   * Get total number of students in selected batches
   */
  private async getTotalStudentsInBatches(batchIds: string[], academicYearId: string): Promise<number> {
    const { count, error } = await supabase
      .from('batch_students')
      .select('*', { count: 'exact', head: true })
      .in('batch_id', batchIds)
      .eq('academic_year_id', academicYearId);

    if (error) {
      throw new Error(`Failed to count batch students: ${error.message}`);
    }

    return count || 0;
  }

  /**
   * Get details of students who were skipped (already have the fee structure)
   */
  private async getSkippedStudentsDetails(
    targetIds: string[],
    type: 'batch' | 'individual',
    feeStructureId: string,
    academicYearId: string
  ): Promise<Array<{
    id: string;
    name: string;
    admissionNumber: string;
    reason: string;
  }>> {
    if (type === 'batch') {
      // Get all students in the selected batches who already have the fee structure
      const { data: studentsWithFee, error } = await supabase
        .from('batch_students')
        .select(`
          student_id,
          student_details!inner (
            id,
            first_name,
            last_name,
            admission_number
          ),
          student_fees!inner (
            id,
            fee_structure_id,
            academic_year_id
          )
        `)
        .in('batch_id', targetIds)
        .eq('academic_year_id', academicYearId)
        .eq('student_fees.fee_structure_id', feeStructureId)
        .eq('student_fees.academic_year_id', academicYearId);

      if (error) {
        console.error('Error fetching skipped students:', error);
        return [];
      }

      return (studentsWithFee as any[]).map((student: any) => ({
        id: student.student_id,
        name: `${student.student_details.first_name} ${student.student_details.last_name}`,
        admissionNumber: student.student_details.admission_number,
        reason: 'Already has this fee structure assigned'
      }));
    } else {
      // Get selected individual students who already have the fee structure
      const { data: studentsWithFee, error } = await supabase
        .from('student_details')
        .select(`
          id,
          first_name,
          last_name,
          admission_number,
          student_fees!inner (
            id,
            fee_structure_id,
            academic_year_id
          )
        `)
        .in('id', targetIds)
        .eq('student_fees.fee_structure_id', feeStructureId)
        .eq('student_fees.academic_year_id', academicYearId);

      if (error) {
        console.error('Error fetching skipped students:', error);
        return [];
      }

      return studentsWithFee.map(student => ({
        id: student.id,
        name: `${student.first_name} ${student.last_name}`,
        admissionNumber: student.admission_number,
        reason: 'Already has this fee structure assigned'
      }));
    }
  }

  /**
   * Get all fee assignments for the current school
   */
  async getFeeAssignments(): Promise<FeeAssignment[]> {
    const { data: assignments, error } = await supabase
      .from('fee_assignments')
      .select(`
        *,
        fee_structures!inner (
          name
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch fee assignments: ${error.message}`);
    }

    // Get user details separately for each assignment
    const assignmentsWithUsers = await Promise.all(
      assignments.map(async (assignment) => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name, last_name, email')
          .eq('id', assignment.assigned_by)
          .single();

        return {
          id: assignment.id,
          feeStructureId: assignment.fee_structure_id,
          feeStructureName: assignment.fee_structures.name,
          assignmentType: assignment.assignment_type,
          assignedBy: assignment.assigned_by,
          assignedByName: profile 
            ? `${profile.first_name} ${profile.last_name}` 
            : 'Unknown',
          batchIds: assignment.batch_ids || [],
          studentIds: assignment.student_ids || [],
          assignmentDate: assignment.assignment_date,
          studentsCount: assignment.students_count,
          totalAmount: assignment.total_amount,
          notes: assignment.notes,
          academicYearId: assignment.academic_year_id,
          createdAt: assignment.created_at
        };
      })
    );

    return assignmentsWithUsers;
  }

  /**
   * Get student fees with detailed information
   */
  async getStudentFees(filters?: {
    studentId?: string;
    feeStructureId?: string;
    status?: string;
    batchId?: string;
  }): Promise<StudentFee[]> {
    let query = supabase
      .from('student_fees')
      .select(`
        *,
        student_details!inner (
          first_name,
          last_name,
          admission_number
        ),
        fee_structures!inner (
          name
        ),
        batches!inner (
          name
        )
      `);

    if (filters?.studentId) {
      query = query.eq('student_id', filters.studentId);
    }
    if (filters?.feeStructureId) {
      query = query.eq('fee_structure_id', filters.feeStructureId);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.batchId) {
      query = query.eq('batch_id', filters.batchId);
    }

    const { data: studentFees, error } = await query.order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch student fees: ${error.message}`);
    }

    return studentFees.map(fee => ({
      id: fee.id,
      studentId: fee.student_id,
      studentName: `${fee.student_details.first_name} ${fee.student_details.last_name}`,
      admissionNumber: fee.student_details.admission_number,
      feeStructureId: fee.fee_structure_id,
      feeStructureName: fee.fee_structures.name,
      academicYearId: fee.academic_year_id,
      batchId: fee.batch_id,
      batchName: fee.batches.name,
      totalAmount: fee.total_amount,
      paidAmount: fee.paid_amount,
      balance: fee.balance,
      status: fee.status,
      assignmentDate: fee.assignment_date,
      dueDate: fee.due_date,
      notes: fee.notes,
      createdAt: fee.created_at,
      updatedAt: fee.updated_at
    }));
  }

  /**
   * Record a fee payment
   */
  async recordPayment(data: PaymentData): Promise<FeePayment> {
    // Get current user
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      throw new Error('User not authenticated');
    }

    const { data: userRole, error: userError } = await supabase
      .from('user_role_cache')
      .select('school_id')
      .eq('user_id', user.user.id)
      .single();

    if (userError || !userRole?.school_id) {
      throw new Error('User school not found');
    }

    // Validate student fee exists and get current paid amount
    const { data: studentFee, error: feeError } = await supabase
      .from('student_fees')
      .select('id, total_amount, paid_amount, school_id')
      .eq('id', data.studentFeeId)
      .eq('school_id', userRole.school_id)
      .single();

    if (feeError || !studentFee) {
      throw new Error('Student fee record not found or access denied');
    }

    // Validate payment amount
    const remainingBalance = studentFee.total_amount - studentFee.paid_amount;
    if (data.amount > remainingBalance) {
      throw new Error(`Payment amount (${data.amount}) exceeds remaining balance (${remainingBalance})`);
    }

    // Create payment record
    const { data: payment, error: paymentError } = await supabase
      .from('fee_payments')
      .insert({
        student_fee_id: data.studentFeeId,
        amount: data.amount,
        payment_date: data.paymentDate,
        payment_mode: data.paymentMode,
        receipt_number: data.receiptNumber || null,
        transaction_id: data.transactionId || null,
        reference_number: data.referenceNumber || null,
        notes: data.notes || null,
        created_by: user.user.id,
        school_id: userRole.school_id
      })
      .select()
      .single();

    if (paymentError) {
      throw new Error(`Failed to record payment: ${paymentError.message}`);
    }

    // Update student fee paid amount and status
    const newPaidAmount = studentFee.paid_amount + data.amount;
    const newStatus = newPaidAmount >= studentFee.total_amount ? 'paid' : 
                     newPaidAmount > 0 ? 'partial' : 'pending';

    const { error: updateError } = await supabase
      .from('student_fees')
      .update({
        paid_amount: newPaidAmount,
        status: newStatus
      })
      .eq('id', data.studentFeeId);

    if (updateError) {
      // Rollback: delete the payment record
      await supabase.from('fee_payments').delete().eq('id', payment.id);
      throw new Error(`Failed to update student fee: ${updateError.message}`);
    }

    return {
      id: payment.id,
      studentFeeId: payment.student_fee_id,
      amount: payment.amount,
      paymentDate: payment.payment_date,
      paymentMode: payment.payment_mode,
      receiptNumber: payment.receipt_number,
      transactionId: payment.transaction_id,
      referenceNumber: payment.reference_number,
      notes: payment.notes,
      createdBy: payment.created_by,
      createdAt: payment.created_at
    };
  }

  /**
   * Get payments for a student fee
   */
  async getPayments(studentFeeId: string): Promise<FeePayment[]> {
    const { data: payments, error } = await supabase
      .from('fee_payments')
      .select('*')
      .eq('student_fee_id', studentFeeId)
      .order('payment_date', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch payments: ${error.message}`);
    }

    return payments.map(payment => ({
      id: payment.id,
      studentFeeId: payment.student_fee_id,
      amount: payment.amount,
      paymentDate: payment.payment_date,
      paymentMode: payment.payment_mode,
      receiptNumber: payment.receipt_number,
      transactionId: payment.transaction_id,
      referenceNumber: payment.reference_number,
      notes: payment.notes,
      createdBy: payment.created_by,
      createdAt: payment.created_at
    }));
  }

  /**
   * Delete a fee assignment and all related student fees
   */
  async deleteFeeAssignment(assignmentId: string): Promise<void> {
    // First get the assignment to get student IDs
    const { data: assignment, error: assignmentFetchError } = await supabase
      .from('fee_assignments')
      .select('student_ids')
      .eq('id', assignmentId)
      .single();

    if (assignmentFetchError || !assignment) {
      throw new Error(`Failed to fetch fee assignment: ${assignmentFetchError?.message}`);
    }

    // Delete all student fees created by this assignment
    if (assignment.student_ids && assignment.student_ids.length > 0) {
      const { error: studentFeesError } = await supabase
        .from('student_fees')
        .delete()
        .in('student_id', assignment.student_ids);

      if (studentFeesError) {
        throw new Error(`Failed to delete student fees: ${studentFeesError.message}`);
      }
    }

    // Then delete the assignment record
    const { error: assignmentError } = await supabase
      .from('fee_assignments')
      .delete()
      .eq('id', assignmentId);

    if (assignmentError) {
      throw new Error(`Failed to delete fee assignment: ${assignmentError.message}`);
    }
  }
}

export const feeAssignmentService = new FeeAssignmentService();