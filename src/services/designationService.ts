import { supabase } from '@/integrations/supabase/client';

export interface Designation {
  id: string;
  name: string;
  description: string | null;
  department_id: string;
  school_id: string;
  created_at: string;
  updated_at: string;
  departments?: {
    id: string;
    name: string;
  };
}

export interface CreateDesignationData {
  name: string;
  description?: string;
  department_id: string;
  school_id: string;
}

export interface UpdateDesignationData {
  name?: string;
  description?: string;
  department_id?: string;
}

export const designationService = {
  async getDesignations(schoolId: string): Promise<Designation[]> {
    const { data, error } = await supabase
      .from('designations')
      .select(`
        *,
        departments (
          id,
          name
        )
      `)
      .eq('school_id', schoolId)
      .order('name');

    if (error) throw error;
    return data;
  },

  async createDesignation(data: CreateDesignationData): Promise<Designation> {
    const { data: newDesignation, error } = await supabase
      .from('designations')
      .insert([data])
      .select(`
        *,
        departments (
          id,
          name
        )
      `)
      .single();

    if (error) throw error;
    return newDesignation;
  },

  async updateDesignation(id: string, data: UpdateDesignationData): Promise<Designation> {
    const { data: updatedDesignation, error } = await supabase
      .from('designations')
      .update(data)
      .eq('id', id)
      .select(`
        *,
        departments (
          id,
          name
        )
      `)
      .single();

    if (error) throw error;
    return updatedDesignation;
  },

  async deleteDesignation(id: string): Promise<void> {
    const { error } = await supabase
      .from('designations')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}; 