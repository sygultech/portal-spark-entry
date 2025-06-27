
export interface FeeComponent {
  id: string;
  fee_structure_id: string;
  name: string;
  amount: number;
  due_date?: string; // Keep consistent with database
  dueDate?: string; // Add for form compatibility
  recurring: 'monthly' | 'quarterly' | 'one-time' | 'annually';
  created_at: string;
  updated_at: string;
}

export interface FeeStructure {
  id: string;
  name: string;
  academicYear: string;
  components: FeeComponent[];
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface FeeAssignment {
  id: string;
  structureId: string;
  structureName: string;
  assignmentType: 'batch' | 'student';
  batchId?: string;
  batchName?: string;
  studentIds?: string[];
  assignedDate: string;
  totalAmount: number;
  paidAmount: number;
  balance: number;
}

export interface PaymentRecord {
  id: string;
  studentId: string;
  studentName: string;
  admissionNumber: string;
  batchName: string;
  structureId: string;
  structureName: string;
  amountDue: number;
  amountPaid: number;
  paymentDate: string;
  paymentMode: 'cash' | 'upi' | 'card' | 'bank_transfer';
  receiptNumber: string;
  receiptUrl?: string;
  status: 'paid' | 'partial' | 'due' | 'overdue';
  remarks?: string;
}

// Enhanced interfaces for the new payment system
export interface StudentPaymentContext {
  student: {
    id: string;
    name: string;
    admissionNumber: string;
    batchName: string;
    profileImage?: string;
  };
  
  feeStructures: Array<{
    id: string;
    name: string;
    academicYear: string;
    assignmentDate: string;
    dueDate?: string;
    totalAmount: number;
    paidAmount: number;
    balance: number;
    status: 'paid' | 'partial' | 'overdue' | 'due';
    studentFeeId?: string; // ID of the student_fees record
    
    components: Array<{
      id: string;
      name: string;
      amount: number;
      paidAmount: number;
      balance: number;
      dueDate: string;
      recurring: 'monthly' | 'quarterly' | 'annual' | 'one-time';
      priority: number; // 1=highest (tuition), 5=lowest (extra-curricular)
      status: 'paid' | 'partial' | 'overdue' | 'due';
      lastPaymentDate?: string;
    }>;
  }>;
  
  paymentHistory: Array<{
    id: string;
    date: string;
    amount: number;
    mode: 'cash' | 'upi' | 'card' | 'bank_transfer' | 'cheque';
    receiptNumber: string;
    createdBy: string;
    allocations: Array<{
      structureId: string;
      structureName: string;
      componentId?: string;
      componentName?: string;
      amount: number;
    }>;
  }>;
  
  summary: {
    totalDue: number;
    totalPaid: number;
    overallBalance: number;
    overdueAmount: number;
    lastPaymentDate?: string;
    nextDueDate?: string;
  };
}

export interface PaymentAllocation {
  structureId: string;
  structureName: string;
  componentId?: string;
  componentName?: string;
  amount: number;
  priority: number;
}

export interface NewPaymentData {
  studentId: string;
  studentFeeId: string;
  totalAmount: number;
  paymentMode: 'cash' | 'upi' | 'card' | 'bank_transfer' | 'cheque';
  paymentDate: string;
  receiptNumber?: string;
  notes?: string;
  createdBy: string;
  schoolId: string;
  allocations: PaymentAllocation[];
}

export interface ValidationError {
  field: string;
  message: string;
  type: 'error' | 'warning';
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  receiptNumber?: string;
  message: string;
  allocations?: PaymentAllocation[];
}

export interface StudentTransaction {
  id: string;
  date: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
  paymentMode?: string;
  receiptNumber?: string;
}

export interface StudentFinancialRecord {
  studentId: string;
  studentName: string;
  admissionNumber: string;
  batchName: string;
  appliedStructures: string[];
  totalFees: number;
  paidAmount: number;
  balance: number;
  lastPaymentDate?: string;
  transactions: StudentTransaction[];
}

export interface DuesSummary {
  studentId: string;
  studentName: string;
  admissionNumber: string;
  batchName: string;
  totalFees: number;
  paidAmount: number;
  balance: number;
  lastPaymentDate?: string;
  status: 'paid' | 'partial' | 'overdue';
  daysPastDue?: number;
}
