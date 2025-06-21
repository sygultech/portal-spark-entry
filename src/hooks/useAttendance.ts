
import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { AttendanceRecord, AttendanceConfiguration, AttendanceLeaveRequest, AttendanceStats, BatchAttendanceStats } from '@/types/attendance';

export function useAttendance() {
  const { profile } = useAuth();
  const schoolId = profile?.school_id;
  const queryClient = useQueryClient();

  // Fetch attendance configurations
  const { data: configurations, isLoading: configurationsLoading } = useQuery({
    queryKey: ['attendance-configurations', schoolId],
    queryFn: async () => {
      if (!schoolId) return [];
      
      const { data, error } = await supabase
        .from('attendance_configurations')
        .select('*')
        .eq('school_id', schoolId)
        .eq('is_active', true);
      
      if (error) throw error;
      return data as AttendanceConfiguration[];
    },
    enabled: !!schoolId
  });

  // Fetch attendance records
  const fetchAttendanceRecords = useCallback(async (filters: {
    batch_id?: string;
    student_id?: string;
    date_from?: string;
    date_to?: string;
    attendance_mode?: string;
  } = {}) => {
    if (!schoolId) return [];

    let query = supabase
      .from('attendance_records')
      .select(`
        *,
        student:student_details(first_name, last_name, admission_number),
        subject:subjects(name, code),
        batch:batches(name)
      `)
      .eq('school_id', schoolId);

    if (filters.batch_id) query = query.eq('batch_id', filters.batch_id);
    if (filters.student_id) query = query.eq('student_id', filters.student_id);
    if (filters.date_from) query = query.gte('attendance_date', filters.date_from);
    if (filters.date_to) query = query.lte('attendance_date', filters.date_to);
    if (filters.attendance_mode) query = query.eq('attendance_mode', filters.attendance_mode);

    const { data, error } = await query.order('attendance_date', { ascending: false });
    
    if (error) throw error;
    return data;
  }, [schoolId]);

  // Mark attendance mutation
  const markAttendanceMutation = useMutation({
    mutationFn: async (attendanceData: Partial<AttendanceRecord>) => {
      const { data, error } = await supabase
        .from('attendance_records')
        .insert({
          ...attendanceData,
          school_id: schoolId,
          marked_by: profile?.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance-records'] });
      toast({
        title: 'Success',
        description: 'Attendance marked successfully'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to mark attendance',
        variant: 'destructive'
      });
    }
  });

  // Bulk mark attendance mutation
  const bulkMarkAttendanceMutation = useMutation({
    mutationFn: async (attendanceList: Partial<AttendanceRecord>[]) => {
      const records = attendanceList.map(record => ({
        ...record,
        school_id: schoolId,
        marked_by: profile?.id
      }));

      const { data, error } = await supabase
        .from('attendance_records')
        .insert(records)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance-records'] });
      toast({
        title: 'Success',
        description: 'Bulk attendance marked successfully'
      });
    }
  });

  // Update attendance mutation
  const updateAttendanceMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<AttendanceRecord> }) => {
      const { data, error } = await supabase
        .from('attendance_records')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance-records'] });
      toast({
        title: 'Success',
        description: 'Attendance updated successfully'
      });
    }
  });

  // Calculate attendance statistics
  const calculateAttendanceStats = useCallback((records: AttendanceRecord[]): AttendanceStats => {
    const total_days = records.length;
    const present_days = records.filter(r => r.status === 'present').length;
    const absent_days = records.filter(r => r.status === 'absent').length;
    const late_days = records.filter(r => r.status === 'late').length;
    const excused_days = records.filter(r => r.status === 'excused').length;

    return {
      total_days,
      present_days,
      absent_days,
      late_days,
      excused_days,
      attendance_percentage: total_days > 0 ? Math.round((present_days / total_days) * 100) : 0
    };
  }, []);

  // Fetch batch attendance statistics
  const fetchBatchAttendanceStats = useCallback(async (batchId: string, date: string): Promise<BatchAttendanceStats | null> => {
    if (!schoolId) return null;

    const { data: students, error: studentsError } = await supabase
      .from('student_details')
      .select('id')
      .eq('batch_id', batchId)
      .eq('school_id', schoolId)
      .eq('status', 'active');

    if (studentsError || !students) return null;

    const { data: attendanceRecords, error: attendanceError } = await supabase
      .from('attendance_records')
      .select('student_id, status')
      .eq('batch_id', batchId)
      .eq('attendance_date', date)
      .eq('school_id', schoolId);

    if (attendanceError) return null;

    const total_students = students.length;
    const present_students = attendanceRecords?.filter(r => r.status === 'present').length || 0;
    const absent_students = attendanceRecords?.filter(r => r.status === 'absent').length || 0;
    const late_students = attendanceRecords?.filter(r => r.status === 'late').length || 0;

    return {
      batch_id: batchId,
      batch_name: '',
      total_students,
      present_students,
      absent_students,
      late_students,
      attendance_percentage: total_students > 0 ? Math.round((present_students / total_students) * 100) : 0
    };
  }, [schoolId]);

  return {
    configurations,
    configurationsLoading,
    fetchAttendanceRecords,
    markAttendance: markAttendanceMutation.mutate,
    bulkMarkAttendance: bulkMarkAttendanceMutation.mutate,
    updateAttendance: updateAttendanceMutation.mutate,
    isMarkingAttendance: markAttendanceMutation.isPending,
    isBulkMarking: bulkMarkAttendanceMutation.isPending,
    isUpdating: updateAttendanceMutation.isPending,
    calculateAttendanceStats,
    fetchBatchAttendanceStats
  };
}
