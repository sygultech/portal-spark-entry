
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { 
  fetchDepartments, 
  createDepartment, 
  updateDepartment, 
  deleteDepartment,
  Department 
} from '@/services/departmentService';

export function useDepartments() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const schoolId = profile?.school_id;
  
  const departmentsQuery = useQuery({
    queryKey: ['departments', schoolId],
    queryFn: () => schoolId ? fetchDepartments(schoolId) : Promise.resolve([]),
    enabled: !!schoolId
  });

  const createMutation = useMutation({
    mutationFn: (department: Omit<Department, 'id' | 'created_at' | 'updated_at'>) => 
      createDepartment(department),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments', schoolId] });
    }
  });
  
  const updateMutation = useMutation({
    mutationFn: (department: Partial<Department> & { id: string }) => 
      updateDepartment(department),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments', schoolId] });
    }
  });
  
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteDepartment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments', schoolId] });
    }
  });

  return {
    departments: departmentsQuery.data || [],
    isLoading: departmentsQuery.isLoading,
    error: departmentsQuery.error,
    createDepartment: createMutation.mutate,
    updateDepartment: updateMutation.mutate,
    deleteDepartment: deleteMutation.mutate
  };
}
