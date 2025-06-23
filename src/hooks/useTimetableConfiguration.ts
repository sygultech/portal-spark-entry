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
  configId?: string; // Add configId for updates
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
  enableFlexibleTimings: boolean;
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
        const selectedDaysSet = new Set<string>();
        const daySpecificPeriods: Record<string, Period[]> = {};
        
        // Process periods from the database and create period objects
        const allPeriods: Period[] = [];
        const periodsByDayAndWeek: Record<string, Period[]> = {};

        // Determine if this is a weekly or fortnightly configuration
        const isWeeklyConfig = periodsData.every((period: any) => period.fortnightWeek === null);
        
        periodsData.forEach((period: any) => {
          const periodObj: Period = {
            id: period.id || `period-${period.number}`,
            number: period.number,
            startTime: period.startTime,
            endTime: period.endTime,
            type: period.type || 'period',
            label: period.label || (period.type === 'period' ? `Period ${period.number}` : period.label)
          };

          allPeriods.push(periodObj);

          // Construct day identifier based on fortnight_week value
          let dayId = period.dayOfWeek;
          
          if (!isWeeklyConfig && period.fortnightWeek !== null) {
            // Fortnightly mode - construct week-specific day ID
            dayId = `week${period.fortnightWeek}-${period.dayOfWeek}`;
          }

          // Add to selected days
          selectedDaysSet.add(dayId);

          // Group periods by day (and week for fortnightly)
          if (!periodsByDayAndWeek[dayId]) {
            periodsByDayAndWeek[dayId] = [];
          }
          periodsByDayAndWeek[dayId].push(periodObj);
        });

        // Sort periods within each day by period number
        Object.keys(periodsByDayAndWeek).forEach(dayId => {
          periodsByDayAndWeek[dayId].sort((a, b) => a.number - b.number);
        });

        // Determine if flexible timings are enabled
        let hasFlexibleTimings = false;
        let defaultPeriods: Period[] = [];

        if (Object.keys(periodsByDayAndWeek).length > 1) {
          // Check if different days have different schedules
          const dayKeys = Object.keys(periodsByDayAndWeek);
          const firstDaySchedule = periodsByDayAndWeek[dayKeys[0]];
          
          hasFlexibleTimings = dayKeys.some(dayKey => {
            const daySchedule = periodsByDayAndWeek[dayKey];
            if (daySchedule.length !== firstDaySchedule.length) return true;
            
            return daySchedule.some((period, index) => {
              const firstPeriod = firstDaySchedule[index];
              return period.startTime !== firstPeriod.startTime || 
                     period.endTime !== firstPeriod.endTime;
            });
          });
        }

        console.log('Is weekly config:', isWeeklyConfig);
        console.log('Has flexible timings:', hasFlexibleTimings);

        if (hasFlexibleTimings) {
          // For flexible timings, each day has its own schedule
          Object.entries(periodsByDayAndWeek).forEach(([dayId, periods]) => {
            daySpecificPeriods[dayId] = periods;
          });
        } else {
          // For uniform timings, create default periods from first day
          if (Object.keys(periodsByDayAndWeek).length > 0) {
            const firstDayKey = Object.keys(periodsByDayAndWeek)[0];
            const periodsFromFirstDay = periodsByDayAndWeek[firstDayKey];
            
            // Create unique periods based on period number
            const uniquePeriods = new Map<number, Period>();
            periodsFromFirstDay.forEach(period => {
              if (!uniquePeriods.has(period.number)) {
                uniquePeriods.set(period.number, period);
              }
            });
            
            defaultPeriods = Array.from(uniquePeriods.values()).sort((a, b) => a.number - b.number);
          }
        }

        return {
          id: config.id,
          name: config.name,
          isActive: config.isActive,
          isDefault: config.isDefault,
          academicYearId: config.academicYearId,
          isWeeklyMode: isWeeklyConfig,
          fortnightStartDate: config.fortnightStartDate,
          selectedDays: Array.from(selectedDaysSet),
          defaultPeriods: defaultPeriods,
          daySpecificPeriods: daySpecificPeriods,
          enableFlexibleTimings: hasFlexibleTimings,
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
    batchIds,
    configId
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

      let formattedDaySpecificPeriods = {};
      
      if (enableFlexibleTimings && Object.keys(daySpecificPeriods).length > 0) {
        // Modified: Handle fortnightly mode correctly
        formattedDaySpecificPeriods = Object.entries(daySpecificPeriods).reduce(
          (acc, [dayId, periods]) => {
            // For fortnightly mode, ensure the dayId format is preserved
            const formattedDayId = !isWeeklyMode && dayId.includes('week') 
              ? dayId  // Keep the week1-/week2- prefix for fortnightly mode
              : dayId; // Use as is for weekly mode

            return {
              ...acc,
              [formattedDayId]: periods.map(period => ({
                number: period.number,
                startTime: period.startTime,
                endTime: period.endTime,
                type: period.type,
                label: period.label,
                // Add fortnightWeek information for non-weekly mode
                ...((!isWeeklyMode && dayId.startsWith('week')) && {
                  fortnightWeek: parseInt(dayId.split('-')[0].replace('week', ''))
                })
              }))
            };
          },
          {}
        );
      }

      console.log('Sending to backend - Selected days:', selectedDays);
      console.log('Sending to backend - Day specific periods keys:', Object.keys(formattedDaySpecificPeriods));
      console.log('Sending to backend - Config ID for update:', configId);
      console.log('Sending to backend - Flexible timings enabled:', enableFlexibleTimings);
      console.log('Sending to backend - Weekly mode:', isWeeklyMode);

      let result;
      
      if (configId) {
        // Update existing configuration
        console.log('Updating existing configuration:', configId);
        
        // First, delete the existing configuration and its related data
        const { error: deleteError } = await supabase
          .from('timetable_configurations')
          .delete()
          .eq('id', configId);

        if (deleteError) {
          throw deleteError;
        }

        console.log('Deleted existing configuration, now creating new one with same data');
      }

      // Create new configuration or recreate updated one
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
        p_day_specific_periods: enableFlexibleTimings ? formattedDaySpecificPeriods : {},
        p_enable_flexible_timings: enableFlexibleTimings,
        p_batch_ids: batchIds || []
      });

      if (error) throw error;

      result = data;
      
      console.log('Configuration saved successfully:', result);
      
      toast({
        title: 'Success',
        description: `Timetable configuration ${configId ? 'updated' : 'created'} successfully`,
      });

      return result;
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
