
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { 
  fetchCourses, 
  fetchCourse, 
  createCourse, 
  updateCourse, 
  deleteCourse,
  assignSubjectToCourse,
  removeSubjectFromCourse,
  fetchCourseSubjects
} from '@/services/courseService';
import type { Course } from '@/types/academic';

export function useCourses(academicYearId?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch all courses
  const coursesQuery = useQuery({
    queryKey: ['courses', academicYearId],
    queryFn: () => fetchCourses(academicYearId),
    enabled: !!academicYearId
  });

  // Fetch a single course
  const getCourse = (id: string) => {
    return useQuery({
      queryKey: ['course', id],
      queryFn: () => fetchCourse(id),
      enabled: !!id
    });
  };

  // Create a new course
  const createCourseMutation = useMutation({
    mutationFn: (newCourse: Omit<Course, 'id' | 'created_at' | 'updated_at'>) => 
      createCourse(newCourse),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast({
        title: "Course Created",
        description: "The course has been created successfully."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create course",
        variant: "destructive"
      });
    }
  });

  // Update a course
  const updateCourseMutation = useMutation({
    mutationFn: ({ id, course }: { id: string, course: Partial<Course> }) => 
      updateCourse(id, course),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['course', id] });
      toast({
        title: "Course Updated",
        description: "The course has been updated successfully."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update course",
        variant: "destructive"
      });
    }
  });

  // Delete a course
  const deleteCourseMutation = useMutation({
    mutationFn: (id: string) => deleteCourse(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast({
        title: "Course Deleted",
        description: "The course has been deleted successfully."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete course",
        variant: "destructive"
      });
    }
  });

  // Assign subject to course
  const assignSubjectMutation = useMutation({
    mutationFn: ({ courseId, subjectId }: { courseId: string, subjectId: string }) => 
      assignSubjectToCourse(courseId, subjectId),
    onSuccess: (_, { courseId }) => {
      queryClient.invalidateQueries({ queryKey: ['courseSubjects', courseId] });
      toast({
        title: "Subject Assigned",
        description: "The subject has been assigned to the course."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to assign subject",
        variant: "destructive"
      });
    }
  });

  // Remove subject from course
  const removeSubjectMutation = useMutation({
    mutationFn: ({ courseId, subjectId }: { courseId: string, subjectId: string }) => 
      removeSubjectFromCourse(courseId, subjectId),
    onSuccess: (_, { courseId }) => {
      queryClient.invalidateQueries({ queryKey: ['courseSubjects', courseId] });
      toast({
        title: "Subject Removed",
        description: "The subject has been removed from the course."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove subject",
        variant: "destructive"
      });
    }
  });

  // Fetch subjects for a course
  const getCourseSubjects = (courseId: string) => {
    return useQuery({
      queryKey: ['courseSubjects', courseId],
      queryFn: () => fetchCourseSubjects(courseId),
      enabled: !!courseId
    });
  };

  return {
    courses: coursesQuery.data || [],
    isLoading: coursesQuery.isLoading,
    error: coursesQuery.error,
    getCourse,
    createCourse: createCourseMutation.mutate,
    updateCourse: updateCourseMutation.mutate,
    deleteCourse: deleteCourseMutation.mutate,
    assignSubject: assignSubjectMutation.mutate,
    removeSubject: removeSubjectMutation.mutate,
    getCourseSubjects,
    isCreating: createCourseMutation.isPending,
    isUpdating: updateCourseMutation.isPending,
    isDeleting: deleteCourseMutation.isPending
  };
}
