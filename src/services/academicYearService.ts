
import { supabase } from "@/integrations/supabase/client";
import { AcademicYear } from "@/types/academic";
import { AcademicYearFormValues } from "@/components/academic/AcademicYearFormDialog";

// Get all academic years for a school
export const getAcademicYears = async (schoolId: string): Promise<AcademicYear[]> => {
  if (!schoolId) throw new Error("School ID is required");

  const { data, error } = await supabase
    .from('academic_years')
    .select('*')
    .eq('school_id', schoolId)
    .order('start_date', { ascending: false });

  if (error) throw error;
  return data as AcademicYear[];
};

// Get current academic year for a school
export const getCurrentAcademicYear = async (schoolId: string): Promise<AcademicYear | null> => {
  if (!schoolId) throw new Error("School ID is required");

  const { data, error } = await supabase
    .from('academic_years')
    .select('*')
    .eq('school_id', schoolId)
    .eq('is_current', true)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
  return data as AcademicYear | null;
};

// Create a new academic year
export const createAcademicYear = async (
  academicYear: AcademicYearFormValues,
  schoolId: string
): Promise<AcademicYear> => {
  if (!schoolId) throw new Error("School ID is required");

  const newYear = {
    name: academicYear.name,
    start_date: academicYear.start_date.toISOString().split('T')[0],
    end_date: academicYear.end_date.toISOString().split('T')[0],
    is_current: academicYear.is_current,
    is_locked: academicYear.is_locked,
    school_id: schoolId
  };

  const { data, error } = await supabase
    .from('academic_years')
    .insert(newYear)
    .select()
    .single();

  if (error) throw error;
  return data as AcademicYear;
};

// Update an existing academic year
export const updateAcademicYear = async (
  id: string,
  academicYear: AcademicYearFormValues
): Promise<AcademicYear> => {
  const updatedYear = {
    name: academicYear.name,
    start_date: academicYear.start_date.toISOString().split('T')[0],
    end_date: academicYear.end_date.toISOString().split('T')[0],
    is_current: academicYear.is_current,
    is_locked: academicYear.is_locked,
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('academic_years')
    .update(updatedYear)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as AcademicYear;
};

// Delete an academic year
export const deleteAcademicYear = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('academic_years')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
};

// Clone an academic year
export const cloneAcademicYear = async (
  sourceId: string, 
  newYear: AcademicYearFormValues,
  schoolId: string
): Promise<AcademicYear> => {
  // First create the new academic year
  const clonedYear = await createAcademicYear(newYear, schoolId);
  
  return clonedYear;
};

// Set academic year as current
export const setCurrentAcademicYear = async (id: string): Promise<AcademicYear> => {
  const { data, error } = await supabase
    .from('academic_years')
    .update({ is_current: true, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as AcademicYear;
};

// Lock or unlock an academic year
export const toggleLockAcademicYear = async (id: string, isLocked: boolean): Promise<AcademicYear> => {
  const { data, error } = await supabase
    .from('academic_years')
    .update({ is_locked: isLocked, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as AcademicYear;
};

// force update
