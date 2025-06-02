import React from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface WeekDay {
  id: string;
  label: string;
  fullName: string;
}

const weekDays: WeekDay[] = [
  { id: 'monday', label: 'Mon', fullName: 'Monday' },
  { id: 'tuesday', label: 'Tue', fullName: 'Tuesday' },
  { id: 'wednesday', label: 'Wed', fullName: 'Wednesday' },
  { id: 'thursday', label: 'Thu', fullName: 'Thursday' },
  { id: 'friday', label: 'Fri', fullName: 'Friday' },
  { id: 'saturday', label: 'Sat', fullName: 'Saturday' },
  { id: 'sunday', label: 'Sun', fullName: 'Sunday' }
];

interface WeekDaysSelectorProps {
  selectedDays: string[];
  onDaysChange: (days: string[]) => void;
  isWeeklyMode: boolean;
  fortnightStartDate?: string;
  onFortnightStartDateChange?: (date: string) => void;
}

export const WeekDaysSelector: React.FC<WeekDaysSelectorProps> = ({
  selectedDays,
  onDaysChange,
  isWeeklyMode,
  fortnightStartDate,
  onFortnightStartDateChange
}) => {
  const handleDayToggle = (dayId: string) => {
    const newSelectedDays = selectedDays.includes(dayId)
      ? selectedDays.filter(d => d !== dayId)
      : [...selectedDays, dayId];
    onDaysChange(newSelectedDays);
  };

  const handleSelectAll = () => {
    onDaysChange(weekDays.map(day => day.id));
  };

  const handleClearAll = () => {
    onDaysChange([]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Working Days</Label>
        <div className="space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleSelectAll}
          >
            Select All
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleClearAll}
          >
            Clear All
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {weekDays.map(day => (
          <Button
            key={day.id}
            variant={selectedDays.includes(day.id) ? "default" : "outline"}
            size="sm"
            onClick={() => handleDayToggle(day.id)}
            className="flex flex-col h-16 text-xs"
          >
            <span className="font-medium">{day.label}</span>
            <span className="text-[10px] opacity-70">{day.fullName}</span>
          </Button>
        ))}
      </div>

      {!isWeeklyMode && (
        <div className="flex items-center gap-4 pt-4">
          <Label htmlFor="fortnight-start">Fortnight Start Date</Label>
          <input
            type="date"
            id="fortnight-start"
            value={fortnightStartDate}
            onChange={(e) => onFortnightStartDateChange?.(e.target.value)}
            className="px-3 py-1.5 border rounded"
          />
        </div>
      )}
    </div>
  );
};
