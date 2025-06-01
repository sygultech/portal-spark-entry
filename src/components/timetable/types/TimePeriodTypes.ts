
export interface Period {
  id: string;
  number: number;
  startTime: string;
  endTime: string;
  type: 'period' | 'break';
  label?: string;
}

export interface TimePeriodConfigurationProps {
  configId: string;
  onClose?: () => void;
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
