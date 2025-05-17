export interface Student {
  id: string;
  admissionNo: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  email?: string;
  phone?: string;
  address: string;
  batch: string;
  
  // Enhanced fields
  nationality: string;
  caste?: string;
  religion?: string;
  motherTongue: string;
  bloodGroup?: string;
  category?: string;
  photo?: string;

  // Academic
  previousSchool?: PreviousSchool;
  academicRecords: AcademicRecord[];
  
  // Medical
  medicalRecords: MedicalRecord[];
  
  // Documents
  documents: Document[];
  
  // Disciplinary
  disciplinaryRecords: DisciplinaryRecord[];
  
  // Guardians
  guardians: Guardian[];
  
  // Transfer
  transferRecords: TransferRecord[];
}

export interface PreviousSchool {
  name: string;
  board: string;
  yearOfPassing: string;
  percentage: number;
  tcNumber?: string;
}

export interface AcademicRecord {
  id: string;
  year: string;
  term: string;
  subjects: SubjectGrade[];
  attendance: number;
  remarks?: string;
}

export interface SubjectGrade {
  subject: string;
  marks: number;
  grade: string;
  remarks?: string;
}

export interface MedicalRecord {
  id: string;
  studentId: string;
  condition: string;
  diagnosis: string;
  medication: string;
  startDate: string;
  endDate?: string;
  status: "active" | "resolved" | "ongoing";
  notes: string;
  attachments?: string[];
  lastUpdated: string;
}

export type DocumentType =
  | "Birth Certificate"
  | "Previous School Records"
  | "Medical Records"
  | "Immunization Records"
  | "Parent ID"
  | "Address Proof"
  | "Transfer Certificate"
  | "Other";

export interface Document {
  id: string;
  studentId: string;
  type: DocumentType;
  name: string;
  description: string;
  file: File | string;
  uploadDate: string;
  verificationStatus: "pending" | "verified" | "rejected";
  verifiedBy?: string;
  verificationDate?: string;
}

export interface Guardian {
  id: string;
  relation: string;
  firstName: string;
  lastName: string;
  occupation: string;
  email?: string;
  phone: string;
  address: string;
  isEmergencyContact: boolean;
  canPickup: boolean;
}

export interface DisciplinaryRecord {
  id: string;
  studentId: string;
  type: string;
  description: string;
  date: string;
  severity: "minor" | "moderate" | "severe";
  status: "pending" | "resolved";
  actionTaken: string;
  reportedBy: string;
  createdAt: string;
  parentMeetings?: Array<{
    id: string;
    date: string;
    notes: string;
  }>;
  evidence?: Array<{
    id: string;
    type: string;
    file: string;
    uploadedAt: string;
  }>;
}

export interface ParentMeeting {
  id: string;
  date: string;
  attendees: string[];
  discussion: string;
  outcome: string;
  followUpDate?: string;
}

export interface TransferRecord {
  id: string;
  type: 'internal' | 'external';
  date: string;
  fromBatch?: string;
  toBatch?: string;
  toSchool?: string;
  reason: string;
  tcNumber?: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  documents?: Document[];
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  color?: string;
  students: string[]; // Student IDs
}

export interface Certificate {
  id: string;
  type: string;
  templateId: string;
  issuedTo: string; // Student ID
  issuedDate: string;
  validUntil?: string;
  serialNumber: string;
  status: 'draft' | 'issued' | 'revoked';
  issuedBy: string;
  data: Record<string, any>; // Template data
} 