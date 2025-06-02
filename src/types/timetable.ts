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

export interface Period {
  id: string;
  number: number;
  startTime: string;
  endTime: string;
  type: 'period' | 'break';
  label?: string;
  dayOfWeek?: string;
  isFortnightly?: boolean;
  fortnightWeek?: 1 | 2;
}

export interface SaveTimetableConfigurationParams {
  schoolId: string;
  name: string;
  isActive: boolean;
  isDefault: boolean;
  academicYearId: string;
  periods: Period[];
  batchIds?: string[];
}

export interface GetTimetableConfigurationsParams {
  schoolId: string;
  academicYearId: string;
} 