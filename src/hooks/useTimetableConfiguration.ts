
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

interface TimetableConfiguration {
  id: string;
  name: string;
  isActive: boolean;
  isDefault: boolean;
  academicYearId: string;
  isWeeklyMode: boolean;
  fortnightStartDate?: string;
  selectedDays: string[];
  defaultPeriods: Period[];
  daySpecificPeriods: Record<string, Period[]>;
  batchIds?: string[];
}

export const useTimetableConfiguration = () => {
  const getTimetableConfigurations = useCallback(async (schoolId: string, academicYearId: string): Promise<TimetableConfiguration[]> => {
    try {
      const { data, error } = await supabase.rpc('get_timetable_configurations', {
        p_school_id: schoolId,
        p_academic_year_id: academicYearId
      });

      if (error) throw error;
      
      // Transform the data to match our expected format
      return (data || []).map((config: any) => {
        console.log('Raw config data:', config);
        
        // Extract periods and group by day
        const periodsData = config.periods || [];
        const allPeriods: Period[] = [];
        const daySpecificPeriods: Record<string, Period[]> = {};
        const selectedDaysSet = new Set<string>();

        // Process periods from the database
        periodsData.forEach((period: any) => {
          const periodObj: Period = {
            id: period.id || `period-${period.number}`,
            number: period.number,
            startTime: period.startTime,
            endTime: period.endTime,
            type: period.type || 'period',
            label: period.label || (period.type === 'period' ? `Period ${period.number}` : period.label)
          };

          // Construct day identifier
          let dayId = period.dayOfWeek;
          if (!config.isFortnightly) {
            // Weekly mode - use day name directly
            selectedDaysSet.add(dayId);
          } else {
            // Fortnightly mode - construct week-specific day ID
            if (period.fortnightWeek) {
              dayId = `week${period.fortnightWeek}-${period.dayOfWeek}`;
              selectedDaysSet.add(dayId);
            }
          }

          // Check if this is a day-specific period or default period
          // For now, we'll treat all periods as default periods
          // You might need to add logic here to distinguish between default and day-specific periods
          allPeriods.push(periodObj);
        });

        // Sort periods by number
        allPeriods.sort((a, b) => a.number - b.number);

        return {
          id: config.id,
          name: config.name,
          isActive: config.isActive,
          isDefault: config.isDefault,
          academicYearId: config.academicYearId,
          isWeeklyMode: !config.isFortnightly,
          fortnightStartDate: config.fortnightStartDate,
          selectedDays: Array.from(selectedDaysSet),
          defaultPeriods: allPeriods,
          daySpecificPeriods,
          batchIds: config.batchIds || []
        };
      });
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
      // For fortnightly mode, we need to create periods for both weeks
      const processedSelectedDays = selectedDays.map(dayId => {
        if (isWeeklyMode) return { day: dayId, week: null };
        const [weekPart, dayPart] = dayId.split('-');
        return {
          day: dayPart,
          week: weekPart === 'week1' ? 1 : 2
        };
      });

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
        (acc, [dayId, periods]) => {
          // Extract week number and base day name for fortnightly mode
          const [weekPart, dayPart] = isWeeklyMode ? [null, dayId] : dayId.split('-');
          const weekNumber = weekPart === 'week1' ? 1 : weekPart === 'week2' ? 2 : null;
          const baseDayName = isWeeklyMode ? dayId : dayPart;

          return {
            ...acc,
            [dayId]: periods.map(period => ({
              number: period.number,
              startTime: period.startTime,
              endTime: period.endTime,
              type: period.type,
              label: period.label,
              day_of_week: baseDayName,
              fortnight_week: weekNumber
            }))
          };
        },
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
