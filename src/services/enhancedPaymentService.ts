import { supabase } from '../integrations/supabase/client';
import type { 
  StudentPaymentContext, 
  PaymentAllocation, 
  NewPaymentData, 
  ValidationResult, 
  PaymentResult 
} from '../types/finance';

export class EnhancedPaymentService {
  async getStudentPaymentContext(studentId: string): Promise<StudentPaymentContext | null> {
    try {
      // Get student details
      const { data: student, error: studentError } = await supabase
        .from('student_details')
        .select(`
          id,
          first_name,
          last_name,
          admission_number
        `)
        .eq('id', studentId)
        .single();

      if (studentError || !student) {
        console.error('Error fetching student:', studentError);
        return null;
      }

      // Get current batch name through batch_students junction table
      let batchName = 'Unknown Batch';
      const { data: batchStudent } = await supabase
        .from('batch_students')
        .select(`
          batches(name)
        `)
        .eq('student_id', studentId)
        .eq('is_current', true)
        .single();
      
      if (batchStudent && batchStudent.batches) {
        batchName = (batchStudent.batches as any).name;
      }

      // Get student fee assignments with structures and components
      const { data: studentFees, error: feesError } = await supabase
        .from('student_fees')
        .select(`
          id,
          assignment_date,
          due_date,
          total_amount,
          paid_amount,
          balance,
          status,
          fee_structures!inner(
            id,
            name,
            academic_year,
            fee_components(
              id,
              name,
              amount,
              due_date,
              recurring
            )
          )
        `)
        .eq('student_id', studentId);

      if (feesError) {
        console.error('Error fetching student fees:', feesError);
        return null;
      }

      // Get payment history with allocations  
      // First, get student fee IDs for this student
      const studentFeeIds = studentFees?.map(sf => sf.id) || [];
      
      let payments: any[] = [];
      let paymentsError: any = null;
      
      if (studentFeeIds.length > 0) {
        const result = await supabase
          .from('fee_payments')
          .select(`
            id,
            payment_date,
            amount,
            payment_mode,
            receipt_number,
            created_by,
            fee_payment_allocations(
              id,
              allocated_amount,
              fee_components(
                id,
                name,
                fee_structures(
                  id,
                  name
                )
              )
            )
          `)
          .in('student_fee_id', studentFeeIds)
          .order('payment_date', { ascending: false });
          
        payments = result.data || [];
        paymentsError = result.error;
      }

      if (paymentsError) {
        console.error('Error fetching payments:', paymentsError);
        return null;
      }

      // Calculate component-level paid amounts and balances
      const componentPayments = new Map<string, number>();
      
      payments?.forEach(payment => {
        payment.fee_payment_allocations?.forEach((allocation: any) => {
          const componentId = allocation.fee_components?.id;
          if (componentId) {
            const currentPaid = componentPayments.get(componentId) || 0;
            componentPayments.set(componentId, currentPaid + allocation.allocated_amount);
          }
        });
      });

      // Build fee structures with component details
      const feeStructures = studentFees?.map((sf: any) => {
        const structure = sf.fee_structures;
        const components = structure.fee_components?.map((comp: any) => {
          const paidAmount = componentPayments.get(comp.id) || 0;
          const balance = Math.max(0, comp.amount - paidAmount);
          const now = new Date();
          const dueDate = new Date(comp.due_date);
          const isOverdue = balance > 0 && dueDate < now;
          
          return {
            id: comp.id,
            name: comp.name,
            amount: comp.amount,
            paidAmount,
            balance,
            dueDate: comp.due_date,
            recurring: comp.recurring,
            priority: 999, // Default priority since column doesn't exist
            status: balance === 0 ? 'paid' : (paidAmount > 0 ? 'partial' : (isOverdue ? 'overdue' : 'due'))
          };
        }) || [];

        const totalAmount = sf.total_amount;
        const paidAmount = sf.paid_amount;
        const balance = sf.balance;

        return {
          id: structure.id,
          name: structure.name,
          academicYear: structure.academic_year,
          assignmentDate: sf.assignment_date,
          dueDate: sf.due_date,
          totalAmount,
          paidAmount,
          balance,
          status: balance === 0 ? 'paid' : (paidAmount > 0 ? 'partial' : 'due') as 'paid' | 'partial' | 'due' | 'overdue',
          components,
          studentFeeId: sf.id // Add the actual student fee ID
        };
      }) || [];

      // Build payment history
      const paymentHistory = payments?.map((payment: any) => ({
        id: payment.id,
        date: payment.payment_date,
        amount: payment.amount,
        mode: payment.payment_mode,
        receiptNumber: payment.receipt_number,
        createdBy: payment.created_by,
        allocations: payment.fee_payment_allocations?.map((alloc: any) => ({
          structureId: alloc.fee_components?.fee_structures?.id,
          structureName: alloc.fee_components?.fee_structures?.name,
          componentId: alloc.fee_components?.id,
          componentName: alloc.fee_components?.name,
          amount: alloc.allocated_amount
        })) || []
      })) || [];

      // Calculate summary
      const totalDue = feeStructures.reduce((sum, fs) => sum + fs.totalAmount, 0);
      const totalPaid = feeStructures.reduce((sum, fs) => sum + fs.paidAmount, 0);
      const overallBalance = feeStructures.reduce((sum, fs) => sum + fs.balance, 0);
      
      const overdueAmount = feeStructures.reduce((sum, fs) => {
        return sum + fs.components.reduce((compSum, comp) => {
          return compSum + (comp.status === 'overdue' ? comp.balance : 0);
        }, 0);
      }, 0);

      const lastPaymentDate = payments && payments.length > 0 ? payments[0].payment_date : undefined;

      return {
        student: {
          id: student.id,
          name: `${student.first_name} ${student.last_name}`,
          admissionNumber: student.admission_number,
          batchName: batchName
        },
        feeStructures,
        paymentHistory,
        summary: {
          totalDue,
          totalPaid,
          overallBalance,
          overdueAmount,
          lastPaymentDate
        }
      };
    } catch (error) {
      console.error('Error in getStudentPaymentContext:', error);
      return null;
    }
  }

