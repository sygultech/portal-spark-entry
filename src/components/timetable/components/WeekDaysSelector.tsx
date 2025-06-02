
import React from "react";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Calendar } from "lucide-react";
import { weekDays, WeekDay } from "../types/TimePeriodTypes";

interface WeekDaysSelectorProps {
  selectedDays: string[];
  onSelectedDaysChange: (days: string[]) => void;
  isWeeklyMode: boolean;
}

// Generate fortnight days (14 days)
const generateFortnightDays = (): WeekDay[] => {
  const fortnightDays: WeekDay[] = [];
  
  // Week 1
  weekDays.forEach((day, index) => {
    fortnightDays.push({
      id: `week1-${day.id}`,
      label: `W1-${day.label}`,
      fullName: `Week 1 ${day.fullName}`
    });
  });
  
  // Week 2
  weekDays.forEach((day, index) => {
    fortnightDays.push({
      id: `week2-${day.id}`,
      label: `W2-${day.label}`,
      fullName: `Week 2 ${day.fullName}`
    });
  });
  
  return fortnightDays;
};

export const WeekDaysSelector = ({ 
  selectedDays, 
  onSelectedDaysChange, 
  isWeeklyMode 
}: WeekDaysSelectorProps) => {
  const daysToShow = isWeeklyMode ? weekDays : generateFortnightDays();
  
  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <Label>School Days</Label>
        <p className="text-sm text-muted-foreground">
          {isWeeklyMode 
            ? "Select the days your school operates during a normal week" 
            : "Select the days your school operates during a 2-week cycle"
          }
        </p>
        <ToggleGroup 
          type="multiple" 
          value={selectedDays} 
          onValueChange={onSelectedDaysChange}
          className="flex flex-wrap justify-start gap-2"
        >
          {daysToShow.map((day) => (
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
              const day = daysToShow.find(d => d.id === dayId);
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
