
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, X, Calendar, Settings2, Users, Grid3X3 } from "lucide-react";
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

const ConfigurationStats = ({ periods, selectedDays, isWeeklyMode, daySpecificPeriods }: { 
  periods: Period[], 
  selectedDays: string[], 
  isWeeklyMode: boolean,
  daySpecificPeriods: Record<string, Period[]>
}) => {
  const hasFlexibleTimings = Object.keys(daySpecificPeriods).length > 0;
  
  // Calculate statistics based on mode and flexible timings
  let totalPeriods = 0;
  let totalBreaks = 0;
  let schoolDays = selectedDays.length;
  
  if (hasFlexibleTimings) {
    // For flexible timings, find max periods and breaks across all days
    const allDayPeriods = Object.values(daySpecificPeriods);
    totalPeriods = Math.max(...allDayPeriods.map(p => p.filter(period => period.type === 'period').length));
    totalBreaks = Math.max(...allDayPeriods.map(p => p.filter(period => period.type === 'break').length));
  } else {
    // For uniform timings, count from default periods
    totalPeriods = periods.filter(p => p.type === 'period').length;
    totalBreaks = periods.filter(p => p.type === 'break').length;
  }

  // For fortnightly mode, show actual unique school days
  if (!isWeeklyMode) {
    const uniqueDays = new Set();
    selectedDays.forEach(dayId => {
      if (dayId.includes('-')) {
        const dayPart = dayId.split('-')[1];
        uniqueDays.add(dayPart);
      } else {
        uniqueDays.add(dayId);
      }
    });
    schoolDays = uniqueDays.size;
  }
  
  return (
    <div className="grid grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
      <div className="text-center">
        <div className="text-2xl font-bold text-primary">{totalPeriods}</div>
        <div className="text-sm text-muted-foreground">
          {hasFlexibleTimings ? 'Max Periods' : 'Periods/Day'}
        </div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-primary">{totalBreaks}</div>
        <div className="text-sm text-muted-foreground">
          {hasFlexibleTimings ? 'Max Breaks' : 'Breaks/Day'}
        </div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-primary">{schoolDays}</div>
        <div className="text-sm text-muted-foreground">
          {isWeeklyMode ? 'School Days' : 'Unique Days'}
        </div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-primary">
          {isWeeklyMode ? 'Weekly' : 'Fortnightly'}
        </div>
        <div className="text-sm text-muted-foreground">Schedule Type</div>
      </div>
    </div>
  );
};

// Helper function to convert time string to minutes for comparison
const timeToMinutes = (timeString: string): number => {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
};

// Helper function to convert minutes back to time string
const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
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

  const hasFlexibleTimings = Object.keys(daySpecificPeriods).length > 0;

  // Calculate time range with proper time string comparison
  const allPeriods = hasFlexibleTimings 
    ? Object.values(daySpecificPeriods).flat()
    : periods;
  
  let startTime = 'N/A';
  let endTime = 'N/A';
  
  if (allPeriods.length > 0) {
    const timeInMinutes = allPeriods.map(p => ({
      start: timeToMinutes(p.startTime),
      end: timeToMinutes(p.endTime)
    }));
    
    const earliestStart = Math.min(...timeInMinutes.map(t => t.start));
    const latestEnd = Math.max(...timeInMinutes.map(t => t.end));
    
    startTime = minutesToTime(earliestStart);
    endTime = minutesToTime(latestEnd);
  }

  return (
    <Card className="w-full max-w-6xl mx-auto">
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
                {hasFlexibleTimings && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    Flexible Timings
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardTitle>
        <CardDescription>
          {isWeeklyMode 
            ? "Weekly timetable configuration with consistent schedule every week"
            : "Fortnightly timetable configuration with 2-week rotating schedule"
          }
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Configuration Overview */}
        <ConfigurationStats 
          periods={periods} 
          selectedDays={selectedDays} 
          isWeeklyMode={isWeeklyMode}
          daySpecificPeriods={daySpecificPeriods}
        />

        {/* School Days */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <Label className="text-base font-medium">
              {isWeeklyMode ? 'Weekly School Days' : 'Fortnightly Schedule Days'}
            </Label>
          </div>
          
          {isWeeklyMode ? (
            // Weekly mode - simple day display
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
          ) : (
            // Fortnightly mode - grouped by week
            <div className="space-y-4">
              {[1, 2].map(week => {
                const weekDays = selectedDays.filter(dayId => dayId.startsWith(`week${week}-`));
                if (weekDays.length === 0) return null;
                
                return (
                  <div key={week} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="default" className="text-xs">Week {week}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {weekDays.length} days scheduled
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 ml-4">
                      {weekDays.map(dayId => {
                        const day = daysToShow.find(d => d.id === dayId);
                        return (
                          <Badge key={dayId} variant="outline" className="px-2 py-1 text-xs">
                            {day?.fullName || dayId}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <Separator />

        {hasFlexibleTimings ? (
          /* Day-Specific Periods Layout */
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Grid3X3 className="h-5 w-5 text-primary" />
              <Label className="text-base font-medium">Day-Specific Schedules</Label>
              <Badge variant="secondary" className="text-xs">Different timings per day</Badge>
            </div>
            
            {isWeeklyMode ? (
              /* Weekly mode with flexible timings */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(daySpecificPeriods).map(([dayId, dayPeriods]) => {
                  const day = daysToShow.find(d => d.id === dayId);
                  return (
                    <div key={dayId} className="space-y-3 p-4 border rounded-lg bg-muted/20">
                      <div className="flex items-center justify-between">
                        <Badge variant="default" className="font-medium">
                          {day?.fullName || dayId}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {dayPeriods.length} periods
                        </span>
                      </div>
                      <div className="space-y-2">
                        {dayPeriods.map(period => (
                          <PeriodDisplay key={period.id} period={period} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Fortnightly mode with flexible timings */
              <div className="space-y-6">
                {[1, 2].map(week => {
                  const weekDays = Object.entries(daySpecificPeriods)
                    .filter(([dayId]) => dayId.startsWith(`week${week}-`));
                  
                  if (weekDays.length === 0) return null;
                  
                  return (
                    <div key={week} className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-medium">Week {week}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {weekDays.length} days with schedules
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {weekDays.map(([dayId, dayPeriods]) => {
                          const day = daysToShow.find(d => d.id === dayId);
                          const dayName = day?.fullName?.replace(`Week ${week} `, '') || dayId;
                          
                          return (
                            <div key={dayId} className="space-y-3 p-4 border rounded-lg bg-muted/20">
                              <div className="flex items-center justify-between">
                                <Badge variant="default" className="font-medium">
                                  {dayName}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                  {dayPeriods.length} periods
                                </span>
                              </div>
                              <div className="space-y-2">
                                {dayPeriods.map(period => (
                                  <PeriodDisplay key={period.id} period={period} />
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* Uniform Schedule Layout */
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Settings2 className="h-5 w-5 text-primary" />
              <Label className="text-base font-medium">Uniform Schedule</Label>
              <Badge variant="secondary" className="text-xs">
                Same timings for all {isWeeklyMode ? 'days' : 'selected days'}
              </Badge>
            </div>
            {periods.length > 0 ? (
              <div className="space-y-2 max-w-2xl">
                <p className="text-sm text-muted-foreground mb-4">
                  {isWeeklyMode 
                    ? "This schedule applies to all selected school days each week"
                    : "This schedule applies to all selected days in both weeks of the fortnight cycle"
                  }
                </p>
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
        )}
      </CardContent>
    </Card>
  );
};
