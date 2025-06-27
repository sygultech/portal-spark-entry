
import { supabase } from '@/integrations/supabase/client';
import { 
  Book, 
  LibraryMember, 
  BookTransaction, 
  BookReservation, 
  LibrarySettings, 
  BookInventoryLog, 
  LibraryStats,
  CreateBookData,
  CreateLibraryMemberData,
  IssueBookData,
  ReturnBookData
} from '@/types/library';

class LibraryService {
  // Books management
  async getBooks(schoolId: string, filters?: {
    search?: string;
    genre?: string;
    availability?: 'all' | 'available' | 'issued';
  }) {
    let query = supabase
      .from('books')
      .select('*')
      .eq('school_id', schoolId)
      .eq('is_active', true)
      .order('title');

    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,author.ilike.%${filters.search}%,isbn.ilike.%${filters.search}%`);
    }

    if (filters?.genre) {
      query = query.eq('genre', filters.genre);
    }

    if (filters?.availability === 'available') {
      query = query.gt('available_copies', 0);
    } else if (filters?.availability === 'issued') {
      query = query.eq('available_copies', 0);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data as Book[];
  }

  async createBook(schoolId: string, bookData: CreateBookData) {
    const { data, error } = await supabase
      .from('books')
      .insert({
        ...bookData,
        school_id: schoolId,
        available_copies: bookData.total_copies,
        language: bookData.language || 'English'
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as Book;
  }

  async updateBook(bookId: string, updates: Partial<CreateBookData>) {
    const { data, error } = await supabase
      .from('books')
      .update(updates)
      .eq('id', bookId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as Book;
  }

  async deleteBook(bookId: string) {
    const { error } = await supabase
      .from('books')
      .update({ is_active: false })
      .eq('id', bookId);

    if (error) throw new Error(error.message);
  }

  // Library members management
  async getLibraryMembers(schoolId: string, memberType?: string) {
    let query = supabase
      .from('library_members')
      .select(`
        *,
        student_details:student_id (
          first_name,
          last_name,
          admission_number
        ),
        staff_details:staff_id (
          first_name,
          last_name,
          employee_id
        )
      `)
      .eq('school_id', schoolId)
      .eq('is_active', true);

    if (memberType) {
      query = query.eq('member_type', memberType);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    return (data as any[]).map(member => ({
      ...member,
      student_name: member.student_details 
        ? `${member.student_details.first_name} ${member.student_details.last_name} (${member.student_details.admission_number})`
        : undefined,
      staff_name: member.staff_details
        ? `${member.staff_details.first_name} ${member.staff_details.last_name} (${member.staff_details.employee_id})`
        : undefined
    })) as LibraryMember[];
  }

  async createLibraryMember(schoolId: string, memberData: CreateLibraryMemberData) {
    // Get default borrowing limit from settings
    const settings = await this.getLibrarySettings(schoolId);
    let defaultLimit = 3;
    
    if (settings) {
      switch (memberData.member_type) {
        case 'student':
          defaultLimit = settings.student_borrowing_limit;
          break;
        case 'teacher':
          defaultLimit = settings.teacher_borrowing_limit;
          break;
        case 'staff':
          defaultLimit = settings.staff_borrowing_limit;
          break;
      }
    }

    const { data, error } = await supabase
      .from('library_members')
      .insert({
        ...memberData,
        school_id: schoolId,
        borrowing_limit: memberData.borrowing_limit || defaultLimit
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as LibraryMember;
  }

  async updateLibraryMember(memberId: string, updates: Partial<LibraryMember>) {
    const { data, error } = await supabase
      .from('library_members')
      .update(updates)
      .eq('id', memberId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as LibraryMember;
  }

  // Book transactions
  async getBookTransactions(schoolId: string, filters?: {
    status?: string;
    member_id?: string;
    book_id?: string;
  }) {
    let query = supabase
      .from('book_transactions')
      .select(`
        *,
        books!inner (title),
        library_members!inner (
          member_id,
          student_details:student_id (first_name, last_name),
          staff_details:staff_id (first_name, last_name)
        ),
        profiles:issued_by (first_name, last_name)
      `)
      .eq('school_id', schoolId)
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.member_id) {
      query = query.eq('member_id', filters.member_id);
    }

    if (filters?.book_id) {
      query = query.eq('book_id', filters.book_id);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    return (data as any[]).map(transaction => ({
      ...transaction,
      book_title: transaction.books?.title,
      member_name: transaction.library_members?.student_details
        ? `${transaction.library_members.student_details.first_name} ${transaction.library_members.student_details.last_name}`
        : transaction.library_members?.staff_details
        ? `${transaction.library_members.staff_details.first_name} ${transaction.library_members.staff_details.last_name}`
        : transaction.library_members?.member_id,
      issued_by_name: transaction.profiles
        ? `${transaction.profiles.first_name} ${transaction.profiles.last_name}`
        : undefined
    })) as BookTransaction[];
  }

  async issueBook(schoolId: string, issueData: IssueBookData) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Start transaction
    const { data, error } = await supabase
      .from('book_transactions')
      .insert({
        ...issueData,
        school_id: schoolId,
        transaction_type: 'issue',
        issue_date: new Date().toISOString().split('T')[0],
        issued_by: user.id,
        status: 'issued',
        renewal_count: 0,
        max_renewals: 2
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    // Update book available copies
    await supabase.rpc('decrement_book_copies', {
      book_id: issueData.book_id
    });

    return data as BookTransaction;
  }

  async returnBook(schoolId: string, returnData: ReturnBookData) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('book_transactions')
      .update({
        return_date: returnData.return_date,
        status: 'returned',
        returned_by: user.id,
        fine_amount: returnData.fine_amount || 0,
        notes: returnData.notes
      })
      .eq('id', returnData.transaction_id)
      .select()
      .single();

    if (error) throw new Error(error.message);

    // Get book_id from transaction to increment available copies
    const transaction = data as BookTransaction;
    await supabase.rpc('increment_book_copies', {
      book_id: transaction.book_id
    });

    return transaction;
  }

  async renewBook(transactionId: string) {
    const { data: transaction, error: fetchError } = await supabase
      .from('book_transactions')
      .select('*, library_members!inner(member_type)')
      .eq('id', transactionId)
      .single();

    if (fetchError) throw new Error(fetchError.message);

    if (transaction.renewal_count >= transaction.max_renewals) {
      throw new Error('Maximum renewals exceeded');
    }

    // Get renewal period from settings
    const settings = await this.getLibrarySettings(transaction.school_id);
    let renewalDays = 14; // default
    
    if (settings) {
      const memberType = (transaction as any).library_members.member_type;
      switch (memberType) {
        case 'student':
          renewalDays = settings.student_borrowing_days;
          break;
        case 'teacher':
          renewalDays = settings.teacher_borrowing_days;
          break;
        case 'staff':
          renewalDays = settings.staff_borrowing_days;
          break;
      }
    }

    const newDueDate = new Date();
    newDueDate.setDate(newDueDate.getDate() + renewalDays);

    const { data, error } = await supabase
      .from('book_transactions')
      .update({
        due_date: newDueDate.toISOString().split('T')[0],
        renewal_count: transaction.renewal_count + 1
      })
      .eq('id', transactionId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as BookTransaction;
  }

  // Library settings
  async getLibrarySettings(schoolId: string) {
    const { data, error } = await supabase
      .from('library_settings')
      .select('*')
      .eq('school_id', schoolId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(error.message);
    }

    return data as LibrarySettings | null;
  }

  async updateLibrarySettings(schoolId: string, settings: Partial<LibrarySettings>) {
    const { data, error } = await supabase
      .from('library_settings')
      .upsert({
        ...settings,
        school_id: schoolId
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as LibrarySettings;
  }

  // Statistics
  async getLibraryStats(schoolId: string): Promise<LibraryStats> {
    const [booksResult, membersResult, issuedResult, overdueResult, finesResult, reservationsResult] = await Promise.all([
      supabase.from('books').select('id', { count: 'exact' }).eq('school_id', schoolId).eq('is_active', true),
      supabase.from('library_members').select('id', { count: 'exact' }).eq('school_id', schoolId).eq('is_active', true),
      supabase.from('book_transactions').select('id', { count: 'exact' }).eq('school_id', schoolId).eq('status', 'issued'),
      supabase.from('book_transactions').select('id', { count: 'exact' }).eq('school_id', schoolId).eq('status', 'overdue'),
      supabase.from('book_transactions').select('fine_amount').eq('school_id', schoolId).eq('fine_paid', false),
      supabase.from('book_reservations').select('id', { count: 'exact' }).eq('school_id', schoolId).eq('status', 'pending')
    ]);

    const totalFines = finesResult.data?.reduce((sum, record) => sum + (record.fine_amount || 0), 0) || 0;

    return {
      total_books: booksResult.count || 0,
      total_members: membersResult.count || 0,
      books_issued: issuedResult.count || 0,
      overdue_books: overdueResult.count || 0,
      total_fines: totalFines,
      pending_reservations: reservationsResult.count || 0
    };
  }

  // Book reservations
  async getBookReservations(schoolId: string, status?: string) {
    let query = supabase
      .from('book_reservations')
      .select(`
        *,
        books!inner (title),
        library_members!inner (
          member_id,
          student_details:student_id (first_name, last_name),
          staff_details:staff_id (first_name, last_name)
        )
      `)
      .eq('school_id', schoolId)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    return (data as any[]).map(reservation => ({
      ...reservation,
      book_title: reservation.books?.title,
      member_name: reservation.library_members?.student_details
        ? `${reservation.library_members.student_details.first_name} ${reservation.library_members.student_details.last_name}`
        : reservation.library_members?.staff_details
        ? `${reservation.library_members.staff_details.first_name} ${reservation.library_members.staff_details.last_name}`
        : reservation.library_members?.member_id
    })) as BookReservation[];
  }

  async createReservation(schoolId: string, bookId: string, memberId: string) {
    const { data, error } = await supabase
      .from('book_reservations')
      .insert({
        book_id: bookId,
        member_id: memberId,
        school_id: schoolId,
        reservation_date: new Date().toISOString().split('T')[0]
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as BookReservation;
  }

  async updateReservationStatus(reservationId: string, status: string) {
    const { data, error } = await supabase
      .from('book_reservations')
      .update({ status })
      .eq('id', reservationId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as BookReservation;
  }
}

export const libraryService = new LibraryService();
