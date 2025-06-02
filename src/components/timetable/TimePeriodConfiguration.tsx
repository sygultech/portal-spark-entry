
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Save, X } from "lucide-react";
import { Period } from "./types/TimePeriodTypes";
import { PeriodConfigurationForm } from "./components/PeriodConfigurationForm";
import { WeekDaysSelector } from "./components/WeekDaysSelector";
import { DaySpecificConfig } from "./components/DaySpecificConfig";
import { Period, TimePeriodConfigurationProps } from "./types/TimePeriodTypes";
import { validatePeriodTimings } from "./utils/timeValidation";

interface TimePeriodConfigurationProps {
  configId: string;
  onClose: () => void;
  onSave: () => void;
}

export const TimePeriodConfiguration = ({ configId, onClose, onSave }: TimePeriodConfigurationPropsExtended) => {
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
  const [selectedDays, setSelectedDays] = useState<string[]>([
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday'
  ]);
  const [isWeeklyMode, setIsWeeklyMode] = useState(true);
  const [fortnightStartDate, setFortnightStartDate] = useState<string>('');
  const [daySpecificPeriods, setDaySpecificPeriods] = useState<Record<string, Period[]>>({});

  // Generate default periods based on total periods count
  useEffect(() => {
    const newPeriods: Period[] = [];
    
    for (let i = 1; i <= totalPeriods; i++) {
      const startHour = 8 + Math.floor((i - 1) * 0.75); // Roughly 45 min periods
      const startMinute = ((i - 1) * 45) % 60;
      const endMinute = (i * 45) % 60;
      const endHour = 8 + Math.floor((i * 45) / 60);
      
      newPeriods.push({
        id: `period-${i}`,
        number: i,
        startTime: `${startHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`,
        endTime: `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`,
        type: 'period',
        label: `Period ${i}`
      });
    }
    
    setPeriods(newPeriods);
  }, [totalPeriods]);

  const handleSaveConfiguration = () => {
    if (!timetableName.trim()) {
      toast({
        title: "Validation Error",
        description: "Fortnight start date is required for fortnightly mode",
        variant: "destructive"
      });
      return;
    }

    if (selectedDays.length === 0) {
      toast({
        title: "Validation Error", 
        description: "At least one school day must be selected",
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

    // Comprehensive validation
    const validationStatus = getComprehensiveValidationStatus();
    if (validationStatus.hasErrors) {
      toast({
        title: "Cannot Save Configuration",
        description: `Please fix all ${validationStatus.totalErrors} timing conflicts before saving`,
        variant: "destructive"
      });
      return;
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

    // Call the onSave callback to close the configuration
    if (onSave) {
      onSave();
    }
  };

  const updatePeriodTime = (periodId: string, field: 'startTime' | 'endTime', value: string) => {
    setPeriods(prevPeriods => 
      prevPeriods.map(period => 
        period.id === periodId ? { ...period, [field]: value } : period
      )
    );
  };

  const addBreakAfterPeriod = (afterPeriodId: string) => {
    setPeriods(prevPeriods => {
      const periodIndex = prevPeriods.findIndex(p => p.id === afterPeriodId);
      if (periodIndex === -1) return prevPeriods;

      const afterPeriod = prevPeriods[periodIndex];
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

      const newPeriods = [...prevPeriods];
      newPeriods.splice(periodIndex + 1, 0, newBreak);
      return newPeriods;
    });
  };

  const removeBreak = (breakId: string) => {
    setPeriods(prevPeriods => prevPeriods.filter(p => p.id !== breakId));
  };

  const updateBreakLabel = (periodId: string, label: string) => {
    setPeriods(prevPeriods => 
      prevPeriods.map(period => 
        period.id === periodId ? { ...period, label } : period
      )
    );
  };

  // Handler to convert string to number for totalPeriods
  const handleTotalPeriodsChange = (value: string) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue)) {
      setTotalPeriods(numValue);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Time & Period Configuration
            {validationStatus.hasErrors && (
              <span className="flex items-center gap-1 text-destructive">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">{validationStatus.totalErrors} conflicts</span>
              </span>
            )}
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
        {/* Week Days Selector */}
        <WeekDaysSelector
          selectedDays={selectedDays}
          onSelectedDaysChange={setSelectedDays}
          isWeeklyMode={isWeeklyMode}
        />

        {/* Period Configuration Form */}
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

        {/* Day-Specific Configuration - This should always be visible */}
        <DaySpecificConfig
          selectedDays={selectedDays}
          isWeeklyMode={isWeeklyMode}
          defaultPeriods={periods}
          onUpdateDayPeriods={handleUpdateDayPeriods}
          daySpecificPeriods={daySpecificPeriods}
        />

        {/* Timetable Actions */}
        <TimetableActions
          isWeeklyMode={isWeeklyMode}
          onModeChange={setIsWeeklyMode}
          onSaveConfiguration={handleSaveConfiguration}
          fortnightStartDate={fortnightStartDate}
          onFortnightStartDateChange={setFortnightStartDate}
          isLoading={isLoading}
        />
      </CardContent>
    </Card>
  );
};
