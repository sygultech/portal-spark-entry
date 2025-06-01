
import React from "react";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Calendar } from "lucide-react";
import { weekDays, WeekDay } from "../types/TimePeriodTypes";

interface WeekDaysSelectorProps {
  selectedDays: string[];
  onSelectedDaysChange: (days: string[]) => void;
}

export const WeekDaysSelector = ({ selectedDays, onSelectedDaysChange }: WeekDaysSelectorProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <Label>School Days</Label>
        <ToggleGroup 
          type="multiple" 
          value={selectedDays} 
          onValueChange={onSelectedDaysChange}
          className="flex flex-wrap justify-start gap-2"
        >
          {weekDays.map((day) => (
            <ToggleGroupItem
              key={day.id}
              value={day.id}
              aria-label={day.fullName}
              className="flex-col h-16 w-16 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
            >
              <Calendar className="h-4 w-4 mb-1" />
              <span className="text-xs">{day.label}</span>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <div className="flex flex-wrap gap-2">
        <div>
          <span className="text-sm font-medium">School Days: </span>
          {selectedDays.length > 0 ? (
            selectedDays.map(dayId => {
              const day = weekDays.find(d => d.id === dayId);
              return (
                <Badge key={dayId} variant="default" className="mr-1">
                  {day?.fullName}
                </Badge>
              );
            })
          ) : (
            <Badge variant="secondary">None selected</Badge>
          )}
        </div>
      </div>
    </div>
  );
};
