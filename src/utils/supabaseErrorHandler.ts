
import { toast } from "@/hooks/use-toast";

export type SupabaseError = {
  code: string;
  details?: string;
  hint?: string;
  message: string;
};

export const handleSupabaseError = (error: SupabaseError | null | unknown, defaultMessage: string = "An error occurred"): string => {
  if (!error) return defaultMessage;

  // If we got a regular Error object
  if (error instanceof Error) {
    return error.message;
  }

  // If we got a Supabase error object
  const supabaseError = error as SupabaseError;
  if (supabaseError.message) {
    // Common Supabase errors and user-friendly messages
    if (supabaseError.code === '23505') {
      return 'This record already exists.';
    }
    
    if (supabaseError.code === '23503') {
      return 'This action cannot be completed because it references non-existent data.';
    }
    
    if (supabaseError.code === '42P01') {
      return 'Database table not found. Please contact support.';
    }
    
    if (supabaseError.code === '42501') {
      return 'You do not have permission to perform this action.';
    }
    
    if (supabaseError.code === 'PGRST116') {
      return 'No data found.';
    }
    
    if (supabaseError.code === 'P0001') {
      // This is a custom error thrown from a PostgreSQL function
      return supabaseError.message;
    }
    
    return supabaseError.message;
  }

  return defaultMessage;
};

export const showErrorToast = (error: any, title = "Error", defaultMessage = "An unexpected error occurred") => {
  const errorMessage = handleSupabaseError(error, defaultMessage);
  
  toast({
    title: title,
    description: errorMessage,
    variant: "destructive"
  });
  
  return errorMessage;
};
