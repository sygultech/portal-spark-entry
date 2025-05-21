
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { SubjectCategory } from '@/types/academic';
import { useToast } from '@/hooks/use-toast';

export function useSubjectCategories() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const schoolId = profile?.school_id;

  const fetchSubjectCategories = async (): Promise<SubjectCategory[]> => {
    if (!schoolId) return [];
    
    const { data, error } = await supabase
      .from('subject_categories')
      .select('*')
      .eq('school_id', schoolId)
      .order('name');
    
    if (error) {
      console.error('Error fetching subject categories:', error);
      throw error;
    }
    
    return data;
  };

  const categoriesQuery = useQuery({
    queryKey: ['subject-categories', schoolId],
    queryFn: fetchSubjectCategories,
    enabled: !!schoolId
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (category: Omit<SubjectCategory, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('subject_categories')
        .insert({
          name: category.name,
          description: category.description,
          school_id: schoolId!
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating subject category:', error);
        toast({
          title: "Error",
          description: `Failed to create subject category: ${error.message}`,
          variant: "destructive"
        });
        throw error;
      }
      
      toast({
        title: "Success",
        description: "Subject category created successfully"
      });
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subject-categories', schoolId] });
    }
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async (category: Pick<SubjectCategory, 'id' | 'name' | 'description'>) => {
      const { data, error } = await supabase
        .from('subject_categories')
        .update({
          name: category.name,
          description: category.description,
          updated_at: new Date().toISOString()
        })
        .eq('id', category.id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating subject category:', error);
        toast({
          title: "Error",
          description: `Failed to update subject category: ${error.message}`,
          variant: "destructive"
        });
        throw error;
      }
      
      toast({
        title: "Success",
        description: "Subject category updated successfully"
      });
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subject-categories', schoolId] });
    }
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (categoryId: string) => {
      const { error } = await supabase
        .from('subject_categories')
        .delete()
        .eq('id', categoryId);
      
      if (error) {
        console.error('Error deleting subject category:', error);
        toast({
          title: "Error",
          description: `Failed to delete subject category: ${error.message}`,
          variant: "destructive"
        });
        throw error;
      }
      
      toast({
        title: "Success",
        description: "Subject category deleted successfully"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subject-categories', schoolId] });
    }
  });

  return {
    categories: categoriesQuery.data || [],
    isLoading: categoriesQuery.isLoading,
    error: categoriesQuery.error,
    createCategory: createCategoryMutation.mutate,
    updateCategory: updateCategoryMutation.mutate,
    deleteCategory: deleteCategoryMutation.mutate
  };
}

// force update

// force update