  async validatePaymentAllocation(
    studentId: string, 
    allocations: PaymentAllocation[]
  ): Promise<ValidationResult> {
    try {
      const context = await this.getStudentPaymentContext(studentId);
      if (!context) {
        return {
          isValid: false,
          errors: [{field: 'context', message: 'Unable to load student payment context', type: 'error'}],
          warnings: []
        };
      }

      const errors: {field: string, message: string, type: 'error' | 'warning'}[] = [];
      const warnings: {field: string, message: string, type: 'error' | 'warning'}[] = [];

      // Create a map of component balances
      const componentBalances = new Map<string, number>();
      context.feeStructures.forEach(fs => {
        fs.components.forEach(comp => {
          componentBalances.set(comp.id, comp.balance);
        });
      });

      // Validate each allocation
      for (const allocation of allocations) {
        const balance = componentBalances.get(allocation.componentId || '');
        
        if (balance === undefined) {
          errors.push({field: 'allocation', message: `Component ${allocation.componentName} not found`, type: 'error'});
          continue;
        }

        if (allocation.amount <= 0) {
          errors.push({field: 'amount', message: `Amount for ${allocation.componentName} must be greater than 0`, type: 'error'});
        }

        if (allocation.amount > balance) {
          errors.push({field: 'amount', message: `Amount for ${allocation.componentName} (₹${allocation.amount}) exceeds balance (₹${balance})`, type: 'error'});
        }

        // Check for overpayment warning
        if (allocation.amount === balance && balance > 0) {
          warnings.push({field: 'allocation', message: `${allocation.componentName} will be fully paid`, type: 'warning'});
        }
      }

      // Check total allocation amount
      const totalAllocation = allocations.reduce((sum, alloc) => sum + alloc.amount, 0);
      if (totalAllocation === 0) {
        errors.push({field: 'total', message: 'Total allocation amount must be greater than 0', type: 'error'});
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings
      };
    } catch (error) {
      console.error('Error in validatePaymentAllocation:', error);
      return {
        isValid: false,
        errors: [{field: 'system', message: 'Validation failed due to system error', type: 'error'}],
        warnings: []
      };
    }
  }

