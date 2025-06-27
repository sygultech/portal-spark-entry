import { supabase } from "@/integrations/supabase/client";
import { DuesSummary } from "@/types/finance";

export interface DuesReportSummary {
  totalStudents: number;
  paidStudents: number;
  partialPayments: number;
  overdueStudents: number;
  totalCollected: number;
  totalOutstanding: number;
  collectionRate: number;
}

export interface BatchDuesReport {
  batchName: string;
  totalStudents: number;
  paidStudents: number;
  totalFees: number;
  collectedAmount: number;
  outstandingAmount: number;
  collectionRate: number;
}

export class DuesReportsService {
  
  async getDuesSummary(schoolId: string): Promise<DuesSummary[]> {
    try {
      console.log('Fetching dues summary for school:', schoolId);
      
      // Get all student fees with student details
      const { data: studentFees, error: feesError } = await supabase
        .from('student_fees')
        .select(`
          id,
          student_id,
          total_amount,
          paid_amount,
          balance,
          due_date,
          status
        `)
        .eq('school_id', schoolId);

      if (feesError) {
        console.error('Error fetching student fees:', feesError);
        return [];
      }

      if (!studentFees || studentFees.length === 0) {
        console.log('No student fees found for school');
        return [];
      }

      // Get student details
      const studentIds = studentFees.map(sf => sf.student_id);
      const { data: students, error: studentsError } = await supabase
        .from('student_details')
        .select('id, first_name, last_name, admission_number')
        .in('id', studentIds);

      if (studentsError) {
        console.error('Error fetching students:', studentsError);
        return [];
      }

      // Get batch information
      const { data: batchData } = await supabase
        .from('batch_students')
        .select(`
          student_id,
          batches(name)
        `)
        .in('student_id', studentIds)
        .eq('is_current', true);

      // Get last payment dates
      const studentFeeIds = studentFees.map(sf => sf.id);
      const { data: lastPayments } = await supabase
        .from('fee_payments')
        .select('student_fee_id, payment_date')
        .in('student_fee_id', studentFeeIds)
        .order('payment_date', { ascending: false });

      // Create lookup maps
      const studentMap = new Map(students?.map(s => [s.id, s]) || []);
      const batchMap = new Map();
      batchData?.forEach((bs: any) => {
        batchMap.set(bs.student_id, bs.batches?.name || 'Unknown Batch');
      });
      
      const lastPaymentMap = new Map();
      lastPayments?.forEach(payment => {
        if (!lastPaymentMap.has(payment.student_fee_id)) {
          lastPaymentMap.set(payment.student_fee_id, payment.payment_date);
        }
      });

      // Group by student and calculate dues
      const studentDues = new Map<string, {
        studentId: string;
        studentName: string;
        admissionNumber: string;
        batchName: string;
        totalFees: number;
        paidAmount: number;
        balance: number;
        lastPaymentDate?: string;
        dueDate?: string;
        status: 'paid' | 'partial' | 'overdue';
      }>();

      const now = new Date();

      studentFees.forEach((sf: any) => {
        const student = studentMap.get(sf.student_id);
        if (!student) return;

        const studentId = sf.student_id;
        if (!studentDues.has(studentId)) {
          studentDues.set(studentId, {
            studentId,
            studentName: `${student.first_name || ''} ${student.last_name || ''}`.trim() || 'Unknown Student',
            admissionNumber: student.admission_number || 'N/A',
            batchName: batchMap.get(studentId) || 'Unknown Batch',
            totalFees: 0,
            paidAmount: 0,
            balance: 0,
            status: 'paid'
          });
        }

        const record = studentDues.get(studentId)!;
        record.totalFees += Number(sf.total_amount || 0);
        record.paidAmount += Number(sf.paid_amount || 0);
        record.balance += Number(sf.balance || 0);

        // Update due date to earliest due date
        if (sf.due_date && (!record.dueDate || sf.due_date < record.dueDate)) {
          record.dueDate = sf.due_date;
        }

        // Update last payment date
        const lastPaymentDate = lastPaymentMap.get(sf.id);
        if (lastPaymentDate && (!record.lastPaymentDate || lastPaymentDate > record.lastPaymentDate)) {
          record.lastPaymentDate = lastPaymentDate;
        }
      });

      // Convert to DuesSummary array and calculate status/days past due
      return Array.from(studentDues.values()).map(record => {
        let status: 'paid' | 'partial' | 'overdue' = 'paid';
        let daysPastDue: number | undefined;

        if (record.balance > 0) {
          status = 'partial';
          
          // Check if overdue - if due date exists and is past
          if (record.dueDate) {
            const dueDate = new Date(record.dueDate);
            if (dueDate < now) {
              status = 'overdue';
              daysPastDue = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
            }
          } else {
            // If no due date but has balance, consider as partial payment
            // This handles cases where status in DB might be 'pending' or other values
            status = 'partial';
          }
        }

        return {
          studentId: record.studentId,
          studentName: record.studentName,
          admissionNumber: record.admissionNumber,
          batchName: record.batchName,
          totalFees: record.totalFees,
          paidAmount: record.paidAmount,
          balance: record.balance,
          lastPaymentDate: record.lastPaymentDate,
          status,
          daysPastDue
        };
      });

    } catch (error) {
      console.error('Error in getDuesSummary:', error);
      return [];
    }
  }

