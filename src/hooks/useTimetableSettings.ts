import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { TimetableConfiguration, SaveTimetableConfigurationParams } from '@/types/timetable';
import { useAuth } from '@/contexts/AuthContext';

export const useTimetableSettings = (academicYearId: string) => {
  const [configurations, setConfigurations] = useState<TimetableConfiguration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchConfigurations = async () => {
    if (!user?.schoolId || !academicYearId) return;

    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.rpc(
        'get_timetable_configurations',
        {
          p_school_id: user.schoolId,
          p_academic_year_id: academicYearId
        }
      );

      if (error) throw error;

      setConfigurations(data || []);
    } catch (err: any) {
      console.error('Error fetching timetable configurations:', err);
      setError(err.message);
      toast({
        title: 'Error',
        description: 'Failed to load timetable configurations',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveConfiguration = async (params: SaveTimetableConfigurationParams) => {
    if (!user?.schoolId) return;

    try {
      const { data, error } = await supabase.rpc(
        'save_timetable_configuration',
        {
          p_school_id: user.schoolId,
          p_name: params.name,
          p_is_active: params.isActive,
          p_is_default: params.isDefault,
          p_academic_year_id: params.academicYearId,
          p_periods: params.periods,
          p_batch_ids: params.batchIds
        }
      );

      if (error) throw error;

      // Refresh configurations after saving
      await fetchConfigurations();

      toast({
        title: 'Success',
        description: 'Timetable configuration saved successfully'
      });

      return data;
    } catch (err: any) {
      console.error('Error saving timetable configuration:', err);
      toast({
        title: 'Error',
        description: 'Failed to save timetable configuration',
        variant: 'destructive'
      });
      throw err;
    }
  };

  const deleteConfiguration = async (configId: string) => {
    try {
      const { error } = await supabase
        .from('timetable_configurations')
        .delete()
        .eq('id', configId);

      if (error) throw error;

      // Refresh configurations after deletion
      await fetchConfigurations();

      toast({
        title: 'Success',
        description: 'Timetable configuration deleted successfully'
      });
    } catch (err: any) {
      console.error('Error deleting timetable configuration:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete timetable configuration',
        variant: 'destructive'
      });
      throw err;
    }
  };

  const updateConfiguration = async (configId: string, params: Partial<SaveTimetableConfigurationParams>) => {
    if (!user?.schoolId) return;

    try {
      // First update the configuration
      const { error: configError } = await supabase
        .from('timetable_configurations')
        .update({
          name: params.name,
          is_active: params.isActive,
          is_default: params.isDefault
        })
        .eq('id', configId);

      if (configError) throw configError;

      // If periods are provided, update them
      if (params.periods) {
        // Delete existing periods
        const { error: deleteError } = await supabase
          .from('period_settings')
          .delete()
          .eq('configuration_id', configId);

        if (deleteError) throw deleteError;

        // Insert new periods
        const { error: insertError } = await supabase
          .from('period_settings')
          .insert(
            params.periods.map(period => ({
              configuration_id: configId,
              period_number: period.number,
              start_time: period.startTime,
              end_time: period.endTime,
              type: period.type,
              label: period.label,
              day_of_week: period.dayOfWeek,
              is_fortnightly: period.isFortnightly,
              fortnight_week: period.fortnightWeek
            }))
          );

        if (insertError) throw insertError;
      }

      // If batch IDs are provided, update them
      if (params.batchIds) {
        // Delete existing mappings
        const { error: deleteError } = await supabase
          .from('batch_configuration_mapping')
          .delete()
          .eq('configuration_id', configId);

        if (deleteError) throw deleteError;

        // Insert new mappings
        const { error: insertError } = await supabase
          .from('batch_configuration_mapping')
          .insert(
            params.batchIds.map(batchId => ({
              configuration_id: configId,
              batch_id: batchId
            }))
          );

        if (insertError) throw insertError;
      }

      // Refresh configurations after update
      await fetchConfigurations();

      toast({
        title: 'Success',
        description: 'Timetable configuration updated successfully'
      });
    } catch (err: any) {
      console.error('Error updating timetable configuration:', err);
      toast({
        title: 'Error',
        description: 'Failed to update timetable configuration',
        variant: 'destructive'
      });
      throw err;
    }
  };

  // Fetch configurations when academic year changes
  useEffect(() => {
    fetchConfigurations();
  }, [academicYearId, user?.schoolId]);

  return {
    configurations,
    isLoading,
    error,
    saveConfiguration,
    deleteConfiguration,
    updateConfiguration,
    refreshConfigurations: fetchConfigurations
  };
};