  async suggestPaymentAllocation(
    studentId: string, 
    paymentAmount: number, 
    strategy: 'overdue_first' | 'priority_based' | 'proportional' = 'overdue_first'
  ): Promise<PaymentAllocation[]> {
    try {
      const context = await this.getStudentPaymentContext(studentId);
      if (!context) return [];

      // Collect all components with balances
      const components: Array<{
        id: string;
        name: string;
        balance: number;
        isOverdue: boolean;
        structureId: string;
        structureName: string;
        priority: number;
      }> = [];

      context.feeStructures.forEach(fs => {
        fs.components.forEach(comp => {
          if (comp.balance > 0) {
            const isOverdue = comp.status === 'overdue';

            components.push({
              id: comp.id,
              name: comp.name,
              balance: comp.balance,
              isOverdue,
              structureId: fs.id,
              structureName: fs.name,
              priority: 999 // Default priority since column doesn't exist
            });
          }
        });
      });

      let allocations: PaymentAllocation[] = [];
      let remainingAmount = paymentAmount;

      switch (strategy) {
        case 'overdue_first':
          // Sort by overdue first, then by priority
          components.sort((a, b) => {
            if (a.isOverdue !== b.isOverdue) return a.isOverdue ? -1 : 1;
            return a.priority - b.priority;
          });
          break;

        case 'priority_based':
          // Sort by priority, then by overdue
          components.sort((a, b) => {
            if (a.priority !== b.priority) return a.priority - b.priority;
            return a.isOverdue ? -1 : 1;
          });
          break;

        case 'proportional':
          // Allocate proportionally based on balance
          const totalBalance = components.reduce((sum, comp) => sum + comp.balance, 0);
          if (totalBalance === 0) return [];

          allocations = components.map(comp => {
            const proportion = comp.balance / totalBalance;
            const amount = Math.min(
              Math.round(paymentAmount * proportion),
              comp.balance
            );
            return {
              structureId: comp.structureId,
              structureName: comp.structureName,
              componentId: comp.id,
              componentName: comp.name,
              amount,
              priority: 999 // Default priority since column doesn't exist
            };
          }).filter(alloc => alloc.amount > 0);

          return allocations;
      }

      // For overdue_first and priority_based strategies
      for (const component of components) {
        if (remainingAmount <= 0) break;

        const allocationAmount = Math.min(remainingAmount, component.balance);
        if (allocationAmount > 0) {
          allocations.push({
            structureId: component.structureId,
            structureName: component.structureName,
            componentId: component.id,
            componentName: component.name,
            amount: allocationAmount,
            priority: 999 // Default priority since column doesn't exist
          });
          remainingAmount -= allocationAmount;
        }
      }

      return allocations;
    } catch (error) {
      console.error('Error in suggestPaymentAllocation:', error);
      return [];
    }
  }

  async recordPaymentWithAllocation(paymentData: NewPaymentData): Promise<PaymentResult> {
    try {
      // Start a transaction
      const receiptNumber = paymentData.receiptNumber || `REC${Date.now()}`;
      
      // First, create the payment record
      const { data: payment, error: paymentError } = await supabase
        .from('fee_payments')
        .insert({
          student_fee_id: paymentData.studentFeeId,
          amount: paymentData.totalAmount,
          payment_mode: paymentData.paymentMode,
          payment_date: paymentData.paymentDate,
          receipt_number: receiptNumber,
          notes: paymentData.notes,
          created_by: paymentData.createdBy,
          school_id: paymentData.schoolId
        })
        .select('id')
        .single();

      if (paymentError || !payment) {
        console.error('Error creating payment:', paymentError);
        return {
          success: false,
          message: 'Failed to create payment record'
        };
      }

      // Create allocation records
      const allocationInserts = paymentData.allocations.map(allocation => ({
        payment_id: payment.id,
        component_id: allocation.componentId,
        allocated_amount: allocation.amount
      }));

      const { error: allocationsError } = await supabase
        .from('fee_payment_allocations')
        .insert(allocationInserts);

      if (allocationsError) {
        console.error('Error creating allocations:', allocationsError);
        // Try to rollback the payment
        await supabase.from('fee_payments').delete().eq('id', payment.id);
        return {
          success: false,
          message: 'Failed to create payment allocations'
        };
      }

      // Update student_fees balances
      // First get current values
      const { data: currentFee, error: fetchError } = await supabase
        .from('student_fees')
        .select('paid_amount, balance')
        .eq('id', paymentData.studentFeeId)
        .single();

      if (fetchError) {
        console.error('Error fetching current fee:', fetchError);
      } else {
        const totalPaymentAmount = paymentData.allocations.reduce((sum, alloc) => sum + alloc.amount, 0);
        const newPaidAmount = currentFee.paid_amount + totalPaymentAmount;
        const newBalance = Math.max(0, currentFee.balance - totalPaymentAmount);

        const { error: updateError } = await supabase
          .from('student_fees')
          .update({
            paid_amount: newPaidAmount,
            status: newBalance === 0 ? 'paid' : (newPaidAmount > 0 ? 'partial' : 'due')
          })
          .eq('id', paymentData.studentFeeId);

        if (updateError) {
          console.error('Error updating fee balance:', updateError);
        }
      }

      return {
        success: true,
        paymentId: payment.id,
        receiptNumber,
        message: `Payment of ₹${paymentData.totalAmount} recorded successfully`,
        allocations: paymentData.allocations
      };
    } catch (error) {
      console.error('Error in recordPaymentWithAllocation:', error);
      return {
        success: false,
        message: 'Payment recording failed due to system error'
      };
    }
  }

