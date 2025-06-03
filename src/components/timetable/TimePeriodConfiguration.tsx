import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Save, X } from "lucide-react";
import { Period } from "./types/TimePeriodTypes";
import { PeriodConfigurationForm } from "./components/PeriodConfigurationForm";
import { WeekDaysSelector } from "./components/WeekDaysSelector";
import { DaySpecificConfig } from "./components/DaySpecificConfig";
import { TimetableActions } from "./components/TimetableActions";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useTimetableConfiguration } from "@/hooks/useTimetableConfiguration";
import React, { useState, useEffect } from "react";

interface TimePeriodConfigurationProps {
  configId: string;
  onClose: () => void;
  onSave: () => void;
  academicYearId: string;
  configName: string;
  isActive: boolean;
  isDefault: boolean;
}

export const TimePeriodConfiguration = ({
  configId,
  onClose,
  onSave,
  academicYearId,
  configName,
  isActive,
  isDefault
}: TimePeriodConfigurationProps) => {
  const { profile } = useAuth();
  const { saveTimetableConfiguration } = useTimetableConfiguration();
  const [totalPeriods, setTotalPeriods] = useState(6);
  const [periods, setPeriods] = useState<Period[]>([]);
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

  const handleSaveConfiguration = async () => {
    // Validate configuration before saving
    if (!isWeeklyMode && !fortnightStartDate) {
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

    if (!profile?.school_id) {
      toast({
        title: "Error",
        description: "School information not found",
        variant: "destructive"
      });
      return;
    }

    const result = await saveTimetableConfiguration({
      schoolId: profile.school_id,
      name: configName,
      isActive,
      isDefault,
      academicYearId,
      isWeeklyMode,
      fortnightStartDate: isWeeklyMode ? null : fortnightStartDate,
      selectedDays,
      defaultPeriods: periods,
      daySpecificPeriods,
      enableFlexibleTimings: Object.keys(daySpecificPeriods).length > 0,
      batchIds: null // Handle this if batch tagging is needed
    });

    if (result) {
      onSave();
    }
  };

  const handleTotalPeriodsChange = (value: string) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue)) {
      setTotalPeriods(numValue);
    }
  };

  const updatePeriodTime = (periodId: string, field: 'startTime' | 'endTime', value: string) => {
    setPeriods(prev => prev.map(period => 
      period.id === periodId ? { ...period, [field]: value } : period
    ));
  };

  const addBreakAfterPeriod = (periodId: string) => {
    const periodIndex = periods.findIndex(p => p.id === periodId);
    if (periodIndex === -1) return;

    const breakNumber = periods[periodIndex].number + 0.5;
    const breakPeriod: Period = {
      id: `break-${Date.now()}`,
      number: breakNumber,
      startTime: periods[periodIndex].endTime,
      endTime: periods[periodIndex + 1]?.startTime || '09:00',
      type: 'break',
      label: 'Break'
    };

    const newPeriods = [...periods];
    newPeriods.splice(periodIndex + 1, 0, breakPeriod);
    setPeriods(newPeriods);
  };

  const removeBreak = (breakId: string) => {
    setPeriods(prev => prev.filter(period => period.id !== breakId));
  };

  const updateBreakLabel = (breakId: string, label: string) => {
    setPeriods(prev => prev.map(period => 
      period.id === breakId ? { ...period, label } : period
    ));
  };

  const handleUpdateDayPeriods = (dayId: string, updatedPeriods: Period[]) => {
    setDaySpecificPeriods(prev => ({
      ...prev,
      [dayId]: updatedPeriods
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Configure Period Configuration
          </span>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardTitle>
        <CardDescription>
          Set up periods, timings, and scheduling options for this configuration.
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

        {/* Day-Specific Configuration */}
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
        />
      </CardContent>
    </Card>
  );
};
