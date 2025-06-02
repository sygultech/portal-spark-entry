import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Calendar, Info, Copy, AlertTriangle } from "lucide-react";
import { Period, WeekDay, weekDays } from "../types/TimePeriodTypes";
import { PeriodConfigurationForm } from "./PeriodConfigurationForm";
import { validatePeriodTimings } from "../utils/timeValidation";
import { toast } from "@/components/ui/use-toast";

interface DaySpecificConfigProps {
  enableFlexibleTimings: boolean;
  setEnableFlexibleTimings: (enabled: boolean) => void;
  selectedDays: string[];
  defaultPeriods: Period[];
  daySpecificPeriods: Record<string, Period[]>;
  onUpdateDayPeriods: (dayId: string, periods: Period[]) => void;
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

export const DaySpecificConfig: React.FC<DaySpecificConfigProps> = ({
  enableFlexibleTimings,
  setEnableFlexibleTimings,
  selectedDays,
  defaultPeriods,
  daySpecificPeriods,
  onUpdateDayPeriods
}) => {
  const [activeDay, setActiveDay] = useState<string | null>(null);

  useEffect(() => {
    // When selected days change, update active day if needed
    if (selectedDays.length > 0 && !activeDay) {
      setActiveDay(selectedDays[0]);
    } else if (!selectedDays.includes(activeDay || '')) {
      setActiveDay(selectedDays[0] || null);
    }
  }, [selectedDays, activeDay]);

  const handleToggleFlexibleTimings = (enabled: boolean) => {
    setEnableFlexibleTimings(enabled);
    if (!enabled) {
      setActiveDay(null);
      // When disabled, copy default periods to each selected day
      selectedDays.forEach(day => {
        const periodsWithDay = defaultPeriods.map(period => ({
          ...period,
          dayOfWeek: day
        }));
        onUpdateDayPeriods(day, periodsWithDay);
      });
    } else {
      // When enabled, initialize each selected day with default periods
      selectedDays.forEach(day => {
        if (!daySpecificPeriods[day]) {
          const periodsWithDay = defaultPeriods.map(period => ({
            ...period,
            dayOfWeek: day
          }));
          onUpdateDayPeriods(day, periodsWithDay);
        }
      });
      // Set the first day as active
      if (selectedDays.length > 0) {
        setActiveDay(selectedDays[0]);
      }
    }
  };

  const copyFromDefault = (dayId: string) => {
    onUpdateDayPeriods(dayId, [...defaultPeriods]);
    
    // Validate the copied periods immediately
    const validationErrors = validatePeriodTimings(defaultPeriods);
    if (validationErrors.length > 0) {
      toast({
        title: "Warning: Timing Conflicts Detected",
        description: `Copied periods have ${validationErrors.length} timing conflicts. Please review and fix them.`,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Periods Copied",
        description: "Default periods copied successfully"
      });
    }
  };

  const copyFromAnotherDay = (dayId: string, sourceDayId: string) => {
    const sourcePeriods = daySpecificPeriods[sourceDayId] || defaultPeriods;
    onUpdateDayPeriods(dayId, [...sourcePeriods]);
    
    // Validate the copied periods immediately
    const validationErrors = validatePeriodTimings(sourcePeriods);
    if (validationErrors.length > 0) {
      toast({
        title: "Warning: Timing Conflicts Detected",
        description: `Copied periods have ${validationErrors.length} timing conflicts. Please review and fix them.`,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Periods Copied",
        description: `Periods copied from ${weekDays.find(d => d.id === sourceDayId)?.label} successfully`
      });
    }
  };

  const getCurrentPeriods = (dayId: string): Period[] => {
    return daySpecificPeriods[dayId] || defaultPeriods;
  };

  const hasCustomTimings = (dayId: string): boolean => {
    return !!daySpecificPeriods[dayId];
  };

  const hasValidationErrors = (dayId: string): boolean => {
    const periods = getCurrentPeriods(dayId);
    return validatePeriodTimings(periods).length > 0;
  };

  const updatePeriodTime = (dayId: string, periodId: string, field: 'startTime' | 'endTime', value: string) => {
    const currentPeriods = getCurrentPeriods(dayId);
    const updatedPeriods = currentPeriods.map(period => 
      period.id === periodId ? { ...period, [field]: value } : period
    );
    onUpdateDayPeriods(dayId, updatedPeriods);
    
    // Immediate validation feedback
    setTimeout(() => {
      const validationErrors = validatePeriodTimings(updatedPeriods);
      const periodErrors = validationErrors.filter(error => error.id === periodId);
      
      if (periodErrors.length > 0) {
        toast({
          title: "Timing Conflict",
          description: `${weekDays.find(d => d.id === dayId)?.label}: ${periodErrors[0].message}`,
          variant: "destructive"
        });
      }
    }, 100);
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
    
    // Validate after adding break
    setTimeout(() => {
      const validationErrors = validatePeriodTimings(newPeriods);
      if (validationErrors.length > 0) {
        toast({
          title: "Warning: Timing Conflict",
          description: `Adding break created timing conflicts. Please review the schedule.`,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Break Added",
          description: `Break added after Period ${afterPeriod.number} for ${weekDays.find(d => d.id === dayId)?.label}`
        });
      }
    }, 100);
  };

  const removeBreak = (dayId: string, breakId: string) => {
    const currentPeriods = getCurrentPeriods(dayId);
    const updatedPeriods = currentPeriods.filter(p => p.id !== breakId);
    onUpdateDayPeriods(dayId, updatedPeriods);
    
    toast({
      title: "Break Removed",
      description: `Break removed from ${weekDays.find(d => d.id === dayId)?.label}`
    });
  };

  const updateBreakLabel = (dayId: string, periodId: string, label: string) => {
    const currentPeriods = getCurrentPeriods(dayId);
    const updatedPeriods = currentPeriods.map(period => 
      period.id === periodId ? { ...period, label } : period
    );
    onUpdateDayPeriods(dayId, updatedPeriods);
  };

  // Get overall validation status for all day-specific configurations
  const getOverallValidationStatus = () => {
    if (!enableFlexibleTimings) return { hasErrors: false, errorCount: 0 };
    
    let totalErrors = 0;
    for (const dayId of Object.keys(daySpecificPeriods)) {
      const errors = validatePeriodTimings(daySpecificPeriods[dayId]);
      totalErrors += errors.length;
    }
    
    return { hasErrors: totalErrors > 0, errorCount: totalErrors };
  };

  const validationStatus = getOverallValidationStatus();

  if (selectedDays.length === 0) {
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
            {validationStatus.hasErrors && (
              <span className="flex items-center gap-1 text-destructive">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">{validationStatus.errorCount} conflicts</span>
              </span>
            )}
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
        {!enableFlexibleTimings ? (
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
                  {validationStatus.hasErrors && (
                    <p className="text-sm text-destructive font-medium">
                      ⚠️ {validationStatus.errorCount} timing conflicts detected across day-specific configurations. 
                      Please review and fix all conflicts before saving.
                    </p>
                  )}
                </div>
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
              {selectedDays.map((day) => {
                const hasErrors = hasValidationErrors(day);
                const hasCustom = hasCustomTimings(day);
                
                return (
                  <Button
                    key={day}
                    variant={activeDay === day ? "default" : hasCustom ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => setActiveDay(activeDay === day ? null : day)}
                    className={`flex flex-col h-16 text-xs ${
                      hasErrors ? 'border-destructive bg-destructive/10 hover:bg-destructive/20' : ''
                    }`}
                  >
                    <span className="font-medium">{day.charAt(0).toUpperCase() + day.slice(1)}</span>
                    <div className="flex items-center gap-1">
                      {hasCustom && (
                        <span className="text-xs opacity-75">Custom</span>
                      )}
                      {hasErrors && (
                        <AlertTriangle className="h-3 w-3 text-destructive" />
                      )}
                    </div>
                  </Button>
                );
              })}
            </div>

            {activeDay && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-lg">
                    <span className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {weekDays.find(d => d.id === activeDay)?.fullName} Timings
                      {hasValidationErrors(activeDay) && (
                        <span className="flex items-center gap-1 text-destructive">
                          <AlertTriangle className="h-4 w-4" />
                          <span className="text-sm">
                            {validatePeriodTimings(getCurrentPeriods(activeDay)).length} conflicts
                          </span>
                        </span>
                      )}
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
                      {selectedDays.length > 1 && (
                        <select
                          className="text-xs px-2 py-1 border rounded"
                          onChange={(e) => e.target.value && copyFromAnotherDay(activeDay, e.target.value)}
                          defaultValue=""
                        >
                          <option value="" disabled>Copy from...</option>
                          {selectedDays.filter(d => d !== activeDay && hasCustomTimings(d)).map(day => (
                            <option key={day} value={day}>{day.charAt(0).toUpperCase() + day.slice(1)}</option>
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