  async getStudentsWithOutstandingFees(schoolId: string): Promise<Array<{
    id: string;
    name: string;
    admissionNumber: string;
    totalOutstanding: number;
    isOverdue: boolean;
  }>> {
    try {
      const { data: students, error } = await supabase
        .from('student_details')
        .select(`
          id,
          first_name,
          last_name,
          admission_number,
          student_fees!inner(
            balance,
            due_date
          )
        `)
        .eq('school_id', schoolId)
        .gt('student_fees.balance', 0);

      if (error) {
        console.error('Error fetching students with fees:', error);
        return [];
      }

      const now = new Date();
      
      return students?.map((student: any) => {
        const totalOutstanding = student.student_fees.reduce((sum: number, fee: any) => sum + fee.balance, 0);
        const isOverdue = student.student_fees.some((fee: any) => {
          const dueDate = new Date(fee.due_date);
          return fee.balance > 0 && dueDate < now;
        });

        return {
          id: student.id,
          name: `${student.first_name} ${student.last_name}`,
          admissionNumber: student.admission_number,
          totalOutstanding,
          isOverdue
        };
      }) || [];
    } catch (error) {
      console.error('Error in getStudentsWithOutstandingFees:', error);
      return [];
    }
  }

  async getPaymentCollections(schoolId: string): Promise<Array<{
    id: string;
    studentId: string;
    studentName: string;
    admissionNumber: string;
    batchName: string;
    structureId: string;
    structureName: string;
    amountDue: number;
    amountPaid: number;
    balance: number;
    lastPaymentDate?: string;
    lastPaymentMode?: string;
    lastReceiptNumber?: string;
    status: 'paid' | 'partial' | 'due' | 'overdue';
  }>> {
    try {
      console.log('Fetching payment collections for school:', schoolId);
      
      // First, get student fees with basic student and fee structure info
      const { data: studentFees, error: feesError } = await supabase
        .from('student_fees')
        .select(`
          id,
          student_id,
          fee_structure_id,
          total_amount,
          paid_amount,
          balance,
          status,
          due_date
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

      console.log('Found student fees:', studentFees.length);

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

      // Get batch information
      const { data: batchData, error: batchError } = await supabase
        .from('batch_students')
        .select(`
          student_id,
          batches(name)
        `)
        .in('student_id', studentIds)
        .eq('is_current', true);

      if (batchError) {
        console.error('Error fetching batch data:', batchError);
      }

      // Get latest payments for each student fee
      const studentFeeIds = studentFees.map(sf => sf.id);
      const { data: payments, error: paymentsError } = await supabase
        .from('fee_payments')
        .select('student_fee_id, payment_date, payment_mode, receipt_number')
        .in('student_fee_id', studentFeeIds)
        .order('payment_date', { ascending: false });

      if (paymentsError) {
        console.error('Error fetching payments:', paymentsError);
      }

      // Create lookup maps
      const studentMap = new Map(students?.map(s => [s.id, s]) || []);
      const structureMap = new Map(structures?.map(s => [s.id, s]) || []);
      const batchMap = new Map();
      batchData?.forEach((bs: any) => {
        batchMap.set(bs.student_id, bs.batches?.name || 'Unknown Batch');
      });
      
      // Group payments by student_fee_id and get the latest
      const paymentMap = new Map();
      payments?.forEach(payment => {
        if (!paymentMap.has(payment.student_fee_id) || 
            new Date(payment.payment_date) > new Date(paymentMap.get(payment.student_fee_id).payment_date)) {
          paymentMap.set(payment.student_fee_id, payment);
        }
      });

      const now = new Date();

      return studentFees.map(sf => {
        const student = studentMap.get(sf.student_id);
        const structure = structureMap.get(sf.fee_structure_id);
        const latestPayment = paymentMap.get(sf.id);

        // Determine status
        let status: 'paid' | 'partial' | 'due' | 'overdue' = sf.status;
        if (sf.balance > 0 && sf.due_date && new Date(sf.due_date) < now) {
          status = 'overdue';
        }

        return {
          id: sf.id,
          studentId: sf.student_id,
          studentName: student ? `${student.first_name} ${student.last_name}` : 'Unknown Student',
          admissionNumber: student?.admission_number || 'N/A',
          batchName: batchMap.get(sf.student_id) || 'Unknown Batch',
          structureId: sf.fee_structure_id,
          structureName: structure?.name || 'Unknown Structure',
          amountDue: sf.total_amount,
          amountPaid: sf.paid_amount,
          balance: sf.balance,
          lastPaymentDate: latestPayment?.payment_date,
          lastPaymentMode: latestPayment?.payment_mode,
          lastReceiptNumber: latestPayment?.receipt_number,
          status
        };
      });
    } catch (error) {
      console.error('Error in getPaymentCollections:', error);
      return [];
    }
  }
} 