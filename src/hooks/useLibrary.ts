
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { libraryService } from '@/services/libraryService';
import { toast } from 'sonner';

export function useBooks(filters?: {
  search?: string;
  genre?: string;
  availability?: 'all' | 'available' | 'issued';
}) {
  const { profile } = useAuth();
  const schoolId = profile?.school_id;

  return useQuery({
    queryKey: ['books', schoolId, filters],
    queryFn: () => schoolId ? libraryService.getBooks(schoolId, filters) : Promise.resolve([]),
    enabled: !!schoolId
  });
}

export function useLibraryMembers(memberType?: string) {
  const { profile } = useAuth();
  const schoolId = profile?.school_id;

  return useQuery({
    queryKey: ['library-members', schoolId, memberType],
    queryFn: () => schoolId ? libraryService.getLibraryMembers(schoolId, memberType) : Promise.resolve([]),
    enabled: !!schoolId
  });
}

export function useBookTransactions(filters?: {
  status?: string;
  member_id?: string;
  book_id?: string;
}) {
  const { profile } = useAuth();
  const schoolId = profile?.school_id;

  return useQuery({
    queryKey: ['book-transactions', schoolId, filters],
    queryFn: () => schoolId ? libraryService.getBookTransactions(schoolId, filters) : Promise.resolve([]),
    enabled: !!schoolId
  });
}

export function useLibrarySettings() {
  const { profile } = useAuth();
  const schoolId = profile?.school_id;

  return useQuery({
    queryKey: ['library-settings', schoolId],
    queryFn: () => schoolId ? libraryService.getLibrarySettings(schoolId) : Promise.resolve(null),
    enabled: !!schoolId
  });
}

export function useLibraryStats() {
  const { profile } = useAuth();
  const schoolId = profile?.school_id;

  return useQuery({
    queryKey: ['library-stats', schoolId],
    queryFn: () => schoolId ? libraryService.getLibraryStats(schoolId) : Promise.resolve({
      total_books: 0,
      total_members: 0,
      books_issued: 0,
      overdue_books: 0,
      total_fines: 0,
      pending_reservations: 0
    }),
    enabled: !!schoolId
  });
}

export function useBookReservations(status?: string) {
  const { profile } = useAuth();
  const schoolId = profile?.school_id;

  return useQuery({
    queryKey: ['book-reservations', schoolId, status],
    queryFn: () => schoolId ? libraryService.getBookReservations(schoolId, status) : Promise.resolve([]),
    enabled: !!schoolId
  });
}

export function useLibraryMutations() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  const schoolId = profile?.school_id;

  const createBook = useMutation({
    mutationFn: (bookData: any) => schoolId ? libraryService.createBook(schoolId, bookData) : Promise.reject('No school ID'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['library-stats'] });
      toast.success('Book added successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to add book: ${error.message}`);
    }
  });

  const updateBook = useMutation({
    mutationFn: ({ bookId, updates }: { bookId: string; updates: any }) => 
      libraryService.updateBook(bookId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      toast.success('Book updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update book: ${error.message}`);
    }
  });

  const deleteBook = useMutation({
    mutationFn: (bookId: string) => libraryService.deleteBook(bookId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['library-stats'] });
      toast.success('Book deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete book: ${error.message}`);
    }
  });

  const createLibraryMember = useMutation({
    mutationFn: (memberData: any) => schoolId ? libraryService.createLibraryMember(schoolId, memberData) : Promise.reject('No school ID'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library-members'] });
      queryClient.invalidateQueries({ queryKey: ['library-stats'] });
      toast.success('Library member added successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to add library member: ${error.message}`);
    }
  });

  const issueBook = useMutation({
    mutationFn: (issueData: any) => schoolId ? libraryService.issueBook(schoolId, issueData) : Promise.reject('No school ID'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['book-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['library-stats'] });
      toast.success('Book issued successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to issue book: ${error.message}`);
    }
  });

  const returnBook = useMutation({
    mutationFn: (returnData: any) => schoolId ? libraryService.returnBook(schoolId, returnData) : Promise.reject('No school ID'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['book-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['library-stats'] });
      toast.success('Book returned successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to return book: ${error.message}`);
    }
  });

  const renewBook = useMutation({
    mutationFn: (transactionId: string) => libraryService.renewBook(transactionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['book-transactions'] });
      toast.success('Book renewed successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to renew book: ${error.message}`);
    }
  });

  const updateLibrarySettings = useMutation({
    mutationFn: (settings: any) => schoolId ? libraryService.updateLibrarySettings(schoolId, settings) : Promise.reject('No school ID'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library-settings'] });
      toast.success('Library settings updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update settings: ${error.message}`);
    }
  });

  return {
    createBook,
    updateBook,
    deleteBook,
    createLibraryMember,
    issueBook,
    returnBook,
    renewBook,
    updateLibrarySettings
  };
}
