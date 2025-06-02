export interface Period {
  id: string;
  number: number;
  startTime: string;
  endTime: string;
  type: 'period' | 'break';
  label?: string;
  dayOfWeek?: string;
  isFortnightly?: boolean;
  fortnightWeek?: number;
}

export interface TimetableConfiguration {
  id: string;
  name: string;
  isActive: boolean;
  isDefault: boolean;
  academicYearId: string;
  schoolId?: string;
  periods: Period[];
  batchIds?: string[];
}

export interface TimePeriodConfigurationProps {
  configId: string;
  selectedAcademicYear: string;
  onClose?: () => void;
  onSave?: (config: TimetableConfiguration) => void;
}

export interface WeekDay {
  id: string;
  label: string;
  fullName: string;
}

export const weekDays: WeekDay[] = [
  { id: 'monday', label: 'Mon', fullName: 'Monday' },
  { id: 'tuesday', label: 'Tue', fullName: 'Tuesday' },
  { id: 'wednesday', label: 'Wed', fullName: 'Wednesday' },
  { id: 'thursday', label: 'Thu', fullName: 'Thursday' },
  { id: 'friday', label: 'Fri', fullName: 'Friday' },
  { id: 'saturday', label: 'Sat', fullName: 'Saturday' },
  { id: 'sunday', label: 'Sun', fullName: 'Sunday' }
];

export interface ValidationError {
  id: string;
  message: string;
  type: 'overlap' | 'invalid_time' | 'end_before_start';
  day?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}
