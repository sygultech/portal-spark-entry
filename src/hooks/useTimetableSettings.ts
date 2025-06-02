import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { refreshUserRoleCache } from '@/utils/authUtils';

export interface TimetableSettings {
  id: string;
  school_id: string;
  period_duration: number;
  break_duration: number;
  lunch_duration: number;
  school_start_time: string;
  school_end_time: string;
  half_day_end_time: string;
  created_at: string;
  updated_at: string;
}

export interface WorkingDays {
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
}

export const useTimetableSettings = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { user, profile } = useAuth();

  // Helper function to ensure role cache is populated
  const ensureRoleCache = async () => {
    if (!user?.id) return false;
    return await refreshUserRoleCache(user.id);
  };

  // Fetch timetable settings for the current school
  const getTimetableSettings = async () => {
    setIsLoading(true);
    try {
      if (!profile?.school_id) {
        throw new Error('School ID not found');
      }

      // Ensure role cache is populated
      await ensureRoleCache();

      const { data: settings, error } = await supabase
        .from('timetable_settings')
        .select('*')
        .eq('school_id', profile.school_id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No settings found, create default settings
          return await createDefaultSettings(profile.school_id);
        }
        throw error;
      }
      return settings;
    } catch (error: any) {
      toast({
        title: 'Error fetching timetable settings',
        description: error.message,
        variant: 'destructive'
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Create default settings
  const createDefaultSettings = async (schoolId: string) => {
    const defaultSettings = {
      school_id: schoolId,
      period_duration: 45,
      break_duration: 15,
      lunch_duration: 45,
      school_start_time: '08:00:00',
      school_end_time: '15:00:00',
      half_day_end_time: '12:00:00',
      working_days: {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: false,
        sunday: false
      }
    };

    const { data, error } = await supabase
      .from('timetable_settings')
      .insert(defaultSettings)
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  // Update timetable settings
  const updateTimetableSettings = async (settings: Partial<TimetableSettings>) => {
    setIsLoading(true);
    try {
      if (!profile?.school_id) {
        throw new Error('School ID not found');
      }

      // Ensure role cache is populated
      await ensureRoleCache();

      // Validate time ranges
      if (settings.period_duration && (settings.period_duration < 30 || settings.period_duration > 60)) {
        throw new Error('Period duration must be between 30 and 60 minutes');
      }
      if (settings.break_duration && (settings.break_duration < 10 || settings.break_duration > 30)) {
        throw new Error('Break duration must be between 10 and 30 minutes');
      }
      if (settings.lunch_duration && (settings.lunch_duration < 30 || settings.lunch_duration > 60)) {
        throw new Error('Lunch duration must be between 30 and 60 minutes');
      }

      const { data, error } = await supabase
        .from('timetable_settings')
        .upsert({
          ...settings,
          school_id: profile.school_id
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Timetable settings updated successfully'
      });

      return data;
    } catch (error: any) {
      toast({
        title: 'Error updating timetable settings',
        description: error.message,
        variant: 'destructive'
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Create or update working days configuration
  const updateWorkingDays = async (workingDays: WorkingDays) => {
    setIsLoading(true);
    try {
      if (!profile?.school_id) {
        throw new Error('School ID not found');
      }

      // Ensure role cache is populated
      await ensureRoleCache();

      const { data, error } = await supabase
        .from('timetable_settings')
        .upsert({
          school_id: profile.school_id,
          working_days: workingDays
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Working days configuration updated successfully'
      });

      return data;
    } catch (error: any) {
      toast({
        title: 'Error updating working days',
        description: error.message,
        variant: 'destructive'
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Get working days configuration
  const getWorkingDays = async () => {
    setIsLoading(true);
    try {
      if (!profile?.school_id) {
        throw new Error('School ID not found');
      }

      // Ensure role cache is populated
      await ensureRoleCache();

      const { data, error } = await supabase
        .from('timetable_settings')
        .select('working_days')
        .eq('school_id', profile.school_id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No settings found, create default settings
          const defaultSettings = await createDefaultSettings(profile.school_id);
          return defaultSettings.working_days as WorkingDays;
        }
        throw error;
      }
      return data?.working_days as WorkingDays;
    } catch (error: any) {
      toast({
        title: 'Error fetching working days',
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
    getTimetableSettings,
    updateTimetableSettings,
    updateWorkingDays,
    getWorkingDays
  };
}; 