
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, X, Calendar, Settings2, Users } from "lucide-react";
import { Period } from "../types/TimePeriodTypes";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { weekDays } from "../types/TimePeriodTypes";
import { Separator } from "@/components/ui/separator";

interface TimePeriodConfigurationReadOnlyProps {
  configName: string;
  onClose: () => void;
  periods: Period[];
  selectedDays: string[];
  isWeeklyMode: boolean;
  daySpecificPeriods: Record<string, Period[]>;
}

const PeriodDisplay = ({ period }: { period: Period }) => (
  <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors">
    <div className="flex items-center gap-3">
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-medium text-sm">
        {period.number}
      </div>
      <div>
        <span className="font-medium text-sm">
          {period.type === 'period' ? `Period ${period.number}` : period.label}
        </span>
        {period.type === 'break' && (
          <Badge variant="secondary" className="ml-2 text-xs">Break</Badge>
        )}
      </div>
    </div>
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Clock className="h-4 w-4" />
      <span className="font-mono">{period.startTime}</span>
      <span>—</span>
      <span className="font-mono">{period.endTime}</span>
    </div>
  </div>
);

const ConfigurationStats = ({ periods, selectedDays, isWeeklyMode }: { 
  periods: Period[], 
  selectedDays: string[], 
  isWeeklyMode: boolean 
}) => {
  const totalPeriods = periods.filter(p => p.type === 'period').length;
  const totalBreaks = periods.filter(p => p.type === 'break').length;
  const schoolDays = selectedDays.length;
  
  return (
    <div className="grid grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
      <div className="text-center">
        <div className="text-2xl font-bold text-primary">{totalPeriods}</div>
        <div className="text-sm text-muted-foreground">Total Periods</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-primary">{totalBreaks}</div>
        <div className="text-sm text-muted-foreground">Breaks</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-primary">{schoolDays}</div>
        <div className="text-sm text-muted-foreground">School Days</div>
      </div>
    </div>
  );
};

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

  // Calculate time range
  const startTime = periods.length > 0 ? periods[0].startTime : 'N/A';
  const endTime = periods.length > 0 ? periods[periods.length - 1].endTime : 'N/A';

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xl font-semibold">{configName}</div>
              <div className="text-sm text-muted-foreground font-normal">
                {isWeeklyMode ? 'Weekly Schedule' : 'Fortnightly Schedule'} • {startTime} - {endTime}
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardTitle>
        <CardDescription>
          Detailed view of the timetable configuration with all periods and timings
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Configuration Overview */}
        <ConfigurationStats 
          periods={periods} 
          selectedDays={selectedDays} 
          isWeeklyMode={isWeeklyMode} 
        />

        {/* School Days */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <Label className="text-base font-medium">School Days</Label>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedDays.map(dayId => {
              const day = daysToShow.find(d => d.id === dayId);
              return (
                <Badge key={dayId} variant="outline" className="px-3 py-1">
                  {day?.fullName || dayId}
                </Badge>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* Default Periods */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-primary" />
            <Label className="text-base font-medium">Period Schedule</Label>
          </div>
          {periods.length > 0 ? (
            <div className="space-y-2">
              {periods.map(period => (
                <PeriodDisplay key={period.id} period={period} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No periods configured</p>
            </div>
          )}
        </div>

        {/* Day-Specific Periods */}
        {Object.keys(daySpecificPeriods).length > 0 && (
          <>
            <Separator />
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <Label className="text-base font-medium">Day-Specific Schedules</Label>
              </div>
              <div className="space-y-4">
                {Object.entries(daySpecificPeriods).map(([dayId, dayPeriods]) => {
                  const day = daysToShow.find(d => d.id === dayId);
                  return (
                    <div key={dayId} className="space-y-3 p-4 border rounded-lg bg-muted/20">
                      <div className="flex items-center gap-2">
                        <Badge variant="default" className="font-medium">
                          {day?.fullName || dayId}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {dayPeriods.length} periods
                        </span>
                      </div>
                      <div className="space-y-2 ml-4">
                        {dayPeriods.map(period => (
                          <PeriodDisplay key={period.id} period={period} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
