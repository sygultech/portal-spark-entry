import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Calendar, Info, Copy } from "lucide-react";
import { Period, WeekDay, weekDays } from "../types/TimePeriodTypes";
import { PeriodConfigurationForm } from "./PeriodConfigurationForm";

interface DaySpecificConfigProps {
  selectedDays: string[];
  isWeeklyMode: boolean;
  defaultPeriods: Period[];
  onUpdateDayPeriods: (dayId: string, periods: Period[]) => void;
  daySpecificPeriods: Record<string, Period[]>;
}

// Generate fortnight days
const generateFortnightDays = (): WeekDay[] => {
  const fortnightDays: WeekDay[] = [];
  
  weekDays.forEach((day) => {
    fortnightDays.push({
      id: `week1-${day.id}`,
      label: `W1-${day.label}`,
      fullName: `Week 1 ${day.fullName}`
    });
  });
  
  weekDays.forEach((day) => {
    fortnightDays.push({
      id: `week2-${day.id}`,
      label: `W2-${day.label}`,
      fullName: `Week 2 ${day.fullName}`
    });
  });
  
  return fortnightDays;
};

export const DaySpecificConfig = ({
  selectedDays,
  isWeeklyMode,
  defaultPeriods,
  onUpdateDayPeriods,
  daySpecificPeriods
}: DaySpecificConfigProps) => {
  const [enableFlexibleTimings, setEnableFlexibleTimings] = useState(false);
  const [activeDay, setActiveDay] = useState<string | null>(null);

  const daysToShow = isWeeklyMode ? weekDays : generateFortnightDays();
  const activeDays = daysToShow.filter(day => selectedDays.includes(day.id));

  const handleToggleFlexibleTimings = (enabled: boolean) => {
    setEnableFlexibleTimings(enabled);
    if (!enabled) {
      setActiveDay(null);
      // Reset all day-specific configurations when disabled
      activeDays.forEach(day => {
        onUpdateDayPeriods(day.id, []);
      });
    }
  };

  const copyFromDefault = (dayId: string) => {
    onUpdateDayPeriods(dayId, [...defaultPeriods]);
  };

  const copyFromAnotherDay = (dayId: string, sourceDayId: string) => {
    const sourcePeriods = daySpecificPeriods[sourceDayId] || defaultPeriods;
    onUpdateDayPeriods(dayId, [...sourcePeriods]);
  };

  const getCurrentPeriods = (dayId: string): Period[] => {
    return daySpecificPeriods[dayId] || defaultPeriods;
  };

  const hasCustomTimings = (dayId: string): boolean => {
    return !!daySpecificPeriods[dayId];
  };

  const updatePeriodTime = (dayId: string, periodId: string, field: 'startTime' | 'endTime', value: string) => {
    const currentPeriods = getCurrentPeriods(dayId);
    const updatedPeriods = currentPeriods.map(period => 
      period.id === periodId ? { ...period, [field]: value } : period
    );
    onUpdateDayPeriods(dayId, updatedPeriods);
  };

  const addBreakAfterPeriod = (dayId: string, afterPeriodId: string) => {
    const currentPeriods = getCurrentPeriods(dayId);
    const periodIndex = currentPeriods.findIndex(p => p.id === afterPeriodId);
    if (periodIndex === -1) return;

    const afterPeriod = currentPeriods[periodIndex];
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

    const newPeriods = [...currentPeriods];
    newPeriods.splice(periodIndex + 1, 0, newBreak);
    onUpdateDayPeriods(dayId, newPeriods);
  };

  const removeBreak = (dayId: string, breakId: string) => {
    const currentPeriods = getCurrentPeriods(dayId);
    const updatedPeriods = currentPeriods.filter(p => p.id !== breakId);
    onUpdateDayPeriods(dayId, updatedPeriods);
  };

  const updateBreakLabel = (dayId: string, periodId: string, label: string) => {
    const currentPeriods = getCurrentPeriods(dayId);
    const updatedPeriods = currentPeriods.map(period => 
      period.id === periodId ? { ...period, label } : period
    );
    onUpdateDayPeriods(dayId, updatedPeriods);
  };

  if (activeDays.length === 0) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Please select school days first to configure day-specific timings.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Day-Specific Timings
          </span>
          <div className="flex items-center gap-2">
            <Label htmlFor="flexible-timings" className="text-sm">
              Enable Different Timings Per Day
            </Label>
            <Switch
              id="flexible-timings"
              checked={enableFlexibleTimings}
              onCheckedChange={handleToggleFlexibleTimings}
            />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activeDays.length === 0 ? (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Please select school days first to configure day-specific timings.
            </AlertDescription>
          </Alert>
        ) : !enableFlexibleTimings ? (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Currently using the same period timings for all school days. 
              Enable "Different Timings Per Day" above if you need specific days 
              to have different start/end times (e.g., early dismissal on Fridays).
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p><strong>Flexible Day Timings Enabled</strong></p>
                  <p className="text-sm">
                    You can now customize period timings for specific days. 
                    Days without custom timings will use the default schedule.
                    Common use cases: Early dismissal Fridays, Late start Mondays, etc.
                  </p>
                </div>
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
              {activeDays.map((day) => (
                <Button
                  key={day.id}
                  variant={activeDay === day.id ? "default" : hasCustomTimings(day.id) ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => setActiveDay(activeDay === day.id ? null : day.id)}
                  className="flex flex-col h-16 text-xs"
                >
                  <span className="font-medium">{day.label}</span>
                  {hasCustomTimings(day.id) && (
                    <span className="text-xs opacity-75">Custom</span>
                  )}
                </Button>
              ))}
            </div>

            {activeDay && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-lg">
                    <span className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {daysToShow.find(d => d.id === activeDay)?.fullName} Timings
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyFromDefault(activeDay)}
                        className="text-xs"
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy Default
                      </Button>
                      {activeDays.length > 1 && (
                        <select
                          className="text-xs px-2 py-1 border rounded"
                          onChange={(e) => e.target.value && copyFromAnotherDay(activeDay, e.target.value)}
                          defaultValue=""
                        >
                          <option value="" disabled>Copy from...</option>
                          {activeDays.filter(d => d.id !== activeDay && hasCustomTimings(d.id)).map(day => (
                            <option key={day.id} value={day.id}>{day.label}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <PeriodConfigurationForm
                    totalPeriods={getCurrentPeriods(activeDay).filter(p => p.type === 'period').length}
                    periods={getCurrentPeriods(activeDay)}
                    isPeriodsExpanded={true}
                    onTotalPeriodsChange={() => {}} // Not applicable for day-specific config
                    onPeriodsExpandedChange={() => {}} // Always expanded for day-specific
                    onUpdatePeriodTime={(periodId, field, value) => updatePeriodTime(activeDay, periodId, field, value)}
                    onAddBreakAfterPeriod={(periodId) => addBreakAfterPeriod(activeDay, periodId)}
                    onRemoveBreak={(breakId) => removeBreak(activeDay, breakId)}
                    onUpdateBreakLabel={(periodId, label) => updateBreakLabel(activeDay, periodId, label)}
                  />
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
