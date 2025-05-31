
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { 
  Clock, 
  Plus, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  Calendar,
  Settings2,
  Coffee,
  BookOpen
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface Period {
  id: string;
  number: number;
  startTime: string;
  endTime: string;
  type: 'period' | 'break';
  label?: string;
}

const weekDays = [
  { id: 'monday', label: 'Mon', fullName: 'Monday' },
  { id: 'tuesday', label: 'Tue', fullName: 'Tuesday' },
  { id: 'wednesday', label: 'Wed', fullName: 'Wednesday' },
  { id: 'thursday', label: 'Thu', fullName: 'Thursday' },
  { id: 'friday', label: 'Fri', fullName: 'Friday' },
  { id: 'saturday', label: 'Sat', fullName: 'Saturday' },
  { id: 'sunday', label: 'Sun', fullName: 'Sunday' }
];

export const TimePeriodConfiguration = () => {
  const [timetableName, setTimetableName] = useState("Greenfield High School 2024-2025");
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

  const handleTotalPeriodsChange = (value: string) => {
    const num = parseInt(value) || 0;
    if (num > 0 && num <= 12) {
      setTotalPeriods(num);
      // Regenerate periods list based on new total
      generatePeriods(num);
    }
  };

  const generatePeriods = (total: number) => {
    const newPeriods: Period[] = [];
    let currentTime = { hours: 8, minutes: 0 }; // Start at 8:00 AM
    
    for (let i = 1; i <= total; i++) {
      const startTime = `${currentTime.hours.toString().padStart(2, '0')}:${currentTime.minutes.toString().padStart(2, '0')}`;
      
      // Add 45 minutes for period duration
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

      // Add breaks after certain periods
      if (i === 3 || i === 5) {
        const breakStart = endTime;
        currentTime.minutes += 15; // 15 minute break
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
    
    // Calculate break end time (15 minutes after period end)
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

  const handleSaveConfiguration = () => {
    // Validation
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

    // Here you would save to backend
    console.log('Saving configuration:', {
      timetableName,
      totalPeriods,
      periods,
      selectedDays,
      isWeeklyMode
    });

    toast({
      title: "Configuration Saved",
      description: "Time & period configuration has been saved successfully"
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Time & Period Configuration
          </CardTitle>
          <CardDescription>
            Set up your school's daily schedule with periods, breaks, and working days
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Timetable Name */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Timetable Name</CardTitle>
          <CardDescription>
            Enter a descriptive name for this timetable configuration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="timetable-name">Timetable Label</Label>
            <Input
              id="timetable-name"
              value={timetableName}
              onChange={(e) => setTimetableName(e.target.value)}
              placeholder="e.g., Greenfield High School 2024-2025"
              className="max-w-md"
            />
          </div>
        </CardContent>
      </Card>

      {/* Period Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Period Configuration</CardTitle>
          <CardDescription>
            Define the total number of periods and configure their timings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="total-periods">Total Periods Per Day</Label>
            <Input
              id="total-periods"
              type="number"
              min="1"
              max="12"
              value={totalPeriods}
              onChange={(e) => handleTotalPeriodsChange(e.target.value)}
              className="w-24"
            />
          </div>

          <Collapsible open={isPeriodsExpanded} onOpenChange={setIsPeriodsExpanded}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Period & Break Timings
                </span>
                {isPeriodsExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 mt-4">
              <p className="text-sm text-muted-foreground">
                Set up your periods and breaks. The duration of periods will stay consistent.
              </p>
              
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {periods.map((period, index) => (
                  <div key={period.id} className={`flex items-center gap-3 p-3 rounded-lg border ${
                    period.type === 'break' ? 'bg-orange-50 border-orange-200' : 'bg-blue-50 border-blue-200'
                  }`}>
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {period.type === 'period' ? (
                        <>
                          <BookOpen className="h-4 w-4 text-blue-600" />
                          <span className="font-medium text-sm">Period {period.number}</span>
                        </>
                      ) : (
                        <>
                          <Coffee className="h-4 w-4 text-orange-600" />
                          <Input
                            value={period.label || ''}
                            onChange={(e) => updateBreakLabel(period.id, e.target.value)}
                            placeholder="Break name"
                            className="text-sm h-8 max-w-32"
                          />
                        </>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Input
                        type="time"
                        value={period.startTime}
                        onChange={(e) => updatePeriodTime(period.id, 'startTime', e.target.value)}
                        className="w-24 h-8 text-sm"
                      />
                      <span className="text-muted-foreground">to</span>
                      <Input
                        type="time"
                        value={period.endTime}
                        onChange={(e) => updatePeriodTime(period.id, 'endTime', e.target.value)}
                        className="w-24 h-8 text-sm"
                      />
                    </div>

                    <div className="flex gap-1">
                      {period.type === 'period' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => addBreakAfterPeriod(period.id)}
                          className="h-8 w-8 p-0"
                          title="Add break after this period"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      )}
                      
                      {period.type === 'break' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeBreak(period.id)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          title="Remove break"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>

      {/* Days Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Days Configuration</CardTitle>
          <CardDescription>
            Select which days of the week are school days
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Label>School Days</Label>
            <ToggleGroup 
              type="multiple" 
              value={selectedDays} 
              onValueChange={setSelectedDays}
              className="flex flex-wrap justify-start gap-2"
            >
              {weekDays.map((day) => (
                <ToggleGroupItem
                  key={day.id}
                  value={day.id}
                  aria-label={day.fullName}
                  className="flex-col h-16 w-16 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                >
                  <Calendar className="h-4 w-4 mb-1" />
                  <span className="text-xs">{day.label}</span>
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          <div className="flex flex-wrap gap-2">
            <div>
              <span className="text-sm font-medium">School Days: </span>
              {selectedDays.length > 0 ? (
                selectedDays.map(dayId => {
                  const day = weekDays.find(d => d.id === dayId);
                  return (
                    <Badge key={dayId} variant="default" className="mr-1">
                      {day?.fullName}
                    </Badge>
                  );
                })
              ) : (
                <Badge variant="secondary">None selected</Badge>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <div>
              <span className="text-sm font-medium">Days Off: </span>
              {weekDays
                .filter(day => !selectedDays.includes(day.id))
                .map(day => (
                  <Badge key={day.id} variant="outline" className="mr-1 text-muted-foreground">
                    {day.fullName}
                  </Badge>
                ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mode Selection & Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <Label htmlFor="timetable-mode" className="text-sm font-medium">
                Timetable Mode:
              </Label>
              <div className="flex items-center gap-2">
                <span className={`text-sm ${isWeeklyMode ? 'font-medium' : 'text-muted-foreground'}`}>
                  Weekly
                </span>
                <Switch
                  id="timetable-mode"
                  checked={!isWeeklyMode}
                  onCheckedChange={(checked) => setIsWeeklyMode(!checked)}
                />
                <span className={`text-sm ${!isWeeklyMode ? 'font-medium' : 'text-muted-foreground'}`}>
                  Fortnightly
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline">
                Save as Template
              </Button>
              <Button onClick={handleSaveConfiguration}>
                Save Configuration
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
