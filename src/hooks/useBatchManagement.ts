import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface Batch {
  id: string;
  name: string;
  course_id: string;
  academic_year_id: string;
  course: {
    name: string;
  };
  academic_year: {
    name: string;
    is_active: boolean;
  };
}

interface RawBatch {
  id: string;
  name: string;
  course_id: string;
  academic_year_id: string;
  courses: {
    name: string;
  } | null;
  academic_years: {
    name: string;
    is_current: boolean;
  } | null;
}

export function useBatchManagement() {
  const { profile } = useAuth();
  const schoolId = profile?.school_id;

  // Fetch active batches for the current academic year
  const activeBatchesQuery = useQuery({
    queryKey: ['activeBatches', schoolId],
    queryFn: async () => {
      if (!schoolId) return [];

      const { data, error } = await supabase
        .from('batches')
        .select(`
          id,
          name,
          course_id,
          academic_year_id,
          courses!course_id (
            name
          ),
          academic_years!academic_year_id (
            name,
            is_current
          )
        `)
        .eq('school_id', schoolId)
        .order('name');

      if (error) {
        console.error('Error fetching batches:', error);
        throw error;
      }

      // Debug: log the shape of the data
      console.log('Fetched batches:', data);

      // Filter for active academic years in JS and map to Batch interface
      return ((data as unknown) as RawBatch[] || [])
        .filter(batch => batch.academic_years?.is_current)
        .map(batch => ({
          id: batch.id,
          name: batch.name,
          course_id: batch.course_id,
          academic_year_id: batch.academic_year_id,
          course: {
            name: batch.courses?.name || ''
          },
          academic_year: {
            name: batch.academic_years?.name || '',
            is_active: batch.academic_years?.is_current || false
          }
        })) as Batch[];
    },
    enabled: !!schoolId
  });

  return {
    activeBatches: activeBatchesQuery.data || [],
    isLoading: activeBatchesQuery.isLoading,
    error: activeBatchesQuery.error
  };
} 
// force update
