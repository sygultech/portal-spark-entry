
export interface Book {
  id: string;
  title: string;
  author: string;
  isbn?: string;
  edition?: string;
  publisher?: string;
  genre?: string;
  language: string;
  rack_location?: string;
  total_copies: number;
  available_copies: number;
  cover_image_url?: string;
  description?: string;
  subject_category?: string;
  grade_level?: string;
  school_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LibraryMember {
  id: string;
  member_id: string;
  member_type: 'student' | 'teacher' | 'staff';
  student_id?: string;
  staff_id?: string;
  borrowing_limit: number;
  is_active: boolean;
  suspended_until?: string;
  suspension_reason?: string;
  school_id: string;
  created_at: string;
  updated_at: string;
  // Populated fields
  student_name?: string;
  staff_name?: string;
  current_books?: number;
}

export interface BookTransaction {
  id: string;
  book_id: string;
  member_id: string;
  transaction_type: 'issue' | 'return' | 'renew';
  issue_date: string;
  due_date: string;
  return_date?: string;
  renewal_count: number;
  max_renewals: number;
  fine_amount: number;
  fine_paid: boolean;
  fine_paid_date?: string;
  status: 'issued' | 'returned' | 'overdue' | 'lost';
  issued_by: string;
  returned_by?: string;
  notes?: string;
  school_id: string;
  created_at: string;
  updated_at: string;
  // Populated fields
  book_title?: string;
  member_name?: string;
  issued_by_name?: string;
  returned_by_name?: string;
}

export interface BookReservation {
  id: string;
  book_id: string;
  member_id: string;
  reservation_date: string;
  status: 'pending' | 'available' | 'fulfilled' | 'expired' | 'cancelled';
  available_date?: string;
  expiry_date?: string;
  notification_sent: boolean;
  school_id: string;
  created_at: string;
  updated_at: string;
  // Populated fields
  book_title?: string;
  member_name?: string;
}

export interface LibrarySettings {
  id: string;
  school_id: string;
  fine_per_day: number;
  grace_period_days: number;
  max_fine_amount: number;
  student_borrowing_limit: number;
  teacher_borrowing_limit: number;
  staff_borrowing_limit: number;
  student_borrowing_days: number;
  teacher_borrowing_days: number;
  staff_borrowing_days: number;
  max_renewals: number;
  reservation_hold_days: number;
  created_at: string;
  updated_at: string;
}

export interface BookInventoryLog {
  id: string;
  book_id: string;
  action_type: 'added' | 'removed' | 'lost' | 'damaged' | 'discarded';
  quantity_change: number;
  reason?: string;
  performed_by: string;
  school_id: string;
  created_at: string;
  // Populated fields
  book_title?: string;
  performed_by_name?: string;
}

export interface LibraryStats {
  total_books: number;
  total_members: number;
  books_issued: number;
  overdue_books: number;
  total_fines: number;
  pending_reservations: number;
}

export interface CreateBookData {
  title: string;
  author: string;
  isbn?: string;
  edition?: string;
  publisher?: string;
  genre?: string;
  language?: string;
  rack_location?: string;
  total_copies: number;
  cover_image_url?: string;
  description?: string;
  subject_category?: string;
  grade_level?: string;
}

export interface CreateLibraryMemberData {
  member_id: string;
  member_type: 'student' | 'teacher' | 'staff';
  student_id?: string;
  staff_id?: string;
  borrowing_limit?: number;
}

export interface IssueBookData {
  book_id: string;
  member_id: string;
  due_date: string;
  notes?: string;
}

export interface ReturnBookData {
  transaction_id: string;
  return_date: string;
  fine_amount?: number;
  notes?: string;
}
