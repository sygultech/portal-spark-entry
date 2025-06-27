
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
    queryFn: async () => {
      if (!schoolId) {
        console.log('useBooks - No school ID available');
        return [];
      }
      console.log('useBooks - Fetching books for school:', schoolId, 'with filters:', filters);
      return libraryService.getBooks(schoolId, filters);
    },
    enabled: !!schoolId,
    retry: (failureCount, error) => {
      console.error('useBooks - Query failed:', error);
      return failureCount < 2;
    }
  });
}

export function useLibraryMembers(memberType?: string) {
  const { profile } = useAuth();
  const schoolId = profile?.school_id;

  return useQuery({
    queryKey: ['library-members', schoolId, memberType],
    queryFn: async () => {
      if (!schoolId) {
        console.log('useLibraryMembers - No school ID available');
        return [];
      }
      console.log('useLibraryMembers - Fetching members for school:', schoolId, 'type:', memberType);
      return libraryService.getLibraryMembers(schoolId, memberType);
    },
    enabled: !!schoolId,
    retry: (failureCount, error) => {
      console.error('useLibraryMembers - Query failed:', error);
      return failureCount < 2;
    }
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
    queryFn: async () => {
      if (!schoolId) {
        console.log('useBookTransactions - No school ID available');
        return [];
      }
      console.log('useBookTransactions - Fetching transactions for school:', schoolId, 'with filters:', filters);
      return libraryService.getBookTransactions(schoolId, filters);
    },
    enabled: !!schoolId,
    retry: (failureCount, error) => {
      console.error('useBookTransactions - Query failed:', error);
      return failureCount < 2;
    }
  });
}

export function useLibrarySettings() {
  const { profile } = useAuth();
  const schoolId = profile?.school_id;

  return useQuery({
    queryKey: ['library-settings', schoolId],
    queryFn: async () => {
      if (!schoolId) {
        console.log('useLibrarySettings - No school ID available');
        return null;
      }
      console.log('useLibrarySettings - Fetching settings for school:', schoolId);
      return libraryService.getLibrarySettings(schoolId);
    },
    enabled: !!schoolId,
    retry: (failureCount, error) => {
      console.error('useLibrarySettings - Query failed:', error);
      return failureCount < 2;
    }
  });
}

export function useLibraryStats() {
  const { profile } = useAuth();
  const schoolId = profile?.school_id;

  return useQuery({
    queryKey: ['library-stats', schoolId],
    queryFn: async () => {
      if (!schoolId) {
        console.log('useLibraryStats - No school ID available');
        return {
          total_books: 0,
          total_members: 0,
          books_issued: 0,
          overdue_books: 0,
          total_fines: 0,
          pending_reservations: 0
        };
      }
      console.log('useLibraryStats - Fetching stats for school:', schoolId);
      return libraryService.getLibraryStats(schoolId);
    },
    enabled: !!schoolId,
    retry: (failureCount, error) => {
      console.error('useLibraryStats - Query failed:', error);
      return failureCount < 2;
    }
  });
}

export function useBookReservations(status?: string) {
  const { profile } = useAuth();
  const schoolId = profile?.school_id;

  return useQuery({
    queryKey: ['book-reservations', schoolId, status],
    queryFn: async () => {
      if (!schoolId) {
        console.log('useBookReservations - No school ID available');
        return [];
      }
      console.log('useBookReservations - Fetching reservations for school:', schoolId, 'status:', status);
      return libraryService.getBookReservations(schoolId, status);
    },
    enabled: !!schoolId,
    retry: (failureCount, error) => {
      console.error('useBookReservations - Query failed:', error);
      return failureCount < 2;
    }
  });
}

