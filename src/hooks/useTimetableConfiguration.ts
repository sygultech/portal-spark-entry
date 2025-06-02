import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface Period {
  id: string;
  number: number;
  startTime: string;
  endTime: string;
  type: 'period' | 'break';
  label?: string;
  dayOfWeek: string;
  isFortnightly: boolean;
  fortnightWeek: number | null;
}

interface SaveConfigurationParams {
  schoolId: string;
  name: string;
  isActive: boolean;
  isDefault: boolean;
  academicYearId: string;
  periods: Period[];
  batchIds?: string[];
}

export const useTimetableConfiguration = () => {
  const [isLoading, setIsLoading] = useState(false);

  const saveConfiguration = async ({
    schoolId,
    name,
    isActive,
    isDefault,
    academicYearId,
    periods,
    batchIds
  }: SaveConfigurationParams) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc('save_timetable_configuration', {
        p_school_id: schoolId,
        p_name: name,
        p_is_active: isActive,
        p_is_default: isDefault,
        p_academic_year_id: academicYearId,
        p_periods: periods,
        p_batch_ids: batchIds
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Timetable configuration saved successfully'
      });

      return data;
    } catch (error: any) {
      toast({
        title: 'Error saving configuration',
        description: error.message,
        variant: 'destructive'
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    saveConfiguration
  };
}; 