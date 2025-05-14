
import { supabase } from '@/integrations/supabase/client';
import { AcademicSettings, AcademicAuditLog } from '@/types/academic';

export async function fetchAcademicSettings(schoolId: string) {
  const { data, error } = await supabase
    .from('academic_settings')
    .select('*')
    .eq('school_id', schoolId)
    .maybeSingle();

  if (error) throw error;
  return data as AcademicSettings | null;
}

export async function createAcademicSettings(settings: Omit<AcademicSettings, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('academic_settings')
    .insert(settings)
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

export async function fetchAcademicAuditLogs(
  schoolId: string,
  entityType?: string,
  entityId?: string,
  limit = 50,
  offset = 0
) {
  let query = supabase
    .from('academic_audit_logs')
    .select(`
      *,
      user:user_id (id, first_name, last_name, email)
    `)
    .eq('school_id', schoolId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  
  if (entityType) {
    query = query.eq('entity_type', entityType);
  }
  
  if (entityId) {
    query = query.eq('entity_id', entityId);
  }
  
  const { data, error } = await query;

  if (error) throw error;
  return data;
}
