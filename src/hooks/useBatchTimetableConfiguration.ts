
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
  break_type?: 'morning' | 'lunch' | 'afternoon';
}

export interface TimetableConfiguration {
  id: string;
  name: string;
  school_id: string;
  academic_year_id: string;
  is_active: boolean;
  is_default: boolean;
  periods: PeriodConfiguration[];
}

export interface BatchConfigurationMapping {
  id: string;
  batch_id: string;
  configuration_id: string;
  effective_from: string;
  effective_to?: string;
  configuration?: TimetableConfiguration;
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
          period_settings (
            id,
            period_number,
            start_time,
            end_time,
            period_type,
            label,
            is_break,
            break_type
          )
        `)
        .eq('school_id', schoolId)
        .eq('academic_year_id', academicYearId)
        .eq('is_active', true)
        .order('is_default', { ascending: false });

      if (configError) throw configError;

      // Transform the data to match our interface
      const transformedConfigs = configData.map(config => ({
        ...config,
        periods: (config.period_settings || []).sort((a, b) => a.period_number - b.period_number)
      }));

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
          effective_from,
          effective_to,
          configuration:timetable_configurations (
            id,
            name,
            school_id,
            academic_year_id,
            is_active,
            is_default
          )
        `)
        .eq('configuration.school_id', schoolId)
        .eq('configuration.academic_year_id', academicYearId)
        .order('effective_from', { ascending: false });

      if (error) throw error;
      setBatchMappings(data || []);
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
    const mapping = batchMappings.find(mapping => 
      mapping.batch_id === batchId &&
      (!mapping.effective_to || new Date(mapping.effective_to) >= new Date())
    );

    if (mapping) {
      const config = configurations.find(c => c.id === mapping.configuration_id);
      if (config) return config;
    }

    // If no specific mapping, return the default configuration
    return configurations.find(c => c.is_default) || null;
  }, [configurations, batchMappings]);

  const getTimeSlots = useCallback((batchId: string) => {
    const config = getBatchConfiguration(batchId);
    if (!config || !config.periods) {
      // Fallback to hardcoded periods if no configuration found
      return [
        { number: 1, start: "08:00", end: "08:45", type: 'class' },
        { number: 2, start: "08:45", end: "09:30", type: 'class' },
        { number: 3, start: "09:30", end: "10:15", type: 'class' },
        { number: 4, start: "10:30", end: "11:15", type: 'class' }, // After break
        { number: 5, start: "11:15", end: "12:00", type: 'class' },
        { number: 6, start: "12:00", end: "12:45", type: 'class' },
        { number: 7, start: "13:30", end: "14:15", type: 'class' }, // After lunch
        { number: 8, start: "14:15", end: "15:00", type: 'class' },
      ];
    }

    return config.periods
      .filter(p => !p.is_break)
      .map(p => ({
        number: p.period_number,
        start: p.start_time,
        end: p.end_time,
        type: p.period_type as 'class' | 'break'
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
    const breakPeriods = getBreakPeriods(batchId);
    return breakPeriods.some(bp => bp.number === periodNumber);
  }, [getBreakPeriods]);

  const getBreakInfo = useCallback((batchId: string, periodNumber: number) => {
    const breakPeriods = getBreakPeriods(batchId);
    return breakPeriods.find(bp => bp.number === periodNumber);
  }, [getBreakPeriods]);

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
    getTimeSlots,
    getBreakPeriods,
    isBreakTime,
    getBreakInfo
  };
};