  async getDuesReportSummary(schoolId: string): Promise<DuesReportSummary> {
    try {
      const duesData = await this.getDuesSummary(schoolId);
      
      const totalStudents = duesData.length;
      const paidStudents = duesData.filter(d => d.status === 'paid').length;
      const partialPayments = duesData.filter(d => d.status === 'partial').length;
      const overdueStudents = duesData.filter(d => d.status === 'overdue').length;
      const totalCollected = duesData.reduce((sum, d) => sum + d.paidAmount, 0);
      const totalOutstanding = duesData.reduce((sum, d) => sum + d.balance, 0);
      const collectionRate = totalStudents > 0 ? Math.round((paidStudents / totalStudents) * 100) : 0;

      return {
        totalStudents,
        paidStudents,
        partialPayments,
        overdueStudents,
        totalCollected,
        totalOutstanding,
        collectionRate
      };
    } catch (error) {
      console.error('Error in getDuesReportSummary:', error);
      return {
        totalStudents: 0,
        paidStudents: 0,
        partialPayments: 0,
        overdueStudents: 0,
        totalCollected: 0,
        totalOutstanding: 0,
        collectionRate: 0
      };
    }
  }

  async getBatchDuesReport(schoolId: string): Promise<BatchDuesReport[]> {
    try {
      console.log('Fetching batch dues report for school:', schoolId);
      
      const duesData = await this.getDuesSummary(schoolId);
      
      // Group by batch
      const batchMap = new Map<string, {
        batchName: string;
        students: DuesSummary[];
      }>();

      duesData.forEach(student => {
        if (!batchMap.has(student.batchName)) {
          batchMap.set(student.batchName, {
            batchName: student.batchName,
            students: []
          });
        }
        batchMap.get(student.batchName)!.students.push(student);
      });

      // Calculate batch statistics
      return Array.from(batchMap.values()).map(batch => {
        const totalStudents = batch.students.length;
        const paidStudents = batch.students.filter(s => s.status === 'paid').length;
        const totalFees = batch.students.reduce((sum, s) => sum + s.totalFees, 0);
        const collectedAmount = batch.students.reduce((sum, s) => sum + s.paidAmount, 0);
        const outstandingAmount = batch.students.reduce((sum, s) => sum + s.balance, 0);
        const collectionRate = totalStudents > 0 ? Math.round((paidStudents / totalStudents) * 100) : 0;

        return {
          batchName: batch.batchName,
          totalStudents,
          paidStudents,
          totalFees,
          collectedAmount,
          outstandingAmount,
          collectionRate
        };
      }).sort((a, b) => a.batchName.localeCompare(b.batchName));

    } catch (error) {
      console.error('Error in getBatchDuesReport:', error);
      return [];
    }
  }

  async getAvailableBatches(schoolId: string): Promise<string[]> {
    try {
      const { data: batches, error } = await supabase
        .from('batches')
        .select('name')
        .eq('school_id', schoolId)
        .order('name');

      if (error) {
        console.error('Error fetching batches:', error);
        return [];
      }

      return batches?.map(b => b.name) || [];
    } catch (error) {
      console.error('Error in getAvailableBatches:', error);
      return [];
    }
  }

  async exportDuesReport(
    schoolId: string, 
    format: 'csv' | 'pdf' | 'excel',
    filters?: {
      batch?: string;
      status?: string;
      search?: string;
    }
  ): Promise<Blob | null> {
    try {
      console.log(`Exporting dues report in ${format} format for school:`, schoolId);
      
      let duesData = await this.getDuesSummary(schoolId);
      
      // Apply filters
      if (filters) {
        if (filters.batch && filters.batch !== 'all') {
          duesData = duesData.filter(d => d.batchName === filters.batch);
        }
        
        if (filters.status && filters.status !== 'all') {
          duesData = duesData.filter(d => d.status === filters.status);
        }
        
        if (filters.search) {
          const searchTerm = filters.search.toLowerCase();
          duesData = duesData.filter(d => 
            d.studentName.toLowerCase().includes(searchTerm) ||
            d.admissionNumber.includes(searchTerm) ||
            d.batchName.toLowerCase().includes(searchTerm)
          );
        }
      }

      if (format === 'csv') {
        return this.generateCSVReport(duesData);
      } else if (format === 'pdf') {
        return this.generatePDFReport(duesData);
      } else if (format === 'excel') {
        return this.generateExcelReport(duesData);
      }

      return null;
    } catch (error) {
      console.error('Error in exportDuesReport:', error);
      return null;
    }
  }

  private generateCSVReport(data: DuesSummary[]): Blob {
    const headers = [
      'Student Name',
      'Admission Number',
      'Batch',
      'Total Fees',
      'Paid Amount',
      'Balance',
      'Last Payment Date',
      'Days Past Due',
      'Status'
    ];

    const csvContent = [
      headers.join(','),
      ...data.map(record => [
        `"${record.studentName}"`,
        record.admissionNumber,
        `"${record.batchName}"`,
        record.totalFees,
        record.paidAmount,
        record.balance,
        record.lastPaymentDate ? new Date(record.lastPaymentDate).toLocaleDateString() : '',
        record.daysPastDue || '',
        record.status
      ].join(','))
    ].join('\n');

    return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  }

  private generatePDFReport(data: DuesSummary[]): Blob | null {
    // This would typically integrate with a PDF generation library like jsPDF
    // For now, we'll return null and handle it in the frontend
    console.log('PDF generation would be implemented here with jsPDF or similar');
    return null;
  }

  private generateExcelReport(data: DuesSummary[]): Blob | null {
    // This would typically integrate with an Excel generation library like SheetJS
    // For now, we'll return null and handle it in the frontend
    console.log('Excel generation would be implemented here with SheetJS or similar');
    return null;
  }
}

export const duesReportsService = new DuesReportsService(); 