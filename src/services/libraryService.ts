
import { supabase } from '@/integrations/supabase/client';
import { 
  Book, 
  LibraryMember, 
  BookTransaction, 
  BookReservation, 
  LibrarySettings,
  CreateBookData,
  CreateLibraryMemberData,
  IssueBookData,
  ReturnBookData
} from '@/types/library';

export const libraryService = {
  // Books
  async getBooks(schoolId: string, filters?: {
    search?: string;
    genre?: string;
    availability?: 'all' | 'available' | 'issued';
  }): Promise<Book[]> {
    let query = supabase
      .from('books')
      .select('*')
      .eq('school_id', schoolId)
      .eq('is_active', true);

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

    const { data, error } = await query.order('title');

    if (error) throw error;
    return data || [];
  },

  async createBook(schoolId: string, bookData: CreateBookData): Promise<Book> {
    const { data, error } = await supabase
      .from('books')
      .insert({
        ...bookData,
        school_id: schoolId,
        available_copies: bookData.total_copies
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateBook(bookId: string, updates: Partial<Book>): Promise<Book> {
    const { data, error } = await supabase
      .from('books')
      .update(updates)
      .eq('id', bookId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteBook(bookId: string): Promise<void> {
    const { error } = await supabase
      .from('books')
      .update({ is_active: false })
      .eq('id', bookId);

    if (error) throw error;
  },

  // Library Members
  async getLibraryMembers(schoolId: string, memberType?: string): Promise<LibraryMember[]> {
    let query = supabase
      .from('library_members')
      .select(`
        *,
        student_details!inner(first_name, last_name),
        staff_details!inner(first_name, last_name)
      `)
      .eq('school_id', schoolId)
      .eq('is_active', true);

    if (memberType) {
      query = query.eq('member_type', memberType);
    }

    const { data, error } = await query.order('member_id');

    if (error) throw error;

    // Transform data to include member names
    return (data || []).map(member => ({
      ...member,
      student_name: member.student_details ? 
        `${member.student_details.first_name} ${member.student_details.last_name}` : undefined,
      staff_name: member.staff_details ? 
        `${member.staff_details.first_name} ${member.staff_details.last_name}` : undefined,
    }));
  },

  async createLibraryMember(schoolId: string, memberData: CreateLibraryMemberData): Promise<LibraryMember> {
    const { data, error } = await supabase
      .from('library_members')
      .insert({
        ...memberData,
        school_id: schoolId
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Book Transactions
  async getBookTransactions(schoolId: string, filters?: {
    status?: string;
    member_id?: string;
    book_id?: string;
  }): Promise<BookTransaction[]> {
    let query = supabase
      .from('book_transactions')
      .select(`
        *,
        books!inner(title),
        library_members!inner(member_id),
        issued_by_profile:profiles!book_transactions_issued_by_fkey(first_name, last_name),
        returned_by_profile:profiles!book_transactions_returned_by_fkey(first_name, last_name)
      `)
      .eq('school_id', schoolId);

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.member_id) {
      query = query.eq('member_id', filters.member_id);
    }

    if (filters?.book_id) {
      query = query.eq('book_id', filters.book_id);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    // Transform data to include related information
    return (data || []).map(transaction => ({
      ...transaction,
      book_title: transaction.books?.title,
      member_name: transaction.library_members?.member_id,
      issued_by_name: transaction.issued_by_profile ? 
        `${transaction.issued_by_profile.first_name} ${transaction.issued_by_profile.last_name}` : undefined,
      returned_by_name: transaction.returned_by_profile ? 
        `${transaction.returned_by_profile.first_name} ${transaction.returned_by_profile.last_name}` : undefined,
    }));
  },

  async issueBook(schoolId: string, issueData: IssueBookData): Promise<BookTransaction> {
    // First, check if book is available
    const { data: book, error: bookError } = await supabase
      .from('books')
      .select('available_copies')
      .eq('id', issueData.book_id)
      .single();

    if (bookError) throw bookError;
    if (book.available_copies <= 0) {
      throw new Error('Book is not available for issue');
    }

    // Create transaction
    const { data, error } = await supabase
      .from('book_transactions')
      .insert({
        ...issueData,
        school_id: schoolId,
        issued_by: (await supabase.auth.getUser()).data.user?.id,
        transaction_type: 'issue',
        issue_date: new Date().toISOString().split('T')[0],
        status: 'issued'
      })
      .select()
      .single();

    if (error) throw error;

    // Decrement available copies
    await supabase.rpc('decrement_book_copies', { book_id: issueData.book_id });

    return data;
  },

  async returnBook(schoolId: string, returnData: ReturnBookData): Promise<BookTransaction> {
    const { data, error } = await supabase
      .from('book_transactions')
      .update({
        return_date: returnData.return_date,
        returned_by: (await supabase.auth.getUser()).data.user?.id,
        status: 'returned',
        fine_amount: returnData.fine_amount || 0,
        notes: returnData.notes
      })
      .eq('id', returnData.transaction_id)
      .eq('school_id', schoolId)
      .select()
      .single();

    if (error) throw error;

    // Increment available copies
    await supabase.rpc('increment_book_copies', { book_id: data.book_id });

    return data;
  },

  async renewBook(transactionId: string): Promise<BookTransaction> {
    const { data, error } = await supabase
      .from('book_transactions')
      .update({
        renewal_count: supabase.sql`renewal_count + 1`,
        due_date: supabase.sql`due_date + interval '14 days'`
      })
      .eq('id', transactionId)
      .eq('status', 'issued')
      .lt('renewal_count', supabase.sql`max_renewals`)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Book Reservations
  async getBookReservations(schoolId: string, status?: string): Promise<BookReservation[]> {
    let query = supabase
      .from('book_reservations')
      .select(`
        *,
        books!inner(title),
        library_members!inner(member_id)
      `)
      .eq('school_id', schoolId);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query.order('reservation_date', { ascending: false });

    if (error) throw error;

    return (data || []).map(reservation => ({
      ...reservation,
      book_title: reservation.books?.title,
      member_name: reservation.library_members?.member_id
    }));
  },

  async createReservation(schoolId: string, bookId: string, memberId: string): Promise<BookReservation> {
    const { data, error } = await supabase
      .from('book_reservations')
      .insert({
        book_id: bookId,
        member_id: memberId,
        school_id: schoolId,
        reservation_date: new Date().toISOString().split('T')[0],
        expiry_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 7 days
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateReservationStatus(reservationId: string, status: string): Promise<BookReservation> {
    const { data, error } = await supabase
      .from('book_reservations')
      .update({ status })
      .eq('id', reservationId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Library Settings
  async getLibrarySettings(schoolId: string): Promise<LibrarySettings | null> {
    const { data, error } = await supabase
      .from('library_settings')
      .select('*')
      .eq('school_id', schoolId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async updateLibrarySettings(schoolId: string, settings: Partial<LibrarySettings>): Promise<LibrarySettings> {
    const { data, error } = await supabase
      .from('library_settings')
      .upsert({
        ...settings,
        school_id: schoolId
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Library Stats
  async getLibraryStats(schoolId: string) {
    const [booksResult, membersResult, transactionsResult, reservationsResult] = await Promise.all([
      supabase.from('books').select('id', { count: 'exact' }).eq('school_id', schoolId).eq('is_active', true),
      supabase.from('library_members').select('id', { count: 'exact' }).eq('school_id', schoolId).eq('is_active', true),
      supabase.from('book_transactions').select('id', { count: 'exact' }).eq('school_id', schoolId).eq('status', 'issued'),
      supabase.from('book_reservations').select('id', { count: 'exact' }).eq('school_id', schoolId).eq('status', 'pending')
    ]);

    // Get overdue transactions
    const overdueResult = await supabase
      .from('book_transactions')
      .select('id', { count: 'exact' })
      .eq('school_id', schoolId)
      .eq('status', 'issued')
      .lt('due_date', new Date().toISOString().split('T')[0]);

    // Get total fines
    const finesResult = await supabase
      .from('book_transactions')
      .select('fine_amount')
      .eq('school_id', schoolId)
      .eq('fine_paid', false)
      .gt('fine_amount', 0);

    const totalFines = finesResult.data?.reduce((sum, transaction) => sum + Number(transaction.fine_amount), 0) || 0;

    return {
      total_books: booksResult.count || 0,
      total_members: membersResult.count || 0,
      books_issued: transactionsResult.count || 0,
      overdue_books: overdueResult.count || 0,
      total_fines: totalFines,
      pending_reservations: reservationsResult.count || 0
    };
  }
};
