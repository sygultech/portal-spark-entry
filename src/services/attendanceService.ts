import { supabase } from '@/integrations/supabase/client';
import { AttendanceConfiguration, Student, PeriodSlot, AttendanceRecord, AttendanceStats, AttendanceMode } from '@/types/attendance';

export const attendanceService = {
  // Configuration methods
  async getAttendanceConfigurations(schoolId: string): Promise<AttendanceConfiguration[]> {
    const { data, error } = await supabase
      .from('attendance_configurations')
      .select('*')
      .eq('school_id', schoolId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching attendance configurations:', error);
      throw error;
    }

    return data || [];
  },

  async getAttendanceConfiguration(batchId: string): Promise<AttendanceConfiguration | null> {
    // First get the school_id for this batch
    const { data: batchData, error: batchError } = await supabase
      .from('batches')
      .select('school_id')
      .eq('id', batchId)
      .single();

    if (batchError) {
      console.error('Error fetching batch:', batchError);
      throw batchError;
    }

    const { data, error } = await supabase
      .from('attendance_configurations')
      .select('*')
      .eq('batch_id', batchId)
      .eq('school_id', batchData.school_id)
      .eq('is_active', true)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('Error fetching attendance configuration:', error);
      throw error;
    }

    return data;
  },

  async updateAttendanceConfiguration(
    batchId: string, 
    mode: AttendanceMode, 
    settings: Partial<AttendanceConfiguration>
  ): Promise<AttendanceConfiguration> {
    // First, deactivate any existing active configurations for this batch
    const { error: deactivateError } = await supabase
      .from('attendance_configurations')
      .update({ is_active: false })
      .eq('batch_id', batchId)
      .eq('is_active', true);

    if (deactivateError) {
      console.error('Error deactivating existing configurations:', deactivateError);
      throw deactivateError;
    }

    // Create new configuration
    const newConfig = {
      batch_id: batchId,
      attendance_mode: mode,
      auto_absent_enabled: settings.auto_absent_enabled ?? false,
      auto_absent_time: settings.auto_absent_time,
      notification_enabled: settings.notification_enabled ?? true,
      is_active: true,
      academic_year_id: settings.academic_year_id,
      school_id: settings.school_id
    };

    const { data, error } = await supabase
      .from('attendance_configurations')
      .insert([newConfig])
      .select()
      .single();

    if (error) {
      console.error('Error creating attendance configuration:', error);
      throw error;
    }

    return data;
  },

  // Student methods
  async getStudentsByBatch(batchId: string): Promise<Student[]> {
    const { data, error } = await supabase
      .from('student_details')
      .select(`
        id,
        admission_number,
        first_name,
        last_name,
        batch_id
      `)
      .eq('batch_id', batchId)
      .eq('status', 'active')
      .order('admission_number', { ascending: true });

    if (error) {
      console.error('Error fetching students:', error);
      throw error;
    }

    return (data || []).map(student => ({
      ...student,
      roll_number: student.admission_number, // Use admission_number as roll_number
      photo_url: undefined // Field doesn't exist in current schema
    }));
  },

  // Get available days from timetable configuration
  async getAvailableDays(batchId: string): Promise<string[]> {
    try {
      // First get the school_id for this batch
      const { data: batchInfo, error: batchError } = await supabase
        .from('batches')
        .select('school_id')
        .eq('id', batchId)
        .single();

      if (batchError) {
        console.error('Error fetching batch info:', batchError);
        return [];
      }

      // Get the default configuration for this school
      const { data: defaultConfig, error: defaultConfigError } = await supabase
        .from('timetable_configurations')
        .select('id')
        .eq('is_default', true)
        .eq('is_active', true)
        .eq('school_id', batchInfo.school_id)
        .single();

      if (!defaultConfig || defaultConfigError) {
        return [];
      }

      // Get distinct days from period_settings
      const { data: days, error: daysError } = await supabase
        .from('period_settings')
        .select('day_of_week')
        .eq('configuration_id', defaultConfig.id);

      if (daysError) {
        console.error('Error fetching available days:', daysError);
        return [];
      }

      // Get unique days and sort them
      const uniqueDays = [...new Set(days?.map(d => d.day_of_week) || [])];
      const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      return uniqueDays.sort((a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b));
    } catch (error) {
      console.error('Error in getAvailableDays:', error);
      return [];
    }
  },

  // Period grid method with hierarchical configuration lookup
  async getPeriodGrid(batchId: string, date?: string): Promise<PeriodSlot[]> {
    try {
      console.log(`[getPeriodGrid] Starting period configuration lookup for batch: ${batchId}`);
      
      // Step 1: Check batch_configuration_mapping for batch-specific configuration
      const { data: batchMapping, error: batchMappingError } = await supabase
        .from('batch_configuration_mapping')
        .select('configuration_id')
        .eq('batch_id', batchId)
        .single();

      let timetableConfigId: string | null = null;

      if (!batchMappingError && batchMapping) {
        console.log(`[getPeriodGrid] Found batch mapping with configuration_id: ${batchMapping.configuration_id}`);
        
        // Step 2: Check if the mapped timetable configuration is active
        const { data: timetableConfig, error: timetableConfigError } = await supabase
          .from('timetable_configurations')
          .select('id, is_active')
          .eq('id', batchMapping.configuration_id)
          .eq('is_active', true)
          .single();

        if (!timetableConfigError && timetableConfig) {
          console.log(`[getPeriodGrid] Found active timetable configuration: ${timetableConfig.id}`);
          timetableConfigId = timetableConfig.id;
        } else {
          console.log(`[getPeriodGrid] Mapped configuration is inactive or not found, falling back to default`);
        }
      } else {
        console.log(`[getPeriodGrid] No batch mapping found, falling back to default`);
      }

      // Step 3: If no batch-specific active configuration found, look for default
      if (!timetableConfigId) {
        // First get the school_id for this batch
        const { data: batchInfo, error: batchError } = await supabase
          .from('batches')
          .select('school_id')
          .eq('id', batchId)
          .single();

        if (batchError) {
          console.error(`[getPeriodGrid] Error fetching batch info:`, batchError);
          throw batchError;
        }

        const { data: defaultConfig, error: defaultConfigError } = await supabase
          .from('timetable_configurations')
          .select('id')
          .eq('is_default', true)
          .eq('is_active', true)
          .eq('school_id', batchInfo.school_id)
          .single();

        if (!defaultConfigError && defaultConfig) {
          console.log(`[getPeriodGrid] Found default timetable configuration: ${defaultConfig.id}`);
          timetableConfigId = defaultConfig.id;
        } else {
          console.log(`[getPeriodGrid] No default configuration found for school: ${batchInfo.school_id}`);
        }
      }

      // Step 4: If no configuration found, return empty array
      if (!timetableConfigId) {
        console.warn('No active timetable configuration found for batch:', batchId);
        return [];
      }

      // Step 5: Determine day of week from date (if provided)
      let dayOfWeek: string | null = null;
      if (date) {
        const dateObj = new Date(date);
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        dayOfWeek = days[dateObj.getDay()];
        console.log(`[getPeriodGrid] Date ${date} is a ${dayOfWeek}`);
      }

      // Step 6: Fetch period settings using the timetable configuration
      let query = supabase
        .from('period_settings')
        .select(`
          id,
          period_number,
          start_time,
          end_time,
          label,
          type,
          day_of_week
        `)
        .eq('configuration_id', timetableConfigId);

      // Filter by day of week if date is provided
      if (dayOfWeek) {
        query = query.eq('day_of_week', dayOfWeek);
      }

      const { data: periodSettings, error: periodError } = await query
        .order('period_number', { ascending: true });

      if (periodError) {
        console.error('Error fetching period settings:', periodError);
        throw periodError;
      }

      console.log(`[getPeriodGrid] Found ${periodSettings?.length || 0} period settings`);

      return (periodSettings || []).map(setting => ({
        id: setting.id,
        period_number: setting.period_number,
        start_time: setting.start_time,
        end_time: setting.end_time,
        subject_name: setting.label || `Period ${setting.period_number}`,
        teacher_name: setting.type || 'Not Assigned'
      }));

    } catch (error) {
      console.error('Error in getPeriodGrid:', error);
      // Fallback to old logic if new tables don't exist yet
      return this.getPeriodGridFallback(batchId);
    }
  },

  // Fallback method for backward compatibility
  async getPeriodGridFallback(batchId: string): Promise<PeriodSlot[]> {
    console.log(`[getPeriodGridFallback] Using fallback method for batch: ${batchId}`);
    
    type TimetableSlot = {
      period_number: number;
      start_time: string;
      end_time: string;
      subjects: { name: string } | null;
      staff: { first_name: string; last_name: string } | null;
    };

    const { data, error } = await supabase
      .from('timetable_slots')
      .select(`
        period_number,
        start_time,
        end_time,
        subjects:subjects!inner(name),
        staff:staff!inner(first_name, last_name)
      `)
      .eq('batch_id', batchId);

    if (error) {
      console.error('Error fetching period grid (fallback):', error);
      throw error;
    }

    return (data || []).map((slot: any) => ({
      period_number: slot.period_number,
      start_time: slot.start_time,
      end_time: slot.end_time,
      subject_name: slot.subjects?.name || '',
      teacher_name: slot.staff ? `${slot.staff.first_name} ${slot.staff.last_name}` : ''
    }));
  },

  // Attendance methods
  async saveAttendance(entries: AttendanceRecord[]): Promise<{ success: boolean; message: string }> {
    // Get current user ID first
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('attendance_records')
      .upsert(entries.map(entry => ({
        ...entry,
        marked_by: user.id, // Fixed: Use the actual user ID instead of a Promise
        marked_at: new Date().toISOString()
      })));

    if (error) {
      console.error('Error saving attendance:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      console.error('Attempted to save entries:', entries);
      throw error;
    }

    return { success: true, message: 'Attendance saved successfully' };
  },

  async getAttendanceRecords(filters: {
    batchId?: string;
    studentId?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<AttendanceRecord[]> {
    let query = supabase
      .from('attendance_records')
      .select('*');

    if (filters.batchId) {
      query = query.eq('batch_id', filters.batchId);
    }
    if (filters.studentId) {
      query = query.eq('student_id', filters.studentId);
    }
    if (filters.dateFrom) {
      query = query.gte('date', filters.dateFrom);
    }
    if (filters.dateTo) {
      query = query.lte('date', filters.dateTo);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching attendance records:', error);
      throw error;
    }

    return data || [];
  },

  async getAttendanceStats(batchId: string, date: string): Promise<AttendanceStats> {
    // First get total number of students
    const { data: students, error: studentsError } = await supabase
      .from('student_details')
      .select('id')
      .eq('batch_id', batchId)
      .eq('status', 'active');

    if (studentsError) {
      console.error('Error fetching students:', studentsError);
      throw studentsError;
    }

    // Then get attendance records
    const { data: records, error: recordsError } = await supabase
      .from('attendance_records')
      .select('status')
      .eq('batch_id', batchId)
      .eq('date', date);

    if (recordsError) {
      console.error('Error fetching attendance records:', recordsError);
      throw recordsError;
    }

    const total_students = students?.length || 0;
    const present = records?.filter(r => r.status === 'present').length || 0;
    const absent = records?.filter(r => r.status === 'absent').length || 0;
    const late = records?.filter(r => r.status === 'late').length || 0;
    const leave = records?.filter(r => r.status === 'leave').length || 0;

    return {
      total_students,
      present,
      absent,
      late,
      leave,
      attendance_percentage: total_students > 0 ? (present / total_students) * 100 : 0
    };
  }
};
