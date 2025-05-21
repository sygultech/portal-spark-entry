
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface Department {
  id: string;
  name: string;
  description: string | null;
  school_id: string;
  created_at: string;
  updated_at: string;
}

export async function fetchDepartments(schoolId: string) {
  try {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .eq('school_id', schoolId)
      .order('name');

    if (error) {
      throw error;
    }

    return data as Department[];
  } catch (error: any) {
    console.error('Error fetching departments:', error.message);
    throw error;
  }
}

export async function createDepartment(department: Omit<Department, 'id' | 'created_at' | 'updated_at'>) {
  try {
    const { data, error } = await supabase
      .from('departments')
      .insert(department)
      .select()
      .single();

    if (error) {
      throw error;
    }

    toast({
      title: 'Department created',
      description: `Department ${department.name} was successfully created.`
    });

    return data as Department;
  } catch (error: any) {
    console.error('Error creating department:', error.message);
    toast({
      title: 'Error creating department',
      description: error.message,
      variant: 'destructive'
    });
    throw error;
  }
}

export async function updateDepartment(department: Partial<Department> & { id: string }) {
  try {
    const { data, error } = await supabase
      .from('departments')
      .update(department)
      .eq('id', department.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    toast({
      title: 'Department updated',
      description: `Department was successfully updated.`
    });

    return data as Department;
  } catch (error: any) {
    console.error('Error updating department:', error.message);
    toast({
      title: 'Error updating department',
      description: error.message,
      variant: 'destructive'
    });
    throw error;
  }
}

export async function deleteDepartment(id: string) {
  try {
    const { error } = await supabase
      .from('departments')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    toast({
      title: 'Department deleted',
      description: 'Department was successfully deleted.'
    });

    return true;
  } catch (error: any) {
    console.error('Error deleting department:', error.message);
    toast({
      title: 'Error deleting department',
      description: error.message,
      variant: 'destructive'
    });
    throw error;
  }
}

// force update

// force update
