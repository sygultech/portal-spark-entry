
import { AttendanceConfiguration, Student, PeriodSlot, AttendanceRecord, AttendanceStats, AttendanceMode } from '@/types/attendance';

// Mock data - replace with actual API calls when backend is ready
const mockConfigurations: AttendanceConfiguration[] = [
  {
    id: '1',
    batch_id: 'batch-1',
    academic_year_id: 'ay-2024',
    attendance_mode: 'daily',
    auto_absent_enabled: true,
    auto_absent_time: '16:00:00',
    notification_enabled: true,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    batch_id: 'batch-2',
    academic_year_id: 'ay-2024',
    attendance_mode: 'period',
    auto_absent_enabled: false,
    notification_enabled: true,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

const mockStudents: Student[] = [
  {
    id: 'student-1',
    admission_number: 'ADM001',
    first_name: 'John',
    last_name: 'Doe',
    batch_id: 'batch-1',
    roll_number: '1'
  },
  {
    id: 'student-2',
    admission_number: 'ADM002',
    first_name: 'Jane',
    last_name: 'Smith',
    batch_id: 'batch-1',
    roll_number: '2'
  },
  {
    id: 'student-3',
    admission_number: 'ADM003',
    first_name: 'Mike',
    last_name: 'Johnson',
    batch_id: 'batch-2',
    roll_number: '1'
  }
];

const mockPeriodSlots: PeriodSlot[] = [
  {
    period_number: 1,
    start_time: '08:00',
    end_time: '08:45',
    subject_name: 'Mathematics',
    teacher_name: 'Mr. Brown'
  },
  {
    period_number: 2,
    start_time: '08:45',
    end_time: '09:30',
    subject_name: 'English',
    teacher_name: 'Ms. Davis'
  },
  {
    period_number: 3,
    start_time: '09:30',
    end_time: '10:15',
    subject_name: 'Science',
    teacher_name: 'Dr. Wilson'
  },
  {
    period_number: 4,
    start_time: '10:30',
    end_time: '11:15',
    subject_name: 'History',
    teacher_name: 'Mr. Taylor'
  }
];

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const attendanceService = {
  // Configuration methods
  async getAttendanceConfigurations(schoolId: string): Promise<AttendanceConfiguration[]> {
    await delay(500);
    console.log('Fetching attendance configurations for school:', schoolId);
    return mockConfigurations;
  },

  async getAttendanceConfiguration(batchId: string): Promise<AttendanceConfiguration | null> {
    await delay(300);
    console.log('Fetching attendance configuration for batch:', batchId);
    return mockConfigurations.find(config => config.batch_id === batchId) || null;
  },

  async updateAttendanceConfiguration(batchId: string, mode: AttendanceMode, settings: Partial<AttendanceConfiguration>): Promise<AttendanceConfiguration> {
    await delay(500);
    console.log('Updating attendance configuration for batch:', batchId, 'mode:', mode, 'settings:', settings);
    
    // Mock update - in real implementation, this would call the backend
    const existingConfig = mockConfigurations.find(config => config.batch_id === batchId);
    if (existingConfig) {
      Object.assign(existingConfig, settings, { attendance_mode: mode, updated_at: new Date().toISOString() });
      return existingConfig;
    }
    
    const newConfig: AttendanceConfiguration = {
      id: Date.now().toString(),
      batch_id: batchId,
      academic_year_id: 'ay-2024',
      attendance_mode: mode,
      auto_absent_enabled: settings.auto_absent_enabled ?? false,
      auto_absent_time: settings.auto_absent_time,
      notification_enabled: settings.notification_enabled ?? true,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    mockConfigurations.push(newConfig);
    return newConfig;
  },

  // Student methods
  async getStudentsByBatch(batchId: string): Promise<Student[]> {
    await delay(400);
    console.log('Fetching students for batch:', batchId);
    return mockStudents.filter(student => student.batch_id === batchId);
  },

  // Period grid method
  async getPeriodGrid(batchId: string): Promise<PeriodSlot[]> {
    await delay(300);
    console.log('Fetching period grid for batch:', batchId);
    // Simulate timetable configuration check
    return mockPeriodSlots;
  },

  // Attendance methods
  async saveAttendance(entries: any[]): Promise<{ success: boolean; message: string }> {
    await delay(800);
    console.log('Saving attendance entries:', entries);
    
    // Mock save to localStorage for offline capability
    const existingData = localStorage.getItem('offline_attendance') || '[]';
    const savedEntries = JSON.parse(existingData);
    savedEntries.push(...entries.map(entry => ({
      ...entry,
      id: Date.now().toString() + Math.random(),
      marked_at: new Date().toISOString()
    })));
    localStorage.setItem('offline_attendance', JSON.stringify(savedEntries));
    
    return { success: true, message: 'Attendance saved successfully' };
  },

  async getAttendanceRecords(filters: {
    batchId?: string;
    studentId?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<AttendanceRecord[]> {
    await delay(600);
    console.log('Fetching attendance records with filters:', filters);
    
    // Mock records - in real implementation, this would fetch from backend
    const mockRecords: AttendanceRecord[] = [
      {
        id: 'record-1',
        student_id: 'student-1',
        batch_id: 'batch-1',
        date: '2024-01-15',
        status: 'present',
        marked_by: 'teacher-1',
        marked_at: '2024-01-15T09:00:00Z'
      }
    ];
    
    return mockRecords;
  },

  async getAttendanceStats(batchId: string, date: string): Promise<AttendanceStats> {
    await delay(400);
    console.log('Fetching attendance stats for batch:', batchId, 'date:', date);
    
    return {
      total_students: 25,
      present: 23,
      absent: 1,
      late: 1,
      leave: 0,
      attendance_percentage: 92
    };
  }
};
