import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import {
  Student,
  StudentWithDetails,
  NewStudentFormData,
  StudentCategory,
  Guardian,
  DisciplinaryRecord,
  TransferRecord,
  Certificate,
  StudentFilter
} from '@/types/student';
import {
  fetchStudentsFromDetails,
  fetchStudentDetails,
  createStudent,
  updateStudent,
  deleteStudent,
  addGuardianToStudent,
  updateGuardian,
  createCategory,
  addStudentToCategory,
  removeStudentFromCategory,
  fetchCategories,
  addDisciplinaryRecord,
  addTransferRecord,
  generateCertificate,
  importStudentsFromCSV,
  bulkAssignBatch,
  fetchStudents
} from '@/services/studentService';

export function useStudentManagement(filters?: StudentFilter) {
  const { profile } = useAuth();
  const schoolId = profile?.school_id;
  const queryClient = useQueryClient();

  // Fetch students query
  const studentsQuery = useQuery({
    queryKey: ['students', schoolId, filters],
    queryFn: async () => {
      console.log('useStudentManagement - queryFn called with schoolId:', schoolId);
      if (!schoolId) {
        console.log('useStudentManagement - No schoolId, returning empty array');
        return [];
      }
      console.log('useStudentManagement - Calling fetchStudentsFromDetails with schoolId:', schoolId);
      const students = await fetchStudentsFromDetails(schoolId);
      
      // Apply filters if provided
      if (filters) {
        return students.filter(student => {
          let match = true;
          
          if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            const fullName = `${student.first_name} ${student.last_name}`.toLowerCase();
            match = match && (
              fullName.includes(searchTerm) ||
              student.email?.toLowerCase().includes(searchTerm) ||
              student.admission_number?.toLowerCase().includes(searchTerm)
            );
          }
          
          if (filters.batch_id) {
            match = match && student.batch_id === filters.batch_id;
          }
          
          if (filters.status) {
            match = match && student.status === filters.status;
          }
          
          // More filters can be applied here
          
          return match;
        });
      }
      
      return students;
    },
    enabled: !!schoolId
  });

  console.log('useStudentManagement hook state:', {
    schoolId,
    enabled: !!schoolId,
    studentsData: studentsQuery.data?.length || 0,
    isLoading: studentsQuery.isLoading,
    error: studentsQuery.error
  });

  // Fetch student details query
  const useStudentDetails = (studentId: string | null) => {
    return useQuery({
      queryKey: ['student', studentId],
      queryFn: async () => {
        if (!studentId) return null;
        return await fetchStudentDetails(studentId);
      },
      enabled: !!studentId
    });
  };

  // Fetch categories query
  const categoriesQuery = useQuery({
    queryKey: ['studentCategories', schoolId],
    queryFn: async () => {
      if (!schoolId) return [];
      return await fetchCategories(schoolId);
    },
    enabled: !!schoolId
  });

  // Create student mutation
  const createStudentMutation = useMutation({
    mutationFn: async (data: any) => {
      // Log the incoming data
      console.log('Mutation incoming data:', data);

      // Validate required fields
      if (!data.admission_number) {
        throw new Error('Admission number is required');
      }
      if (!data.batch_id) {
        throw new Error('Batch is required');
      }
      if (!data.gender) {
        throw new Error('Gender is required');
      }

      // The data is already in snake_case, so we just need to ensure all required fields are present
      const transformedData = {
        admission_number: data.admission_number,
        school_id: schoolId, // Use the schoolId from the hook
        gender: data.gender,
        batch_id: data.batch_id,
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        date_of_birth: data.date_of_birth || null,
        address: data.address || null,
        nationality: data.nationality || null,
        mother_tongue: data.mother_tongue || null,
        blood_group: data.blood_group || null,
        religion: data.religion || null,
        caste: data.caste || null,
        category: data.category || null,
        phone: data.phone || null,
        previous_school_name: data.previous_school_name || null,
        previous_school_board: data.previous_school_board || null,
        previous_school_year: data.previous_school_year || null,
        previous_school_percentage: data.previous_school_percentage || null,
        guardians: data.guardians || [] // Include guardians array
      };

      // Log the transformed data
      console.log('Mutation transformed data:', transformedData);

      return createStudent(transformedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast({
        title: 'Success',
        description: 'Student created successfully',
      });
    },
    onError: (error: any) => {
      console.error('Mutation error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create student',
        variant: 'destructive',
      });
    }
  });

  // Update student mutation
  const updateStudentMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<NewStudentFormData> }) => {
      if (!schoolId) {
        throw new Error("School ID is required");
      }
      return updateStudent(id, data, schoolId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['students', schoolId] });
      queryClient.invalidateQueries({ queryKey: ['student', variables.id] });
      toast({
        title: 'Success',
        description: 'Student updated successfully',
      });
    }
  });

  // Delete student mutation
  const deleteStudentMutation = useMutation({
    mutationFn: (id: string) => {
      return deleteStudent(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students', schoolId] });
      toast({
        title: 'Success',
        description: 'Student deleted successfully',
      });
    }
  });

  // Add guardian mutation
  const addGuardianMutation = useMutation({
    mutationFn: ({ studentId, guardianData }: { studentId: string, guardianData: Omit<Guardian, 'id' | 'school_id'> & { is_primary?: boolean } }) => {
      if (!schoolId) {
        throw new Error("School ID is required");
      }
      return addGuardianToStudent(studentId, guardianData, schoolId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['student', variables.studentId] });
      toast({
        title: 'Success',
        description: 'Guardian added successfully',
      });
    }
  });

  // Update guardian mutation
  const updateGuardianMutation = useMutation({
    mutationFn: ({ guardianId, guardianData }: { guardianId: string, guardianData: Partial<Guardian> }) => {
      return updateGuardian(guardianId, guardianData);
    },
    onSuccess: () => {
      // We need to invalidate all student queries since multiple students might share guardians
      queryClient.invalidateQueries({ queryKey: ['student'] });
      toast({
        title: 'Success',
        description: 'Guardian updated successfully',
      });
    }
  });

  // Create category mutation
  const createCategoryMutation = useMutation({
    mutationFn: ({ name, description, color }: { name: string, description?: string, color?: string }) => {
      if (!schoolId) {
        throw new Error("School ID is required");
      }
      return createCategory(name, description || null, color || null, schoolId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentCategories', schoolId] });
      toast({
        title: 'Success',
        description: 'Category created successfully',
      });
    }
  });

  // Add student to category mutation
  const addToCategoryMutation = useMutation({
    mutationFn: ({ studentId, categoryId }: { studentId: string, categoryId: string }) => {
      return addStudentToCategory(studentId, categoryId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['student', variables.studentId] });
      toast({
        title: 'Success',
        description: 'Student added to category successfully',
      });
    }
  });

  // Remove student from category mutation
  const removeFromCategoryMutation = useMutation({
    mutationFn: ({ studentId, categoryId }: { studentId: string, categoryId: string }) => {
      return removeStudentFromCategory(studentId, categoryId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['student', variables.studentId] });
      toast({
        title: 'Success',
        description: 'Student removed from category successfully',
      });
    }
  });

  // Add disciplinary record mutation
  const addDisciplinaryRecordMutation = useMutation({
    mutationFn: ({ 
      studentId, 
      data, 
      evidenceFiles 
    }: { 
      studentId: string, 
      data: Omit<DisciplinaryRecord, 'id' | 'student_id' | 'created_at' | 'updated_at'>, 
      evidenceFiles?: { type: string; file: File }[] 
    }) => {
      return addDisciplinaryRecord(studentId, data, evidenceFiles);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['student', variables.studentId] });
      toast({
        title: 'Success',
        description: 'Disciplinary record added successfully',
      });
    }
  });

  // Add transfer record mutation
  const addTransferRecordMutation = useMutation({
    mutationFn: (data: Omit<TransferRecord, 'id' | 'created_at' | 'updated_at'>) => {
      return addTransferRecord(data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['student', variables.student_id] });
      queryClient.invalidateQueries({ queryKey: ['students', schoolId] });
      toast({
        title: 'Success',
        description: 'Transfer record added successfully',
      });
    }
  });

  // Generate certificate mutation
  const generateCertificateMutation = useMutation({
    mutationFn: (data: Omit<Certificate, 'id' | 'created_at' | 'updated_at'>) => {
      return generateCertificate(data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['student', variables.student_id] });
      toast({
        title: 'Success',
        description: 'Certificate generated successfully',
      });
    }
  });

  // Import students from CSV mutation
  const importStudentsMutation = useMutation({
    mutationFn: (students: Array<NewStudentFormData>) => {
      if (!schoolId) {
        throw new Error("School ID is required");
      }
      return importStudentsFromCSV(students, schoolId);
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['students', schoolId] });
      toast({
        title: 'Import Complete',
        description: `Successfully imported ${result.success} students. Failed: ${result.failed}`,
        variant: result.failed > 0 ? 'destructive' : 'default',
      });
    }
  });

  // Bulk assign batch mutation
  const bulkAssignBatchMutation = useMutation({
    mutationFn: ({ studentIds, batchId }: { studentIds: string[], batchId: string }) => {
      return bulkAssignBatch(studentIds, batchId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students', schoolId] });
      toast({
        title: 'Success',
        description: 'Students assigned to batch successfully',
      });
    }
  });

  return {
    // Queries
    students: studentsQuery.data || [],
    isStudentsLoading: studentsQuery.isLoading,
    studentsError: studentsQuery.error,
    
    useStudentDetails,
    
    categories: categoriesQuery.data || [],
    isCategoriesLoading: categoriesQuery.isLoading,
    categoriesError: categoriesQuery.error,
    
    // Mutations
    createStudent: createStudentMutation.mutate,
    isCreatingStudent: createStudentMutation.isPending,
    
    updateStudent: updateStudentMutation.mutate,
    isUpdatingStudent: updateStudentMutation.isPending,
    
    deleteStudent: deleteStudentMutation.mutate,
    isDeletingStudent: deleteStudentMutation.isPending,
    
    addGuardian: addGuardianMutation.mutate,
    isAddingGuardian: addGuardianMutation.isPending,
    
    updateGuardian: updateGuardianMutation.mutate,
    isUpdatingGuardian: updateGuardianMutation.isPending,
    
    createCategory: createCategoryMutation.mutate,
    isCreatingCategory: createCategoryMutation.isPending,
    
    addToCategory: addToCategoryMutation.mutate,
    isAddingToCategory: addToCategoryMutation.isPending,
    
    removeFromCategory: removeFromCategoryMutation.mutate,
    isRemovingFromCategory: removeFromCategoryMutation.isPending,
    
    addDisciplinaryRecord: addDisciplinaryRecordMutation.mutate,
    isAddingDisciplinaryRecord: addDisciplinaryRecordMutation.isPending,
    
    addTransferRecord: addTransferRecordMutation.mutate,
    isAddingTransferRecord: addTransferRecordMutation.isPending,
    
    generateCertificate: generateCertificateMutation.mutate,
    isGeneratingCertificate: generateCertificateMutation.isPending,
    
    importStudents: importStudentsMutation.mutate,
    isImportingStudents: importStudentsMutation.isPending,
    
    bulkAssignBatch: bulkAssignBatchMutation.mutate,
    isAssigningBatch: bulkAssignBatchMutation.isPending,
  };
}

export const useStudentsWithBatchInfo = () => {
  const { profile } = useAuth();
  const schoolId = profile?.school_id;
  
  const studentsQuery = useQuery({
    queryKey: ['students-with-batch', schoolId],
    queryFn: async () => {
      if (!schoolId) return [];
      return await fetchStudents(schoolId);
    },
    enabled: !!schoolId
  });

  return {
    students: studentsQuery.data || [],
    isLoading: studentsQuery.isLoading,
    error: studentsQuery.error
  };
};
