import { supabase } from "@/integrations/supabase/client";
import { StudentFinancialRecord, StudentTransaction } from "@/types/finance";

export class StudentLedgerService {
  
  async getStudentFinancialRecords(schoolId: string): Promise<StudentFinancialRecord[]> {
    try {
      console.log('Fetching student financial records for school:', schoolId);
      
      // First get all student fees for the school
      const { data: studentFees, error: feesError } = await supabase
        .from('student_fees')
        .select(`
          id,
          student_id,
          fee_structure_id,
          total_amount,
          paid_amount,
          balance,
          assignment_date
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

      // Get fee structures
      const structureIds = studentFees.map(sf => sf.fee_structure_id);
      const { data: structures, error: structuresError } = await supabase
        .from('fee_structures')
        .select('id, name')
        .in('id', structureIds);

      if (structuresError) {
        console.error('Error fetching fee structures:', structuresError);
        return [];
      }

      // Get batch information for students
      const { data: batchData } = await supabase
        .from('batch_students')
        .select(`
          student_id,
          batches(name)
        `)
        .in('student_id', studentIds)
        .eq('is_current', true);

      // Create lookup maps
      const studentMap = new Map(students?.map(s => [s.id, s]) || []);
      const structureMap = new Map(structures?.map(s => [s.id, s]) || []);
      const batchMap = new Map();
      batchData?.forEach((bs: any) => {
        batchMap.set(bs.student_id, bs.batches?.name || 'Unknown Batch');
      });

      // Get last payment dates
      const studentFeeIds = studentFees.map(sf => sf.id);
      const { data: lastPayments } = await supabase
        .from('fee_payments')
        .select('student_fee_id, payment_date')
        .in('student_fee_id', studentFeeIds)
        .order('payment_date', { ascending: false });

      const lastPaymentMap = new Map();
      lastPayments?.forEach(payment => {
        if (!lastPaymentMap.has(payment.student_fee_id)) {
          lastPaymentMap.set(payment.student_fee_id, payment.payment_date);
        }
      });

      // Group by student and aggregate data
      const studentRecords = new Map<string, {
        studentId: string;
        studentName: string;
        admissionNumber: string;
        batchName: string;
        appliedStructures: Set<string>;
        totalFees: number;
        paidAmount: number;
        balance: number;
        lastPaymentDate?: string;
        transactions: StudentTransaction[];
      }>();

      studentFees.forEach((sf: any) => {
        const student = studentMap.get(sf.student_id);
        const structure = structureMap.get(sf.fee_structure_id);
        const studentId = sf.student_id;

        if (!student) return; // Skip if student not found

        if (!studentRecords.has(studentId)) {
          studentRecords.set(studentId, {
            studentId,
            studentName: `${student.first_name} ${student.last_name}`,
            admissionNumber: student.admission_number,
            batchName: batchMap.get(studentId) || 'Unknown Batch',
            appliedStructures: new Set<string>(),
            totalFees: 0,
            paidAmount: 0,
            balance: 0,
            transactions: []
          });
        }

        const record = studentRecords.get(studentId)!;
        record.appliedStructures.add(structure?.name || 'Unknown Structure');
        record.totalFees += sf.total_amount;
        record.paidAmount += sf.paid_amount;
        record.balance += sf.balance;

        const lastPaymentDate = lastPaymentMap.get(sf.id);
        if (lastPaymentDate && (!record.lastPaymentDate || lastPaymentDate > record.lastPaymentDate)) {
          record.lastPaymentDate = lastPaymentDate;
        }
      });

      return Array.from(studentRecords.values()).map(record => ({
        ...record,
        appliedStructures: Array.from(record.appliedStructures),
        transactions: [] // Will be loaded separately when student is selected
      }));

    } catch (error) {
      console.error('Error in getStudentFinancialRecords:', error);
      return [];
    }
  }

  async getStudentTransactionHistory(studentId: string): Promise<StudentTransaction[]> {
    try {
      console.log('Fetching transaction history for student:', studentId);

      const transactions: StudentTransaction[] = [];

      // Get all student fees for this student
      const { data: studentFees, error: feesError } = await supabase
        .from('student_fees')
        .select('id, total_amount, assignment_date, fee_structure_id')
        .eq('student_id', studentId)
        .order('assignment_date');

      if (feesError) {
        console.error('Error fetching student fees:', feesError);
        return [];
      }

      // Get fee structure names
      let structureNames = new Map();
      if (studentFees && studentFees.length > 0) {
        const structureIds = studentFees.map(sf => sf.fee_structure_id);
        const { data: structures } = await supabase
          .from('fee_structures')
          .select('id, name')
          .in('id', structureIds);
        
        structures?.forEach(structure => {
          structureNames.set(structure.id, structure.name);
        });
      }

      // Add fee assignment transactions
      let runningBalance = 0;
      studentFees?.forEach((sf: any) => {
        runningBalance += sf.total_amount;
        transactions.push({
          id: `fee_${sf.id}`,
          date: sf.assignment_date,
          description: `Fee Assignment - ${structureNames.get(sf.fee_structure_id) || 'Unknown Structure'}`,
          debit: sf.total_amount,
          credit: 0,
          balance: runningBalance,
          paymentMode: '',
          receiptNumber: ''
        });
      });

      // Get all payments for this student
      const studentFeeIds = studentFees?.map(sf => sf.id) || [];
      if (studentFeeIds.length > 0) {
        const { data: payments, error: paymentsError } = await supabase
          .from('fee_payments')
          .select(`
            id,
            student_fee_id,
            amount,
            payment_date,
            payment_mode,
            receipt_number,
            notes,
            fee_payment_allocations(
              allocated_amount,
              fee_components(
                name
              )
            )
          `)
          .in('student_fee_id', studentFeeIds)
          .order('payment_date');

        if (paymentsError) {
          console.error('Error fetching payments:', paymentsError);
        } else {
          // Add payment transactions
          payments?.forEach((payment: any) => {
            runningBalance -= payment.amount;
            
            // Create description based on allocations
            let description = 'Payment';
            if (payment.fee_payment_allocations && payment.fee_payment_allocations.length > 0) {
              const componentNames = payment.fee_payment_allocations
                .map((alloc: any) => alloc.fee_components?.name)
                .filter(Boolean)
                .join(', ');
              if (componentNames) {
                description += ` - ${componentNames}`;
              }
            }
            if (payment.notes) {
              description += ` (${payment.notes})`;
            }

            transactions.push({
              id: `payment_${payment.id}`,
              date: payment.payment_date,
              description,
              debit: 0,
              credit: payment.amount,
              balance: runningBalance,
              paymentMode: payment.payment_mode?.toUpperCase() || '',
              receiptNumber: payment.receipt_number || ''
            });
          });
        }
      }

      // Sort transactions by date
      transactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      // Recalculate running balances in chronological order
      let balance = 0;
      transactions.forEach(transaction => {
        balance += transaction.debit - transaction.credit;
        transaction.balance = balance;
      });

      return transactions;

    } catch (error) {
      console.error('Error in getStudentTransactionHistory:', error);
      return [];
    }
  }

  async getStudentFinancialRecord(studentId: string): Promise<StudentFinancialRecord | null> {
    try {
      console.log('Fetching detailed financial record for student:', studentId);

      // Get student basic info
      const { data: student, error: studentError } = await supabase
        .from('student_details')
        .select('first_name, last_name, admission_number, school_id')
        .eq('id', studentId)
        .single();

      if (studentError || !student) {
        console.error('Error fetching student:', studentError);
        return null;
      }

      // Get batch info
      const { data: batchData } = await supabase
        .from('batch_students')
        .select('batches(name)')
        .eq('student_id', studentId)
        .eq('is_current', true)
        .single();

             const batchName = (batchData?.batches as any)?.name || 'Unknown Batch';

      // Get fee structures and totals
      const { data: studentFees } = await supabase
        .from('student_fees')
        .select(`
          id,
          total_amount,
          paid_amount,
          balance,
          fee_structures(name)
        `)
        .eq('student_id', studentId);

      const appliedStructures = Array.from(new Set(
        studentFees?.map((sf: any) => sf.fee_structures?.name).filter(Boolean) || []
      ));

      const totalFees = studentFees?.reduce((sum: number, sf: any) => sum + sf.total_amount, 0) || 0;
      const paidAmount = studentFees?.reduce((sum: number, sf: any) => sum + sf.paid_amount, 0) || 0;
      const balance = studentFees?.reduce((sum: number, sf: any) => sum + sf.balance, 0) || 0;

      // Get last payment date
      const studentFeeIds = studentFees?.map((sf: any) => sf.id) || [];
      let lastPaymentDate: string | undefined;
      if (studentFeeIds.length > 0) {
        const { data: lastPayment } = await supabase
          .from('fee_payments')
          .select('payment_date')
          .in('student_fee_id', studentFeeIds)
          .order('payment_date', { ascending: false })
          .limit(1)
          .single();

        lastPaymentDate = lastPayment?.payment_date;
      }

      // Get transaction history
      const transactions = await this.getStudentTransactionHistory(studentId);

      return {
        studentId,
        studentName: `${student.first_name} ${student.last_name}`,
        admissionNumber: student.admission_number,
        batchName,
        appliedStructures,
        totalFees,
        paidAmount,
        balance,
        lastPaymentDate,
        transactions
      };

    } catch (error) {
      console.error('Error in getStudentFinancialRecord:', error);
      return null;
    }
  }

  async generateStatementPDF(studentId: string): Promise<Blob | null> {
    try {
      // This would typically integrate with a PDF generation service
      // For now, we'll return null and handle it in the frontend
      console.log('PDF generation for student:', studentId);
      return null;
    } catch (error) {
      console.error('Error generating PDF:', error);
      return null;
    }
  }
}

export const studentLedgerService = new StudentLedgerService(); 