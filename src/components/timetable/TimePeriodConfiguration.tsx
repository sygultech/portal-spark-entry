
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Save, X } from "lucide-react";
import { Period } from "./types/TimePeriodTypes";
import { PeriodConfigurationForm } from "./components/PeriodConfigurationForm";
import { WeekDaysSelector } from "./components/WeekDaysSelector";
import { DaySpecificConfig } from "./components/DaySpecificConfig";
import { TimetableActions } from "./components/TimetableActions";
import { toast } from "@/components/ui/use-toast";

interface TimePeriodConfigurationProps {
  configId: string;
  onClose: () => void;
  onSave: () => void;
}

export const TimePeriodConfiguration = ({
  configId,
  onClose,
  onSave
}: TimePeriodConfigurationProps) => {
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

  const handleSaveConfiguration = () => {
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

    // Save the configuration
    console.log("Saving configuration:", {
      configId,
      totalPeriods,
      periods,
      selectedDays,
      isWeeklyMode,
      fortnightStartDate,
      daySpecificPeriods
    });

    toast({
      title: "Configuration Saved",
      description: "Period configuration has been saved successfully"
    });

    onSave();
  };

  const handleUpdateDayPeriods = (dayId: string, dayPeriods: Period[]) => {
    setDaySpecificPeriods(prev => ({
      ...prev,
      [dayId]: dayPeriods
    }));
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
          onDaysChange={setSelectedDays}
          isWeeklyMode={isWeeklyMode}
        />

        {/* Period Configuration Form */}
        <PeriodConfigurationForm
          totalPeriods={totalPeriods}
          periods={periods}
          isPeriodsExpanded={isPeriodsExpanded}
          onTotalPeriodsChange={setTotalPeriods}
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
        />
      </CardContent>
    </Card>
  );
};