export function useLibraryMutations() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  const schoolId = profile?.school_id;

  const createBook = useMutation({
    mutationFn: (bookData: any) => {
      if (!schoolId) throw new Error('No school ID available');
      console.log('createBook - Creating book for school:', schoolId, bookData);
      return libraryService.createBook(schoolId, bookData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['library-stats'] });
      toast.success('Book added successfully');
    },
    onError: (error: Error) => {
      console.error('createBook - Error:', error);
      toast.error(`Failed to add book: ${error.message}`);
    }
  });

  const updateBook = useMutation({
    mutationFn: ({ bookId, updates }: { bookId: string; updates: any }) => {
      console.log('updateBook - Updating book:', bookId, updates);
      return libraryService.updateBook(bookId, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      toast.success('Book updated successfully');
    },
    onError: (error: Error) => {
      console.error('updateBook - Error:', error);
      toast.error(`Failed to update book: ${error.message}`);
    }
  });

  const deleteBook = useMutation({
    mutationFn: (bookId: string) => {
      console.log('deleteBook - Deleting book:', bookId);
      return libraryService.deleteBook(bookId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['library-stats'] });
      toast.success('Book deleted successfully');
    },
    onError: (error: Error) => {
      console.error('deleteBook - Error:', error);
      toast.error(`Failed to delete book: ${error.message}`);
    }
  });

  const createLibraryMember = useMutation({
    mutationFn: (memberData: any) => {
      if (!schoolId) throw new Error('No school ID available');
      console.log('createLibraryMember - Creating member for school:', schoolId, memberData);
      return libraryService.createLibraryMember(schoolId, memberData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library-members'] });
      queryClient.invalidateQueries({ queryKey: ['library-stats'] });
      toast.success('Library member added successfully');
    },
    onError: (error: Error) => {
      console.error('createLibraryMember - Error:', error);
      toast.error(`Failed to add library member: ${error.message}`);
    }
  });

  const issueBook = useMutation({
    mutationFn: (issueData: any) => {
      if (!schoolId) throw new Error('No school ID available');
      console.log('issueBook - Issuing book for school:', schoolId, issueData);
      return libraryService.issueBook(schoolId, issueData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['book-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['library-stats'] });
      toast.success('Book issued successfully');
    },
    onError: (error: Error) => {
      console.error('issueBook - Error:', error);
      toast.error(`Failed to issue book: ${error.message}`);
    }
  });

  const returnBook = useMutation({
    mutationFn: (returnData: any) => {
      if (!schoolId) throw new Error('No school ID available');
      console.log('returnBook - Returning book for school:', schoolId, returnData);
      return libraryService.returnBook(schoolId, returnData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['book-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['library-stats'] });
      toast.success('Book returned successfully');
    },
    onError: (error: Error) => {
      console.error('returnBook - Error:', error);
      toast.error(`Failed to return book: ${error.message}`);
    }
  });

  const renewBook = useMutation({
    mutationFn: (transactionId: string) => {
      console.log('renewBook - Renewing book transaction:', transactionId);
      return libraryService.renewBook(transactionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['book-transactions'] });
      toast.success('Book renewed successfully');
    },
    onError: (error: Error) => {
      console.error('renewBook - Error:', error);
      toast.error(`Failed to renew book: ${error.message}`);
    }
  });

  const updateLibrarySettings = useMutation({
    mutationFn: (settings: any) => {
      if (!schoolId) throw new Error('No school ID available');
      console.log('updateLibrarySettings - Updating settings for school:', schoolId, settings);
      return libraryService.updateLibrarySettings(schoolId, settings);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library-settings'] });
      toast.success('Library settings updated successfully');
    },
    onError: (error: Error) => {
      console.error('updateLibrarySettings - Error:', error);
      toast.error(`Failed to update settings: ${error.message}`);
    }
  });

  const updateReservationStatus = useMutation({
    mutationFn: ({ reservationId, status }: { reservationId: string; status: string }) => {
      console.log('updateReservationStatus - Updating reservation:', reservationId, 'to status:', status);
      return libraryService.updateReservationStatus(reservationId, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['book-reservations'] });
      toast.success('Reservation updated successfully');
    },
    onError: (error: Error) => {
      console.error('updateReservationStatus - Error:', error);
      toast.error(`Failed to update reservation: ${error.message}`);
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
    updateLibrarySettings,
    updateReservationStatus
  };
}
