import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Period, ValidationError } from '../types/TimePeriodTypes';
import { addMinutes } from '@/lib/utils';

interface DaySpecificConfigProps {
  period: Period;
  onUpdate: (period: Period) => void;
  fortnightWeeks: number[];
  onUpdateFortnightWeek: (week: number) => void;
}

export const DaySpecificConfig = ({
  period,
  onUpdate,
  fortnightWeeks,
  onUpdateFortnightWeek
}: DaySpecificConfigProps) => {
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  const validatePeriod = (periodToValidate: Period): ValidationError[] => {
    const errors: ValidationError[] = [];

    if (periodToValidate.endTime <= periodToValidate.startTime) {
      errors.push({
        id: periodToValidate.id,
        message: 'End time must be after start time',
        type: 'end_before_start',
        day: periodToValidate.dayOfWeek
      });
    }

    return errors;
  };

  const handleTimeChange = (field: 'startTime' | 'endTime', value: string) => {
    const updatedPeriod = { ...period, [field]: value };
    const errors = validatePeriod(updatedPeriod);
    setValidationErrors(errors);
    onUpdate(updatedPeriod);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          {period.type === 'break' ? 'Break' : `Period ${period.number}`}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`start-${period.id}`}>Start Time</Label>
              <Input
                id={`start-${period.id}`}
                type="time"
                value={period.startTime}
                onChange={(e) => handleTimeChange('startTime', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`end-${period.id}`}>End Time</Label>
              <Input
                id={`end-${period.id}`}
                type="time"
                value={period.endTime}
                onChange={(e) => handleTimeChange('endTime', e.target.value)}
              />
            </div>
          </div>

          {period.type === 'break' && (
            <div className="space-y-2">
              <Label htmlFor={`label-${period.id}`}>Break Label</Label>
              <Input
                id={`label-${period.id}`}
                value={period.label || ''}
                onChange={(e) => onUpdate({ ...period, label: e.target.value })}
                placeholder="e.g., Morning Break"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor={`day-${period.id}`}>Day of Week</Label>
            <Select
              value={period.dayOfWeek || ''}
              onValueChange={(value) => onUpdate({ ...period, dayOfWeek: value })}
            >
              <SelectTrigger id={`day-${period.id}`}>
                <SelectValue placeholder="Select day" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Monday">Monday</SelectItem>
                <SelectItem value="Tuesday">Tuesday</SelectItem>
                <SelectItem value="Wednesday">Wednesday</SelectItem>
                <SelectItem value="Thursday">Thursday</SelectItem>
                <SelectItem value="Friday">Friday</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={`fortnightly-${period.id}`}
                checked={period.isFortnightly || false}
                onChange={(e) => onUpdate({ ...period, isFortnightly: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor={`fortnightly-${period.id}`}>Fortnightly Period</Label>
            </div>

            {period.isFortnightly && (
              <div className="space-y-2">
                <Label htmlFor={`fortnight-week-${period.id}`}>Fortnight Week</Label>
                <Select
                  value={period.fortnightWeek?.toString() || '1'}
                  onValueChange={(value) => onUpdateFortnightWeek(parseInt(value))}
                >
                  <SelectTrigger id={`fortnight-week-${period.id}`}>
                    <SelectValue placeholder="Select week" />
                  </SelectTrigger>
                  <SelectContent>
                    {fortnightWeeks.map((week) => (
                      <SelectItem key={week} value={week.toString()}>
                        Week {week}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {validationErrors.length > 0 && (
            <div className="bg-destructive/10 p-4 rounded-md">
              <ul className="list-disc list-inside space-y-1">
                {validationErrors.map((error) => (
                  <li key={error.id} className="text-destructive">
                    {error.message}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}; 