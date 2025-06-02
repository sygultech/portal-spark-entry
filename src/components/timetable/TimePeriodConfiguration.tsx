import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings2, X } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { PeriodConfigurationForm } from "./components/PeriodConfigurationForm";
import { WeekDaysSelector } from "./components/WeekDaysSelector";
import { TimetableActions } from "./components/TimetableActions";
import { DaySpecificConfig } from "./components/DaySpecificConfig";
import { Period, TimePeriodConfigurationProps } from "./types/TimePeriodTypes";
import { validatePeriodTimings } from "./utils/timeValidation";

export const TimePeriodConfiguration = ({ configId, onClose }: TimePeriodConfigurationProps) => {
  const [timetableName, setTimetableName] = useState(`Configuration ${configId.split('-')[1]}`);
  const [totalPeriods, setTotalPeriods] = useState(8);
  const [periods, setPeriods] = useState<Period[]>([
    { id: '1', number: 1, startTime: '08:00', endTime: '08:45', type: 'period' },
    { id: '2', number: 2, startTime: '08:45', endTime: '09:30', type: 'period' },
    { id: '3', number: 3, startTime: '09:30', endTime: '10:15', type: 'period' },
    { id: 'break1', number: 0, startTime: '10:15', endTime: '10:30', type: 'break', label: 'Short Break' },
    { id: '4', number: 4, startTime: '10:30', endTime: '11:15', type: 'period' },
    { id: '5', number: 5, startTime: '11:15', endTime: '12:00', type: 'period' },
    { id: 'lunch', number: 0, startTime: '12:00', endTime: '12:45', type: 'break', label: 'Lunch Break' },
    { id: '6', number: 6, startTime: '12:45', endTime: '13:30', type: 'period' },
    { id: '7', number: 7, startTime: '13:30', endTime: '14:15', type: 'period' },
    { id: '8', number: 8, startTime: '14:15', endTime: '15:00', type: 'period' }
  ]);
  const [selectedDays, setSelectedDays] = useState(['monday', 'tuesday', 'wednesday', 'thursday', 'friday']);
  const [isPeriodsExpanded, setIsPeriodsExpanded] = useState(true);
  const [isWeeklyMode, setIsWeeklyMode] = useState(true);
  const [fortnightStartDate, setFortnightStartDate] = useState<string>('');
  const [daySpecificPeriods, setDaySpecificPeriods] = useState<Record<string, Period[]>>({});

  const handleTotalPeriodsChange = (value: string) => {
    const num = parseInt(value) || 0;
    if (num > 0 && num <= 12) {
      setTotalPeriods(num);
      generatePeriods(num);
    }
  };

  const generatePeriods = (total: number) => {
    const newPeriods: Period[] = [];
    let currentTime = { hours: 8, minutes: 0 };
    
    for (let i = 1; i <= total; i++) {
      const startTime = `${currentTime.hours.toString().padStart(2, '0')}:${currentTime.minutes.toString().padStart(2, '0')}`;
      
      currentTime.minutes += 45;
      if (currentTime.minutes >= 60) {
        currentTime.hours += Math.floor(currentTime.minutes / 60);
        currentTime.minutes = currentTime.minutes % 60;
      }
      
      const endTime = `${currentTime.hours.toString().padStart(2, '0')}:${currentTime.minutes.toString().padStart(2, '0')}`;
      
      newPeriods.push({
        id: i.toString(),
        number: i,
        startTime,
        endTime,
        type: 'period'
      });

      if (i === 3 || i === 5) {
        const breakStart = endTime;
        currentTime.minutes += 15;
        if (currentTime.minutes >= 60) {
          currentTime.hours += Math.floor(currentTime.minutes / 60);
          currentTime.minutes = currentTime.minutes % 60;
        }
        const breakEnd = `${currentTime.hours.toString().padStart(2, '0')}:${currentTime.minutes.toString().padStart(2, '0')}`;
        
        newPeriods.push({
          id: `break-${i}`,
          number: 0,
          startTime: breakStart,
          endTime: breakEnd,
          type: 'break',
          label: i === 3 ? 'Short Break' : 'Lunch Break'
        });
      }
    }
    
    setPeriods(newPeriods);
  };

  const updatePeriodTime = (id: string, field: 'startTime' | 'endTime', value: string) => {
    setPeriods(prev => prev.map(period => 
      period.id === id ? { ...period, [field]: value } : period
    ));
  };

  const addBreakAfterPeriod = (afterPeriodId: string) => {
    const periodIndex = periods.findIndex(p => p.id === afterPeriodId);
    if (periodIndex === -1) return;

    const afterPeriod = periods[periodIndex];
    const breakId = `break-after-${afterPeriodId}`;
    
    const [hours, minutes] = afterPeriod.endTime.split(':').map(Number);
    const breakEndTime = new Date();
    breakEndTime.setHours(hours, minutes + 15);
    
    const newBreak: Period = {
      id: breakId,
      number: 0,
      startTime: afterPeriod.endTime,
      endTime: `${breakEndTime.getHours().toString().padStart(2, '0')}:${breakEndTime.getMinutes().toString().padStart(2, '0')}`,
      type: 'break',
      label: 'Break'
    };

    const newPeriods = [...periods];
    newPeriods.splice(periodIndex + 1, 0, newBreak);
    setPeriods(newPeriods);
    
    toast({
      title: "Break Added",
      description: `Break added after Period ${afterPeriod.number}`
    });
  };

  const removeBreak = (breakId: string) => {
    setPeriods(prev => prev.filter(p => p.id !== breakId));
    toast({
      title: "Break Removed",
      description: "Break has been removed from the timetable"
    });
  };

  const updateBreakLabel = (id: string, label: string) => {
    setPeriods(prev => prev.map(period => 
      period.id === id ? { ...period, label } : period
    ));
  };

  const handleUpdateDayPeriods = (dayId: string, dayPeriods: Period[]) => {
    setDaySpecificPeriods(prev => ({
      ...prev,
      [dayId]: dayPeriods
    }));
  };

  const handleSaveConfiguration = () => {
    if (!timetableName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a timetable name",
        variant: "destructive"
      });
      return;
    }

    if (selectedDays.length === 0) {
      toast({
        title: "Error", 
        description: "Please select at least one school day",
        variant: "destructive"
      });
      return;
    }

    if (!isWeeklyMode && !fortnightStartDate) {
      toast({
        title: "Error",
        description: "Fortnight Start Date is required for fortnightly mode",
        variant: "destructive"
      });
      return;
    }

    // Validate timings for default periods
    const validationErrors = validatePeriodTimings(periods);
    if (validationErrors.length > 0) {
      toast({
        title: "Cannot Save Configuration",
        description: "Please fix all timing conflicts in default schedule before saving",
        variant: "destructive"
      });
      return;
    }

    // Validate timings for day-specific periods
    for (const [dayId, dayPeriods] of Object.entries(daySpecificPeriods)) {
      const dayValidationErrors = validatePeriodTimings(dayPeriods);
      if (dayValidationErrors.length > 0) {
        toast({
          title: "Cannot Save Configuration",
          description: `Please fix timing conflicts for ${dayId} before saving`,
          variant: "destructive"
        });
        return;
      }
    }

    console.log('Saving configuration:', {
      configId,
      timetableName,
      totalPeriods,
      periods,
      selectedDays,
      isWeeklyMode,
      fortnightStartDate,
      daySpecificPeriods
    });

    toast({
      title: "Configuration Saved",
      description: `${timetableName} has been saved successfully`
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Time & Period Configuration
          </span>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </CardTitle>
        <CardDescription>
          Set up your school's daily schedule with periods, breaks, and working days
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Timetable Name */}
        <div className="space-y-2">
          <Label htmlFor="timetable-name">Timetable Name</Label>
          <Input
            id="timetable-name"
            value={timetableName}
            onChange={(e) => setTimetableName(e.target.value)}
            placeholder="e.g., Grade 10 Science Stream"
            className="max-w-md"
          />
        </div>

        {/* Default Period Configuration */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Label className="text-base font-medium">Default Schedule</Label>
            <span className="text-sm text-muted-foreground">(applies to all days unless customized)</span>
          </div>
          <PeriodConfigurationForm
            totalPeriods={totalPeriods}
            periods={periods}
            isPeriodsExpanded={isPeriodsExpanded}
            onTotalPeriodsChange={handleTotalPeriodsChange}
            onPeriodsExpandedChange={setIsPeriodsExpanded}
            onUpdatePeriodTime={updatePeriodTime}
            onAddBreakAfterPeriod={addBreakAfterPeriod}
            onRemoveBreak={removeBreak}
            onUpdateBreakLabel={updateBreakLabel}
          />
        </div>

        {/* Days Configuration */}
        <WeekDaysSelector
          selectedDays={selectedDays}
          onSelectedDaysChange={setSelectedDays}
          isWeeklyMode={isWeeklyMode}
        />

        {/* Day-Specific Configuration */}
        <DaySpecificConfig
          selectedDays={selectedDays}
          isWeeklyMode={isWeeklyMode}
          defaultPeriods={periods}
          onUpdateDayPeriods={handleUpdateDayPeriods}
          daySpecificPeriods={daySpecificPeriods}
        />

        {/* Mode Selection & Actions */}
        <TimetableActions
          isWeeklyMode={isWeeklyMode}
          onModeChange={setIsWeeklyMode}
          onSaveConfiguration={handleSaveConfiguration}
          fortnightStartDate={fortnightStartDate}
          onFortnightStartDateChange={setFortnightStartDate}
        />
      </CardContent>
    </Card>
  );
};
