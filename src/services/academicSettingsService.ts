
import { supabase } from '@/integrations/supabase/client';
import { AcademicSettings } from '@/types/academic';

export async function fetchAcademicSettings(schoolId: string) {
  const { data, error } = await supabase
    .from('academic_settings')
    .select('*')
    .eq('school_id', schoolId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No settings found, create default settings
      return createDefaultAcademicSettings(schoolId);
    }
    throw error;
  }
  
  return data as AcademicSettings;
}

export async function createDefaultAcademicSettings(schoolId: string) {
  const { data, error } = await supabase
    .from('academic_settings')
    .insert({
      school_id: schoolId,
      enable_audit_log: true,
      student_self_enroll: false,
      teacher_edit_subjects: true
    })
    .select()
    .single();

  if (error) throw error;
  return data as AcademicSettings;
}

export async function updateAcademicSettings(id: string, settings: Partial<AcademicSettings>) {
  const { data, error } = await supabase
    .from('academic_settings')
    .update(settings)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as AcademicSettings;
}

export async function setDefaultAcademicYear(settingsId: string, academicYearId: string) {
  const { data, error } = await supabase
    .from('academic_settings')
    .update({ default_academic_year_id: academicYearId })
    .eq('id', settingsId)
    .select()
    .single();

  if (error) throw error;
  return data as AcademicSettings;
}

export async function fetchAcademicAuditLogs(schoolId: string, filters?: {
  entityType?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
}) {
  let query = supabase
    .from('academic_audit_logs')
    .select(`
      *,
      user:user_id (id, first_name, last_name, email)
    `)
    .eq('school_id', schoolId)
    .order('created_at', { ascending: false });
  
  if (filters?.entityType) {
    query = query.eq('entity_type', filters.entityType);
  }
  
  if (filters?.userId) {
    query = query.eq('user_id', filters.userId);
  }
  
  if (filters?.startDate) {
    query = query.gte('created_at', filters.startDate);
  }
  
  if (filters?.endDate) {
    query = query.lte('created_at', filters.endDate);
  }
  
  const { data, error } = await query;

  if (error) throw error;
  return data;
}
