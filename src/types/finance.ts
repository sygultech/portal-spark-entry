
export interface FeeComponent {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  recurring: 'monthly' | 'quarterly' | 'one-time';
}

export interface FeeStructure {
  id: string;
  name: string;
  academicYear: string;
  components: FeeComponent[];
  totalAmount: number;
  assignedBatches: string[];
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
