
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { 
  fetchSubjects,
  fetchSubject,
  createSubject,
  updateSubject,
  deleteSubject,
  fetchSubjectCategories,
  createSubjectCategory,
  updateSubjectCategory,
  deleteSubjectCategory
} from '@/services/subjectService';
import type { Subject, SubjectCategory } from '@/types/academic';

export function useSubjects(academicYearId?: string, categoryId?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch all subjects
  const subjectsQuery = useQuery({
    queryKey: ['subjects', academicYearId, categoryId],
    queryFn: () => fetchSubjects(academicYearId, categoryId),
    enabled: (!!(academicYearId || categoryId))
  });

  // Fetch a single subject with details
  const getSubject = (id: string) => {
    return useQuery({
      queryKey: ['subject', id],
      queryFn: () => fetchSubject(id),
      enabled: !!id
    });
  };

  // Create a new subject
  const createSubjectMutation = useMutation({
    mutationFn: (newSubject: Omit<Subject, 'id' | 'created_at' | 'updated_at'>) => 
      createSubject(newSubject),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      queryClient.invalidateQueries({ queryKey: ['subjects', data.academic_year_id] });
      if (data.category_id) {
        queryClient.invalidateQueries({ queryKey: ['subjects', undefined, data.category_id] });
      }
      toast({
        title: "Subject Created",
        description: "The subject has been created successfully."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create subject",
        variant: "destructive"
      });
    }
  });

  // Update a subject
  const updateSubjectMutation = useMutation({
    mutationFn: ({ id, subject }: { id: string, subject: Partial<Subject> }) => 
      updateSubject(id, subject),
    onSuccess: (data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      queryClient.invalidateQueries({ queryKey: ['subject', id] });
      queryClient.invalidateQueries({ queryKey: ['subjects', data.academic_year_id] });
      if (data.category_id) {
        queryClient.invalidateQueries({ queryKey: ['subjects', undefined, data.category_id] });
      }
      toast({
        title: "Subject Updated",
        description: "The subject has been updated successfully."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update subject",
        variant: "destructive"
      });
    }
  });

  // Delete a subject
  const deleteSubjectMutation = useMutation({
    mutationFn: (id: string) => deleteSubject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      toast({
        title: "Subject Deleted",
        description: "The subject has been deleted successfully."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete subject",
        variant: "destructive"
      });
    }
  });

  return {
    subjects: subjectsQuery.data || [],
    isLoading: subjectsQuery.isLoading,
    error: subjectsQuery.error,
    getSubject,
    createSubject: createSubjectMutation.mutate,
    updateSubject: updateSubjectMutation.mutate,
    deleteSubject: deleteSubjectMutation.mutate,
    isCreating: createSubjectMutation.isPending,
    isUpdating: updateSubjectMutation.isPending,
    isDeleting: deleteSubjectMutation.isPending
  };
}

export function useSubjectCategories() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch all subject categories
  const categoriesQuery = useQuery({
    queryKey: ['subjectCategories'],
    queryFn: fetchSubjectCategories
  });

  // Create a new category
  const createCategoryMutation = useMutation({
    mutationFn: (newCategory: Omit<SubjectCategory, 'id' | 'created_at' | 'updated_at'>) => 
      createSubjectCategory(newCategory),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjectCategories'] });
      toast({
        title: "Category Created",
        description: "The subject category has been created successfully."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create category",
        variant: "destructive"
      });
    }
  });

  // Update a category
  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, category }: { id: string, category: Partial<SubjectCategory> }) => 
      updateSubjectCategory(id, category),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjectCategories'] });
      toast({
        title: "Category Updated",
        description: "The subject category has been updated successfully."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update category",
        variant: "destructive"
      });
    }
  });

  // Delete a category
  const deleteCategoryMutation = useMutation({
    mutationFn: (id: string) => deleteSubjectCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjectCategories'] });
      toast({
        title: "Category Deleted",
        description: "The subject category has been deleted successfully."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete category",
        variant: "destructive"
      });
    }
  });

  return {
    categories: categoriesQuery.data || [],
    isLoading: categoriesQuery.isLoading,
    error: categoriesQuery.error,
    createCategory: createCategoryMutation.mutate,
    updateCategory: updateCategoryMutation.mutate,
    deleteCategory: deleteCategoryMutation.mutate,
    isCreating: createCategoryMutation.isPending,
    isUpdating: updateCategoryMutation.isPending,
    isDeleting: deleteCategoryMutation.isPending
  };
}
