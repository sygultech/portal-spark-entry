
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { 
  fetchCourses, 
  createCourse, 
  updateCourse, 
  deleteCourse 
} from '@/services/courseService';
import { Course } from '@/types/academic';

export function useCourses(academicYearId?: string) {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const schoolId = profile?.school_id;
  
  const coursesQuery = useQuery({
    queryKey: ['courses', schoolId, academicYearId],
    queryFn: () => schoolId ? fetchCourses(schoolId, academicYearId) : Promise.resolve([]),
    enabled: !!schoolId
  });

  const createMutation = useMutation({
    mutationFn: (course: Omit<Course, 'id' | 'created_at' | 'updated_at'>) => 
      createCourse(course),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses', schoolId, academicYearId] });
    }
  });
  
  const updateMutation = useMutation({
    mutationFn: (course: Partial<Course> & { id: string }) => 
      updateCourse(course),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses', schoolId, academicYearId] });
    }
  });
  
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCourse(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses', schoolId, academicYearId] });
    }
  });

  return {
    courses: coursesQuery.data || [],
    isLoading: coursesQuery.isLoading,
    error: coursesQuery.error,
    createCourse: createMutation.mutate,
    updateCourse: updateMutation.mutate,
    deleteCourse: deleteMutation.mutate
  };
}

// force update

// force update
