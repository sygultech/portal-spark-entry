
import { Period } from '../types/TimePeriodTypes';

export interface ValidationError {
  id: string;
  message: string;
  type: 'overlap' | 'invalid-time' | 'end-before-start';
}

export const validatePeriodTimings = (periods: Period[]): ValidationError[] => {
  const errors: ValidationError[] = [];

  periods.forEach((period, index) => {
    // Check if end time is before start time
    if (period.startTime && period.endTime && period.startTime >= period.endTime) {
      errors.push({
        id: period.id,
        message: `${period.type === 'period' ? `Period ${period.number}` : period.label || 'Break'}: End time must be after start time`,
        type: 'end-before-start'
      });
    }

    // Check for overlaps with other periods
    periods.forEach((otherPeriod, otherIndex) => {
      if (index !== otherIndex && period.startTime && period.endTime && otherPeriod.startTime && otherPeriod.endTime) {
        const isOverlapping = (
          (period.startTime < otherPeriod.endTime && period.endTime > otherPeriod.startTime)
        );

        if (isOverlapping) {
          const periodName = period.type === 'period' ? `Period ${period.number}` : period.label || 'Break';
          const otherPeriodName = otherPeriod.type === 'period' ? `Period ${otherPeriod.number}` : otherPeriod.label || 'Break';
          
          errors.push({
            id: period.id,
            message: `${periodName} overlaps with ${otherPeriodName}`,
            type: 'overlap'
          });
        }
      }
    });
  });

  // Remove duplicate errors for the same period
  return errors.filter((error, index, self) => 
    self.findIndex(e => e.id === error.id && e.type === error.type) === index
  );
};

export const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

export const isValidTimeFormat = (time: string): boolean => {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
};
