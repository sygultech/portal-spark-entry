
import React from "react";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Calendar } from "lucide-react";
import { weekDays, WeekDay } from "../types/TimePeriodTypes";
import { cn } from "@/lib/utils";

interface WeekDaysSelectorProps {
  selectedDays: string[];
  onSelectedDaysChange: (days: string[]) => void;
  isWeeklyMode: boolean;
  hasError?: boolean;
}

// Generate fortnight days (14 days) with consistent naming that matches backend expectations
const generateFortnightDays = (): WeekDay[] => {
  const fortnightDays: WeekDay[] = [];
  
  // Week 1 - use consistent week1-dayname format
  weekDays.forEach((day) => {
    fortnightDays.push({
      id: `week1-${day.id}`,
      label: `W1-${day.label}`,
      fullName: `Week 1 ${day.fullName}`
    });
  });
  
  // Week 2 - use consistent week2-dayname format
  weekDays.forEach((day) => {
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
  isWeeklyMode,
  hasError = false
}: WeekDaysSelectorProps) => {
  const daysToShow = isWeeklyMode ? weekDays : generateFortnightDays();
  
  // Validate selected days to ensure they're consistent
  const handleDaysChange = (newDays: string[]) => {
    // Log for debugging
    console.log('WeekDaysSelector - Selected days changed:', newDays);
    
    // Ensure all selected days are valid for the current mode
    const validDays = newDays.filter(day => {
      const isValid = daysToShow.some(d => d.id === day);
      if (!isValid) {
        console.warn('WeekDaysSelector - Invalid day detected:', day);
      }
      return isValid;
    });
    
    // Additional validation: ensure consistency with mode
    if (isWeeklyMode) {
      // For weekly mode, remove any day IDs with week prefixes
      const weeklyDays = validDays.filter(day => !day.includes('week'));
      onSelectedDaysChange(weeklyDays);
    } else {
      // For fortnightly mode, ensure we have proper week prefixes
      const fortnightDays = validDays.filter(day => day.includes('week'));
      onSelectedDaysChange(fortnightDays);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <Label className={cn(hasError && "text-destructive")}>
          School Days *
        </Label>
        <p className={cn(
          "text-sm text-muted-foreground",
          hasError && "text-destructive"
        )}>
          {isWeeklyMode 
            ? "Select the days your school operates during a normal week" 
            : "Select the days your school operates during a 2-week cycle"
          }
        </p>
        <div className={cn(
          "border rounded-lg p-3",
          hasError && "border-destructive bg-destructive/5"
        )}>
          <ToggleGroup 
            type="multiple" 
            value={selectedDays} 
            onValueChange={handleDaysChange}
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
          {hasError && selectedDays.length === 0 && (
            <p className="text-sm text-destructive mt-2 flex items-center gap-1">
              <span>⚠️</span>
              Please select at least one school day
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <div>
          <span className="text-sm font-medium">School Days: </span>
          {selectedDays.length > 0 ? (
            selectedDays.map(dayId => {
              const day = daysToShow.find(d => d.id === dayId);
              return (
                <Badge key={dayId} variant="default" className="mr-1">
                  {day?.fullName || dayId}
                </Badge>
              );
            })
          ) : (
            <Badge variant="secondary" className={cn(hasError && "border-destructive text-destructive")}>
              None selected
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};
