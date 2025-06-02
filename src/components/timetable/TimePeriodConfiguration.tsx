import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings2, X, AlertTriangle } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PeriodConfigurationForm } from "./components/PeriodConfigurationForm";
import { WeekDaysSelector } from "./components/WeekDaysSelector";
import { TimetableActions } from "./components/TimetableActions";
import { DaySpecificConfig } from "./components/DaySpecificConfig";
import { Period, TimePeriodConfigurationProps, TimetableConfiguration, ValidationError } from "./types/TimePeriodTypes";
import { validatePeriodTimings } from "./utils/timeValidation";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from '@/components/ui/use-toast';
import { Switch } from '@/components/ui/switch';

export interface TimePeriodConfigurationPropsExtended extends TimePeriodConfigurationProps {
  selectedAcademicYear: string;
  onSave?: (config: TimetableConfiguration) => void;
}

export const TimePeriodConfiguration = ({ configId, selectedAcademicYear, onClose, onSave }: TimePeriodConfigurationPropsExtended) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [timetableName, setTimetableName] = useState(`Configuration ${configId.split('-')[1]}`);
  const [totalPeriods, setTotalPeriods] = useState(8);
  const [enableDaySpecificTimings, setEnableDaySpecificTimings] = useState(false);
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
  const [fortnightWeeks, setFortnightWeeks] = useState<Record<string, number>>({});
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Initialize with default periods if none exist
    if (periods.length === 0) {
      const defaultPeriods: Period[] = [
        {
          id: '1',
          number: 1,
          startTime: '08:00',
          endTime: '08:45',
          type: 'period'
        },
        {
          id: '2',
          number: 2,
          startTime: '08:45',
          endTime: '09:30',
          type: 'period'
        },
        {
          id: 'break1',
          number: 3,
          startTime: '09:30',
          endTime: '09:45',
          type: 'break',
          label: 'Break'
        }
      ];
      setPeriods(defaultPeriods);
    }
  }, []);

  const handleTotalPeriodsChange = (value: string) => {
    const num = parseInt(value) || 0;
    if (num > 0 && num <= 12) {
      setTotalPeriods(num);
      generatePeriods(num);
    }
  };

  const generatePeriods = (num: number) => {
    const newPeriods: Period[] = [];
    let currentTime = '08:00';
    const periodDuration = 45; // minutes

    for (let i = 1; i <= num; i++) {
      const startTime = currentTime;
      const endTime = addMinutes(currentTime, periodDuration);
      
      newPeriods.push({
        id: i.toString(),
        number: i,
        startTime,
        endTime,
        type: 'period'
      });

      currentTime = endTime;

      // Add breaks after every 3 periods
      if (i % 3 === 0 && i < num) {
        const breakStart = currentTime;
        const breakEnd = addMinutes(breakStart, 15);
        
        newPeriods.push({
          id: `break${i}`,
          number: 0,
          startTime: breakStart,
          endTime: breakEnd,
          type: 'break',
          label: i === 3 ? 'Short Break' : 'Break'
        });

        currentTime = breakEnd;
      }
    }

    setPeriods(newPeriods);
  };

  const addMinutes = (time: string, minutes: number): string => {
    const [hours, mins] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, mins + minutes);
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  const updatePeriodTime = (periodId: string, field: 'startTime' | 'endTime', value: string) => {
    setPeriods(prevPeriods => 
      prevPeriods.map(period => 
        period.id === periodId ? { ...period, [field]: value } : period
      )
    );
  };

  const addBreakAfterPeriod = (periodId: string) => {
    const period = periods.find(p => p.id === periodId);
    if (!period) return;

    const breakId = `break-${Date.now()}`;
    const newBreak: Period = {
      id: breakId,
      number: 0,
      startTime: period.endTime,
      endTime: addMinutes(period.endTime, 15),
      type: 'break',
      label: 'Break'
    };

    setPeriods(prevPeriods => {
      const periodIndex = prevPeriods.findIndex(p => p.id === periodId);
      return [
        ...prevPeriods.slice(0, periodIndex + 1),
        newBreak,
        ...prevPeriods.slice(periodIndex + 1)
      ];
    });
  };

  const removeBreak = (breakId: string) => {
    setPeriods(prevPeriods => prevPeriods.filter(p => p.id !== breakId));
  };

  const updateBreakLabel = (breakId: string, label: string) => {
    setPeriods(prevPeriods =>
      prevPeriods.map(period =>
        period.id === breakId ? { ...period, label } : period
      )
    );
  };

  const handleUpdateDayPeriods = (day: string, updatedPeriods: Period[]) => {
    setDaySpecificPeriods(prev => ({
      ...prev,
      [day]: updatedPeriods
    }));
  };

  const validatePeriods = (): ValidationError[] => {
    const errors: ValidationError[] = [];
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

    days.forEach(day => {
      const dayPeriods = periods.filter(p => p.dayOfWeek === day);
      
      // Sort periods by start time
      dayPeriods.sort((a, b) => a.startTime.localeCompare(b.startTime));

      // Check for gaps and overlaps
      for (let i = 0; i < dayPeriods.length - 1; i++) {
        const current = dayPeriods[i];
        const next = dayPeriods[i + 1];

        if (current.endTime !== next.startTime) {
          errors.push({
            id: current.id,
            message: `Gap between ${current.endTime} and ${next.startTime}`,
            type: 'invalid_time',
            day
          });
        }
      }

      // Check for end before start
      dayPeriods.forEach(period => {
        if (period.endTime <= period.startTime) {
          errors.push({
            id: period.id,
            message: 'End time must be after start time',
            type: 'end_before_start',
            day
          });
        }
      });

      // Check for overlaps
      for (let i = 0; i < dayPeriods.length; i++) {
        for (let j = i + 1; j < dayPeriods.length; j++) {
          const period1 = dayPeriods[i];
          const period2 = dayPeriods[j];
          
          if (
            (period1.startTime <= period2.startTime && period1.endTime > period2.startTime) ||
            (period2.startTime <= period1.startTime && period2.endTime > period1.startTime)
          ) {
            errors.push({
              id: period1.id,
              message: `Overlaps with period ${period2.number}`,
              type: 'overlap',
              day
            });
          }
        }
      }
    });

    return errors;
  };

  const getComprehensiveValidationStatus = () => {
    const defaultErrors = validatePeriods();
    const daySpecificErrors = validatePeriods();
    const allErrors = [...defaultErrors, ...daySpecificErrors];

    return {
      hasErrors: allErrors.length > 0,
      totalErrors: allErrors.length,
      errors: allErrors
    };
  };

  const handleSaveConfiguration = async () => {
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

    // Create periods for each selected day
    const allPeriods: Period[] = [];
    selectedDays.forEach(day => {
      const dayPeriods = daySpecificPeriods[day] || periods;
      dayPeriods.forEach(period => {
        allPeriods.push({
          ...period,
          dayOfWeek: day,
          isFortnightly: !isWeeklyMode,
          fortnightWeek: fortnightWeeks[period.id] || 1
        });
      });
    });

    const config: TimetableConfiguration = {
      id: configId,
      name: timetableName,
      isActive: true,
      isDefault: false,
      academicYearId: selectedAcademicYear,
      schoolId: user?.schoolId,
      periods: allPeriods,
      batchIds: []
    };

    setIsSaving(true);
    try {
      if (onSave) {
        await onSave(config);
      }

      toast({
        title: 'Success',
        description: 'Timetable configuration saved successfully'
      });

      if (onClose) {
        onClose();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save timetable configuration',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const validationStatus = getComprehensiveValidationStatus();

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
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="timetable-name" className="text-base font-medium">Timetable Name</Label>
            <Input
              id="timetable-name"
              value={timetableName}
              onChange={(e) => setTimetableName(e.target.value)}
              placeholder="Enter timetable name"
              className="max-w-md"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label className="text-base font-medium">Default Schedule</Label>
              <span className="text-sm text-muted-foreground">(applies to all days unless customized)</span>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="day-specific-timings">Enable Different Timings Per Day</Label>
              <Switch
                id="day-specific-timings"
                checked={enableDaySpecificTimings}
                onCheckedChange={setEnableDaySpecificTimings}
              />
            </div>
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

        {/* Day-Specific Configuration - Only show when enabled */}
        {enableDaySpecificTimings && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Label className="text-base font-medium">Day-Specific Timings</Label>
              <span className="text-sm text-muted-foreground">(override default schedule for specific days)</span>
            </div>
            {periods.map((period) => (
              <DaySpecificConfig
                key={period.id}
                period={period}
                onUpdate={(updatedPeriod) => {
                  setPeriods(prevPeriods =>
                    prevPeriods.map(p => p.id === updatedPeriod.id ? updatedPeriod : p)
                  );
                }}
                fortnightWeeks={[1, 2]}
                onUpdateFortnightWeek={(week) => {
                  setFortnightWeeks(prev => ({
                    ...prev,
                    [period.id]: week
                  }));
                }}
              />
            ))}
          </div>
        )}

        {/* Mode Selection & Actions */}
        <TimetableActions
          isWeeklyMode={isWeeklyMode}
          onModeChange={setIsWeeklyMode}
          onSaveConfiguration={handleSaveConfiguration}
          fortnightStartDate={fortnightStartDate}
          onFortnightStartDateChange={setFortnightStartDate}
        />

        {validationErrors.length > 0 && (
          <div className="bg-destructive/10 p-4 rounded-md">
            <h4 className="text-destructive font-medium mb-2">Validation Errors</h4>
            <ul className="list-disc list-inside space-y-1">
              {validationErrors.map((error) => (
                <li key={error.id} className="text-destructive">
                  {error.day ? `[${error.day}] ` : ''}{error.message}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
