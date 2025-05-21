import { supabase } from "@/integrations/supabase/client";
import { NewStudentFormData, Student } from "@/types/student";

export const createStudent = async (data: NewStudentFormData, schoolId: string): Promise<Student | null> => {
  try {
    // First check if user exists in any school
    const { data: existingUser, error: existingUserError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: 'dummy-password-for-check'
    });

    if (existingUserError) {
      // If the error is not "Invalid login credentials", it's another issue
      if (!existingUserError.message.includes('Invalid login credentials')) {
        console.error('Error checking existing user:', existingUserError);
        throw existingUserError;
      }
      // If we get here, the user doesn't exist, which is what we want
    } else {
      // User exists, we should not proceed
      throw new Error('A user with this email already exists');
    }

    // ... existing code ...
  } catch (error) {
    console.error('Error creating student:', error);
    return null;
  }
}; 