import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export interface PeriodConfiguration {
  id: string;
  period_number: number;
  start_time: string;
  end_time: string;
  period_type: 'class' | 'break';
  label?: string;
  is_break: boolean;
  day_of_week?: string;
  break_type?: 'morning' | 'lunch' | 'afternoon';
}

export interface TimetableConfiguration {
  id: string;
  name: string;
  school_id: string;
  academic_year_id: string;
  is_active: boolean;
  is_default: boolean;
  selected_days?: string[];
  periods: PeriodConfiguration[];
}

export interface BatchConfigurationMapping {
  id: string;
  batch_id: string;
  configuration_id: string;
  configuration?: {
    id: string;
    name: string;
    school_id: string;
    academic_year_id: string;
    is_active: boolean;
    is_default: boolean;
  };
}

export const useBatchTimetableConfiguration = (schoolId: string, academicYearId?: string) => {
  const [configurations, setConfigurations] = useState<TimetableConfiguration[]>([]);
  const [batchMappings, setBatchMappings] = useState<BatchConfigurationMapping[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchConfigurations = useCallback(async () => {
    if (!schoolId || !academicYearId) return;
    
    setIsLoading(true);
    try {
      const { data: configData, error: configError } = await supabase
        .from('timetable_configurations')
        .select(`
          id,
          name,
          school_id,
          academic_year_id,
          is_active,
          is_default,
          selected_days,
          period_settings (
            id,
            period_number,
            start_time,
            end_time,
            type,
            label,
            day_of_week
          )
        `)
        .eq('school_id', schoolId)
        .eq('academic_year_id', academicYearId)
        .eq('is_active', true)
        .order('is_default', { ascending: false });

      if (configError) throw configError;

      // Transform the data to match our interface
      const transformedConfigs: TimetableConfiguration[] = configData?.map(config => {
        // Group periods by period_number to remove duplicates across days
        const periodsMap = new Map();
        
        (config.period_settings || []).forEach(p => {
          const key = p.period_number;
          if (!periodsMap.has(key)) {
            const isBreak = p.type === 'break';
            const periodType: 'class' | 'break' = isBreak ? 'break' : 'class';
            
            periodsMap.set(key, {
              id: p.id,
              period_number: p.period_number,
              start_time: p.start_time,
              end_time: p.end_time,
              period_type: periodType,
              label: p.label,
              is_break: isBreak,
              day_of_week: p.day_of_week,
              break_type: isBreak ? (
                p.label?.toLowerCase().includes('lunch') ? 'lunch' as const :
                p.label?.toLowerCase().includes('morning') || p.label?.toLowerCase().includes('mom') ? 'morning' as const : 
                'afternoon' as const
              ) : undefined
            });
          }
        });

        // Convert map to array and sort by period number
        const uniquePeriods = Array.from(periodsMap.values())
          .sort((a, b) => a.period_number - b.period_number);

        return {
          id: config.id,
          name: config.name,
          school_id: config.school_id,
          academic_year_id: config.academic_year_id,
          is_active: config.is_active,
          is_default: config.is_default,
          selected_days: config.selected_days || [],
          periods: uniquePeriods
        };
      }) || [];

      setConfigurations(transformedConfigs);
    } catch (error: any) {
      console.error('Error fetching timetable configurations:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch timetable configurations',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [schoolId, academicYearId]);

  const fetchBatchMappings = useCallback(async () => {
    if (!schoolId || !academicYearId) return;
    
    try {
      const { data, error } = await supabase
        .from('batch_configuration_mapping')
        .select(`
          id,
          batch_id,
          configuration_id,
          timetable_configurations!batch_configuration_mapping_configuration_id_fkey (
            id,
            name,
            school_id,
            academic_year_id,
            is_active,
            is_default
          )
        `)
        .eq('timetable_configurations.school_id', schoolId)
        .eq('timetable_configurations.academic_year_id', academicYearId);

      if (error) throw error;

      // Transform the data to match our interface
      const transformedMappings = data?.map(mapping => ({
        id: mapping.id,
        batch_id: mapping.batch_id,
        configuration_id: mapping.configuration_id,
        configuration: Array.isArray(mapping.timetable_configurations) 
          ? mapping.timetable_configurations[0] 
          : mapping.timetable_configurations
      })) || [];

      setBatchMappings(transformedMappings);
    } catch (error: any) {
      console.error('Error fetching batch mappings:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch batch configuration mappings',
        variant: 'destructive'
      });
    }
  }, [schoolId, academicYearId]);

  const getBatchConfiguration = useCallback((batchId: string): TimetableConfiguration | null => {
    // First, check if there's a specific mapping for this batch
    const mapping = batchMappings.find(mapping => mapping.batch_id === batchId);

    if (mapping) {
      const config = configurations.find(c => c.id === mapping.configuration_id);
      if (config) return config;
    }

    // If no specific mapping, return the default configuration
    return configurations.find(c => c.is_default) || null;
  }, [configurations, batchMappings]);

  const getSelectedDays = useCallback((batchId: string): string[] => {
    const config = getBatchConfiguration(batchId);
    if (!config || !config.selected_days || config.selected_days.length === 0) {
      console.log('No selected days found in config, using fallback for batch:', batchId);
      return ["monday", "tuesday", "wednesday", "thursday", "friday"];
    }

    console.log('Using selected days from config for batch:', batchId, config.selected_days);
    return config.selected_days;
  }, [getBatchConfiguration]);

  const getTimeSlots = useCallback((batchId: string) => {
    const config = getBatchConfiguration(batchId);
    if (!config || !config.periods) {
      console.log('No configuration found for batch:', batchId, 'using fallback periods');
      // Fallback to hardcoded periods if no configuration found
      return [
        { number: 1, start: "08:00", end: "08:45", type: 'class' as const },
        { number: 2, start: "08:45", end: "09:30", type: 'class' as const },
        { number: 3, start: "09:30", end: "10:15", type: 'class' as const },
        { number: 4, start: "10:30", end: "11:15", type: 'class' as const },
        { number: 5, start: "11:15", end: "12:00", type: 'class' as const },
        { number: 6, start: "12:00", end: "12:45", type: 'class' as const },
        { number: 7, start: "13:30", end: "14:15", type: 'class' as const },
        { number: 8, start: "14:15", end: "15:00", type: 'class' as const },
      ];
    }

    console.log('Using config periods for batch:', batchId, config.periods);
    return config.periods
      .filter(p => !p.is_break)
      .map(p => ({
        number: p.period_number,
        start: p.start_time,
        end: p.end_time,
        type: p.period_type
      }));
  }, [getBatchConfiguration]);

  const getBreakPeriods = useCallback((batchId: string) => {
    const config = getBatchConfiguration(batchId);
    if (!config || !config.periods) {
      // Fallback break periods
      return [
        { number: 4, type: 'morning', label: 'Morning Break' },
        { number: 7, type: 'lunch', label: 'Lunch Break' }
      ];
    }

    return config.periods
      .filter(p => p.is_break)
      .map(p => ({
        number: p.period_number,
        type: p.break_type || 'break',
        label: p.label || `${p.break_type || 'Break'} Break`
      }));
  }, [getBatchConfiguration]);

  const isBreakTime = useCallback((batchId: string, periodNumber: number) => {
    const config = getBatchConfiguration(batchId);
    if (!config || !config.periods) {
      // Fallback break detection
      return periodNumber === 4 || periodNumber === 7;
    }

    return config.periods.some(p => p.period_number === periodNumber && p.is_break);
  }, [getBatchConfiguration]);

  const getBreakInfo = useCallback((batchId: string, periodNumber: number) => {
    const config = getBatchConfiguration(batchId);
    if (!config || !config.periods) {
      // Fallback break info
      if (periodNumber === 4) return { type: 'morning', label: 'Morning Break' };
      if (periodNumber === 7) return { type: 'lunch', label: 'Lunch Break' };
      return null;
    }

    const breakPeriod = config.periods.find(p => p.period_number === periodNumber && p.is_break);
    if (!breakPeriod) return null;

    return {
      type: breakPeriod.break_type || 'break',
      label: breakPeriod.label || `${breakPeriod.break_type || 'Break'} Break`
    };
  }, [getBatchConfiguration]);

  const getAllPeriods = useCallback((batchId: string) => {
    const config = getBatchConfiguration(batchId);
    if (!config || !config.periods || config.periods.length === 0) {
      console.log('No periods found in config, using fallback for batch:', batchId);
      // Fallback periods including breaks
      return [
        { number: 1, start: "08:00", end: "08:45", type: 'class', label: 'Period 1' },
        { number: 2, start: "08:45", end: "09:30", type: 'class', label: 'Period 2' },
        { number: 3, start: "09:30", end: "10:15", type: 'class', label: 'Period 3' },
        { number: 3.5, start: "10:15", end: "10:30", type: 'break', label: 'Morning Break' },
        { number: 4, start: "10:30", end: "11:15", type: 'class', label: 'Period 4' },
        { number: 5, start: "11:15", end: "12:00", type: 'class', label: 'Period 5' },
        { number: 6, start: "12:00", end: "12:45", type: 'class', label: 'Period 6' },
        { number: 6.5, start: "12:45", end: "13:30", type: 'break', label: 'Lunch Break' },
        { number: 7, start: "13:30", end: "14:15", type: 'class', label: 'Period 7' },
        { number: 8, start: "14:15", end: "15:00", type: 'class', label: 'Period 8' },
      ];
    }

    console.log('Using periods from config for batch:', batchId, config.periods);
    return config.periods
      .map(p => ({
        number: p.period_number,
        start: p.start_time,
        end: p.end_time,
        type: p.is_break ? 'break' : 'class',
        label: p.label || (p.is_break ? `${p.break_type || 'Break'} Break` : `Period ${p.period_number}`)
      }))
      .sort((a, b) => a.number - b.number);
  }, [getBatchConfiguration]);

  useEffect(() => {
    if (schoolId && academicYearId) {
      fetchConfigurations();
      fetchBatchMappings();
    }
  }, [schoolId, academicYearId, fetchConfigurations, fetchBatchMappings]);

  return {
    configurations,
    batchMappings,
    isLoading,
    fetchConfigurations,
    fetchBatchMappings,
    getBatchConfiguration,
    getSelectedDays,
    getTimeSlots,
    getBreakPeriods,
    isBreakTime,
    getBreakInfo,
    getAllPeriods
  };
};
