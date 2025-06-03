import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Period } from '@/components/timetable/types/TimePeriodTypes';
import { useCallback } from 'react';

interface SaveTimetableConfigurationParams {
  schoolId: string;
  name: string;
  isActive: boolean;
  isDefault: boolean;
  academicYearId: string;
  isWeeklyMode: boolean;
  fortnightStartDate?: string | null;
  selectedDays: string[];
  defaultPeriods: Period[];
  daySpecificPeriods: Record<string, Period[]>;
  enableFlexibleTimings: boolean;
  batchIds?: string[] | null;
}

export const useTimetableConfiguration = () => {
  const getTimetableConfigurations = useCallback(async (schoolId: string, academicYearId: string) => {
    try {
      const { data, error } = await supabase.rpc('get_timetable_configurations', {
        p_school_id: schoolId,
        p_academic_year_id: academicYearId
      });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Error fetching timetable configurations:', error);
      toast({
        title: 'Error fetching configurations',
        description: error.message,
        variant: 'destructive'
      });
      return [];
    }
  }, []);

  const saveTimetableConfiguration = useCallback(async ({
    schoolId,
    name,
    isActive,
    isDefault,
    academicYearId,
    isWeeklyMode,
    fortnightStartDate,
    selectedDays,
    defaultPeriods,
    daySpecificPeriods,
    enableFlexibleTimings,
    batchIds
  }: SaveTimetableConfigurationParams) => {
    try {
      // Convert defaultPeriods to the format expected by the backend
      const formattedDefaultPeriods = defaultPeriods.map(period => ({
        number: period.number,
        startTime: period.startTime,
        endTime: period.endTime,
        type: period.type,
        label: period.label
      }));

      // Convert daySpecificPeriods to the format expected by the backend
      const formattedDaySpecificPeriods = Object.entries(daySpecificPeriods).reduce(
        (acc, [dayId, periods]) => ({
          ...acc,
          [dayId]: periods.map(period => ({
            number: period.number,
            startTime: period.startTime,
            endTime: period.endTime,
            type: period.type,
            label: period.label
          }))
        }),
        {}
      );

      const { data, error } = await supabase.rpc('save_timetable_configuration', {
        p_school_id: schoolId,
        p_name: name,
        p_is_active: isActive,
        p_is_default: isDefault,
        p_academic_year_id: academicYearId,
        p_is_weekly_mode: isWeeklyMode,
        p_fortnight_start_date: fortnightStartDate,
        p_selected_days: selectedDays,
        p_default_periods: formattedDefaultPeriods,
        p_day_specific_periods: formattedDaySpecificPeriods,
        p_enable_flexible_timings: enableFlexibleTimings,
        p_batch_ids: batchIds
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Timetable configuration saved successfully"
      });

      return data;
    } catch (error: any) {
      console.error('Error saving timetable configuration:', error);
      toast({
        title: 'Error saving configuration',
        description: error.message,
        variant: 'destructive'
      });
      return null;
    }
  }, []);

  return { saveTimetableConfiguration, getTimetableConfigurations };
}; 