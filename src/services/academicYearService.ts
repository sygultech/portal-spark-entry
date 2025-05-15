
import { supabase } from '@/integrations/supabase/client';
import { AcademicYear, CloneStructureOptions, CloneStructureResult } from '@/types/academic';

export async function fetchAcademicYears(schoolId?: string) {
  try {
    let query = supabase
      .from('academic_years')
      .select('*')
      .order('start_date', { ascending: false });
    
    if (schoolId) {
      query = query.eq('school_id', schoolId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      throw error;
    }
    
    return data as AcademicYear[];
  } catch (error) {
    console.error('Error fetching academic years:', error);
    throw error;
  }
}

export async function fetchAcademicYear(id: string) {
  try {
    const { data, error } = await supabase
      .from('academic_years')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      throw error;
    }
    
    return data as AcademicYear;
  } catch (error) {
    console.error('Error fetching academic year:', error);
    throw error;
  }
}

export async function createAcademicYear(academicYear: Omit<AcademicYear, 'id' | 'created_at' | 'updated_at'>) {
  try {
    const { data, error } = await supabase
      .from('academic_years')
      .insert(academicYear)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    if (!data) {
      throw new Error('Failed to create academic year: No data returned');
    }
    
    return data as AcademicYear;
  } catch (error) {
    console.error('Error creating academic year:', error);
    throw error;
  }
}

export async function updateAcademicYear(id: string, academicYear: Partial<AcademicYear>) {
  try {
    const { data, error } = await supabase
      .from('academic_years')
      .update(academicYear)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return data as AcademicYear;
  } catch (error) {
    console.error('Error updating academic year:', error);
    throw error;
  }
}

export async function deleteAcademicYear(id: string) {
  try {
    const { error } = await supabase
      .from('academic_years')
      .delete()
      .eq('id', id);
    
    if (error) {
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting academic year:', error);
    throw error;
  }
}

export async function setActiveAcademicYear(id: string, schoolId: string) {
  try {
    const { data, error } = await supabase
      .rpc('set_active_academic_year', {
        year_id: id,
        school_id: schoolId
      });
    
    if (error) {
      throw error;
    }
    
    // Fetch the updated academic year
    return await fetchAcademicYear(id);
  } catch (error) {
    console.error('Error setting active academic year:', error);
    throw error;
  }
}

export async function archiveAcademicYear(id: string) {
  try {
    const { data, error } = await supabase
      .rpc('archive_academic_year', {
        year_id: id
      });
    
    if (error) {
      throw error;
    }
    
    // Fetch the updated academic year
    return await fetchAcademicYear(id);
  } catch (error) {
    console.error('Error archiving academic year:', error);
    throw error;
  }
}

export async function cloneAcademicStructure(options: CloneStructureOptions) {
  try {
    const { data, error } = await supabase
      .rpc('clone_academic_structure', {
        source_year_id: options.source_year_id,
        target_year_id: options.target_year_id,
        clone_courses: options.clone_courses,
        clone_batches: options.clone_batches,
        clone_subjects: options.clone_subjects,
        clone_grading: options.clone_grading,
        clone_electives: options.clone_electives
      });
    
    if (error) {
      throw error;
    }
    
    return data as CloneStructureResult;
  } catch (error) {
    console.error('Error cloning academic structure:', error);
    throw error;
  }
}
