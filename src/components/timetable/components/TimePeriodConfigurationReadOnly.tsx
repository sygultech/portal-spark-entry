import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, X } from "lucide-react";
import { Period } from "../types/TimePeriodTypes";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { weekDays } from "../types/TimePeriodTypes";

interface TimePeriodConfigurationReadOnlyProps {
  configName: string;
  onClose: () => void;
  periods: Period[];
  selectedDays: string[];
  isWeeklyMode: boolean;
  daySpecificPeriods: Record<string, Period[]>;
}

const PeriodDisplay = ({ period }: { period: Period }) => (
  <div className="flex items-center justify-between p-3 rounded-lg border bg-muted">
    <div className="flex items-center gap-2">
      <span className="font-medium text-sm">{period.type === 'period' ? `Period ${period.number}` : period.label}</span>
    </div>
    <div className="flex items-center gap-2">
      <span className="text-sm">{period.startTime}</span>
      <span className="text-muted-foreground">to</span>
      <span className="text-sm">{period.endTime}</span>
    </div>
  </div>
);

export const TimePeriodConfigurationReadOnly = ({
  configName,
  onClose,
  periods,
  selectedDays,
  isWeeklyMode,
  daySpecificPeriods
}: TimePeriodConfigurationReadOnlyProps) => {
  const daysToShow = isWeeklyMode ? weekDays : weekDays.flatMap(day => [
    { id: `week1-${day.id}`, label: `W1-${day.label}`, fullName: `Week 1 ${day.fullName}` },
    { id: `week2-${day.id}`, label: `W2-${day.label}`, fullName: `Week 2 ${day.fullName}` }
  ]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {configName}
          </span>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardTitle>
        <CardDescription>
          View timetable configuration details
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* School Days */}
        <div className="space-y-4">
          <div>
            <Label>School Days</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedDays.map(dayId => {
                const day = daysToShow.find(d => d.id === dayId);
                return (
                  <Badge key={dayId} variant="secondary">
                    {day?.fullName}
                  </Badge>
                );
              })}
            </div>
          </div>
        </div>

        {/* Default Periods */}
        <div className="space-y-4">
          <Label>Default Periods</Label>
          <div className="space-y-2">
            {periods.map(period => (
              <PeriodDisplay key={period.id} period={period} />
            ))}
          </div>
        </div>

        {/* Day-Specific Periods */}
        {Object.keys(daySpecificPeriods).length > 0 && (
          <div className="space-y-4">
            <Label>Day-Specific Periods</Label>
            {Object.entries(daySpecificPeriods).map(([dayId, dayPeriods]) => {
              const day = daysToShow.find(d => d.id === dayId);
              return (
                <div key={dayId} className="space-y-2">
                  <Badge>{day?.fullName}</Badge>
                  <div className="space-y-2 ml-4">
                    {dayPeriods.map(period => (
                      <PeriodDisplay key={period.id} period={period} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 