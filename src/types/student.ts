
import { User } from "./user";

export type StudentStatus = 'active' | 'transferred' | 'graduated' | 'inactive';
export type Gender = 'male' | 'female' | 'other';
export type DocumentVerificationStatus = 'pending' | 'verified' | 'rejected';
export type IncidentSeverity = 'minor' | 'moderate' | 'severe';
export type IncidentStatus = 'pending' | 'resolved' | 'escalated';
export type TransferType = 'internal' | 'external';
export type TransferStatus = 'pending' | 'approved' | 'rejected' | 'completed';
export type CertificateStatus = 'draft' | 'issued' | 'revoked';
export type DocumentType = 'Birth Certificate' | 'Previous School Records' | 'Medical Records' | 'Immunization Records' | 'Parent ID' | 'Address Proof' | 'Transfer Certificate' | 'Other';

export interface Student {
  id: string;
  admission_number: string;
  first_name: string;
  last_name: string;
  email?: string;
  date_of_birth?: string;
  gender?: Gender;
  address?: string;
  batch_id?: string;
  batch_name?: string;
  course_name?: string;
  academic_year?: string;
  nationality?: string;
  mother_tongue?: string;
  blood_group?: string;
  religion?: string;
  caste?: string;
  category?: string;
  phone?: string;
  previous_school_name?: string;
  previous_school_board?: string;
  previous_school_year?: string;
  previous_school_percentage?: number;
  tc_number?: string;
  admission_date?: string;
  status: StudentStatus;
  avatar_url?: string; // Changed from photo
  school_id: string;
  created_at?: string;
  updated_at?: string;
  guardians?: Guardian[];
  categories?: CategoryType[];
  documents?: StudentDocument[];
  disciplinary_records?: DisciplinaryRecord[];
  transfer_records?: TransferRecord[];
  certificates?: Certificate[];
}

export interface Guardian {
  id: string;
  first_name: string;
  last_name?: string;
  relation: string;
  occupation?: string;
  email?: string;
  phone: string;
  address?: string;
  is_emergency_contact?: boolean;
  can_pickup?: boolean;
  is_primary?: boolean;
  school_id: string;
}

export interface StudentCategory {
  id: string;
  name: string;
  description?: string;
  color?: string;
  school_id: string;
  students?: string[];
}

export interface CategoryType extends StudentCategory {} // Renamed to avoid confusion with Category

export interface StudentDocument {
  id: string;
  student_id: string;
  name: string;
  type: string;
  description?: string;
  file_path: string;
  upload_date?: string;
  verification_status: DocumentVerificationStatus;
  verified_by?: string;
  verification_date?: string;
  school_id: string;
}

export interface DocumentType extends StudentDocument {} // Interface for documents

export interface DisciplinaryRecord {
  id: string;
  student_id: string;
  incident_type: string;
  description: string;
  date: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  action_taken?: string;
  reported_by: string;
  school_id: string;
  created_at?: string;
  updated_at?: string;
  parent_meetings?: ParentMeeting[];
  evidence?: DisciplinaryEvidence[];
}

export interface ParentMeeting {
  id: string;
  disciplinary_record_id: string;
  date: string;
  attendees: string;
  discussion: string;
  outcome?: string;
  follow_up_date?: string;
  school_id: string;
}

export interface DisciplinaryEvidence {
  id: string;
  disciplinary_record_id: string;
  type: string;
  file_path: string;
  uploaded_at?: string;
  school_id: string;
  file?: File;
}

export interface TransferRecord {
  id: string;
  student_id: string;
  type: TransferType;
  date: string;
  from_batch_id?: string;
  to_batch_id?: string;
  to_school?: string;
  reason: string;
  tc_number?: string;
  status: TransferStatus;
  school_id: string;
  created_at?: string;
  updated_at?: string;
  documents?: DocumentType[];
}

export interface Certificate {
  id: string;
  student_id: string;
  type: string;
  template_id: string;
  issued_date: string;
  valid_until?: string;
  serial_number: string;
  status: CertificateStatus;
  issued_by: string;
  data?: any;
  school_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface PreviousSchoolInfo {
  name?: string;
  board?: string;
  year_of_passing?: string;
  percentage?: number;
}

export interface StudentWithDetails extends Student {
  guardians?: Guardian[];
  categories?: CategoryType[];
  documents?: StudentDocument[];
  disciplinary_records?: DisciplinaryRecord[];
  transfer_records?: TransferRecord[];
  certificates?: Certificate[];
}

export interface NewStudentFormData {
  email: string;
  first_name: string;
  last_name: string;
  admission_number?: string;
  batch_id?: string;
  date_of_birth?: string;
  gender?: Gender;
  address?: string;
  nationality?: string;
  mother_tongue?: string;
  blood_group?: string;
  religion?: string;
  caste?: string;
  category?: string;
  phone?: string;
  previous_school_name?: string;
  previous_school_board?: string;
  previous_school_year?: string;
  previous_school_percentage?: number;
  guardians?: {
    first_name: string;
    last_name?: string;
    relation: string;
    occupation?: string;
    email?: string;
    phone: string;
    address?: string;
    is_emergency_contact?: boolean;
    can_pickup?: boolean;
    is_primary?: boolean;
  }[];
  avatar?: File;
  documents?: {
    name: string;
    type: string;
    description?: string;
    file: File;
  }[];
}

export interface StudentFilter {
  search?: string;
  batch_id?: string;
  status?: StudentStatus;
  category_id?: string;
  academic_year_id?: string;
  course_id?: string;
}
