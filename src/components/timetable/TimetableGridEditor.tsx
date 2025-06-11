import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Edit, Trash2, Plus, AlertTriangle, CheckCircle, Save, Calendar } from "lucide-react";
import { AcademicYearSelector } from "./components/AcademicYearSelector";
import { useAcademicYearSelector } from "@/hooks/useAcademicYearSelector";
import { useTimetableSchedules, CreateScheduleData } from "@/hooks/useTimetableSchedules";
import { useSpecialClasses } from "@/hooks/useSpecialClasses";
import { useHolidays } from "@/hooks/useHolidays";
import { useBatches } from "@/hooks/useBatches";
import { useSubjects } from "@/hooks/useSubjects";
import { useTeachersFromStaff } from "@/hooks/useTeachersFromStaff";
import { useRooms } from "@/hooks/useRooms";
import { useBatchTimetableConfiguration } from "@/hooks/useBatchTimetableConfiguration";
import { useTimetableConfiguration } from "@/hooks/useTimetableConfiguration";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";

interface TimetableGridEditorProps {
  selectedClass: string;
  selectedTerm: string;
}

export const TimetableGridEditor = ({ selectedClass, selectedTerm }: TimetableGridEditorProps) => {
  const { profile } = useAuth();
  const { 
    academicYears, 
    selectedAcademicYear, 
    setSelectedAcademicYear, 
    selectedYear,
    isLoading: academicYearLoading 
  } = useAcademicYearSelector();

  // Fetch batches for the selected academic year
  const { batches, isLoading: batchesLoading } = useBatches(selectedYear?.id, undefined);
  const { subjects } = useSubjects(profile?.school_id || '');
  const { teachers } = useTeachersFromStaff(profile?.school_id || '');
  const { rooms } = useRooms(profile?.school_id || '');
  
  // Use the new batch timetable configuration hook
  const {
    getAllPeriods,
    getSelectedDays,
    isBreakTime,
    getBreakInfo,
    isLoading: configLoading
  } = useBatchTimetableConfiguration(profile?.school_id || '', selectedYear?.id);

  // Add the timetable configuration hook to get day-specific periods
  const { getTimetableConfigurations } = useTimetableConfiguration();
  
  const [selectedBatch, setSelectedBatch] = useState<string>('');
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ day: string; period: number } | null>(null);
  const [newSchedule, setNewSchedule] = useState<Partial<CreateScheduleData>>({});
  const [batchConfiguration, setBatchConfiguration] = useState<any>(null);

  const {
    schedules,
    isLoading: schedulesLoading,
    fetchSchedules,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    getScheduleByBatchAndDay
  } = useTimetableSchedules(profile?.school_id || '', selectedYear?.id);

  const { specialClasses, fetchSpecialClasses } = useSpecialClasses(profile?.school_id || '');
  const { holidays, fetchHolidays } = useHolidays(profile?.school_id || '');

  // Get dynamic periods and selected days based on selected batch
  const allPeriods = selectedBatch ? getAllPeriods(selectedBatch) : [];
  const selectedDays = selectedBatch ? getSelectedDays(selectedBatch) : [];
  // Filter out breaks to get only class periods for time slots
  const timeSlots = allPeriods.filter(p => p.type === 'class');

  // Fetch batch-specific configuration when batch is selected
  useEffect(() => {
    const fetchBatchConfiguration = async () => {
      if (selectedBatch && selectedYear?.id && profile?.school_id) {
        try {
          const configs = await getTimetableConfigurations(profile.school_id, selectedYear.id);
          
          // Find configuration for this batch (either specific mapping or default)
          const batchConfig = configs.find(config => 
            config.batchIds?.includes(selectedBatch) || config.isDefault
          );
          
          if (batchConfig) {
            console.log('Raw config data:', batchConfig);
            console.log('Is weekly config:', batchConfig.isWeeklyMode);
            console.log('Has flexible timings:', batchConfig.enableFlexibleTimings);
            console.log('Day specific periods:', batchConfig.daySpecificPeriods);
            console.log('Default periods:', batchConfig.defaultPeriods);
            setBatchConfiguration(batchConfig);
          }
        } catch (error) {
          console.error('Error fetching batch configuration:', error);
        }
      }
    };

    fetchBatchConfiguration();
  }, [selectedBatch, selectedYear?.id, profile?.school_id, getTimetableConfigurations]);

  // Memoize the periods for each day to prevent infinite loops
  const dayPeriodsMap = useMemo(() => {
    if (!batchConfiguration || !selectedDays.length) {
      console.log('No batch configuration or selected days available, using fallback');
      return {};
    }

    const { daySpecificPeriods, defaultPeriods, enableFlexibleTimings } = batchConfiguration;
    const periodsMap: Record<string, any[]> = {};

    selectedDays.forEach(dayId => {
      console.log(`Computing periods for ${dayId}`);
      
      // If flexible timings are enabled and this day has specific periods, use them
      if (enableFlexibleTimings && daySpecificPeriods && daySpecificPeriods[dayId]) {
        console.log(`Using day-specific periods for ${dayId}:`, daySpecificPeriods[dayId]);
        // Transform the periods to match the expected format
        periodsMap[dayId] = daySpecificPeriods[dayId].map((period: any) => ({
          number: period.number,
          start: period.startTime,
          end: period.endTime,
          type: period.type || 'class',
          label: period.label
        }));
      }
      // If we have default periods, use them
      else if (defaultPeriods && defaultPeriods.length > 0) {
        console.log(`Using default periods for ${dayId}:`, defaultPeriods);
        // Transform the periods to match the expected format
        periodsMap[dayId] = defaultPeriods.map((period: any) => ({
          number: period.number,
          start: period.startTime,
          end: period.endTime,
          type: period.type || 'class',
          label: period.label
        }));
      }
      // Otherwise fall back to the general periods from the hook
      else {
        console.log(`Using fallback periods for ${dayId}:`, allPeriods);
        periodsMap[dayId] = allPeriods;
      }
    });

    return periodsMap;
  }, [batchConfiguration, selectedDays, allPeriods]);

  // Function to get periods for a specific day using memoized data
  const getPeriodsForDay = (dayId: string) => {
    return dayPeriodsMap[dayId] || allPeriods;
  };

  useEffect(() => {
    if (selectedBatch && selectedYear?.id) {
      fetchSchedules(selectedBatch);
      fetchSpecialClasses();
      fetchHolidays(new Date().getFullYear());
    }
  }, [selectedBatch, selectedYear?.id, fetchSchedules, fetchSpecialClasses, fetchHolidays]);

  // Reset selected batch when academic year changes
  useEffect(() => {
    setSelectedBatch('');
  }, [selectedYear?.id]);

  const handleAddSchedule = (day: string, period: number) => {
    setSelectedSlot({ day, period });
    setNewSchedule({
      school_id: profile?.school_id || '',
      academic_year_id: selectedYear?.id || '',
      batch_id: selectedBatch,
      day_of_week: day,
      period_number: period,
      valid_from: new Date().toISOString().split('T')[0]
    });
    setScheduleDialogOpen(true);
  };

  const handleSaveSchedule = async () => {
    if (!newSchedule.subject_id || !newSchedule.teacher_id) {
      toast({
        title: 'Validation Error',
        description: 'Please select both subject and teacher',
        variant: 'destructive'
      });
      return;
    }

    // Get the time slot from the specific day's periods
    const dayPeriods = getPeriodsForDay(newSchedule.day_of_week || '');
    const timeSlot = dayPeriods.find(p => p.number === newSchedule.period_number && p.type === 'class');
    
    if (!timeSlot) {
      toast({
        title: 'Error',
        description: 'Could not find time slot information',
        variant: 'destructive'
      });
      return;
    }

    const scheduleData: CreateScheduleData = {
      ...newSchedule as CreateScheduleData,
      start_time: timeSlot.start,
      end_time: timeSlot.end
    };

    const result = await createSchedule(scheduleData);
    if (result) {
      setScheduleDialogOpen(false);
      setNewSchedule({});
      setSelectedSlot(null);
    }
  };

  const getScheduleForSlot = (day: string, period: number) => {
    const daySchedules = getScheduleByBatchAndDay(selectedBatch, day);
    return daySchedules.find(s => s.period_number === period);
  };

  const getSubjectColor = (subjectId: string) => {
    const colors = [
      "bg-blue-100 text-blue-800",
      "bg-green-100 text-green-800", 
      "bg-purple-100 text-purple-800",
      "bg-orange-100 text-orange-800",
      "bg-red-100 text-red-800",
      "bg-pink-100 text-pink-800",
      "bg-indigo-100 text-indigo-800",
      "bg-yellow-100 text-yellow-800"
    ];
    const index = parseInt(subjectId.slice(-1), 16) % colors.length;
    return colors[index];
  };

  // Get unique period numbers across all days for rendering the grid
  const allPeriodNumbers = useMemo(() => {
    const periodNumbers = new Set<number>();
    selectedDays.forEach(day => {
      const dayPeriods = getPeriodsForDay(day);
      dayPeriods.forEach(p => periodNumbers.add(p.number));
    });
    return Array.from(periodNumbers).sort((a, b) => a - b);
  }, [selectedDays, dayPeriodsMap]);

  // Show loading state
  if (academicYearLoading || batchesLoading || configLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-muted-foreground">Loading academic year and batches...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show message if no academic year is selected
  if (!selectedYear) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Please select an academic year to view and edit timetables.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Show message if no batches are available
  if (!batches || batches.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
            <h3 className="text-lg font-semibold mb-2">No Batches Available</h3>
            <p className="text-muted-foreground mb-4">
              No batches found for the selected academic year "{selectedYear.name}".
            </p>
            <p className="text-sm text-muted-foreground">
              Please create batches in the Academic section before setting up timetables.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!selectedBatch) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Select a Batch</h3>
            <p className="text-muted-foreground mb-4">
              Choose a batch to edit timetable for {selectedYear.name}
            </p>
            <Select value={selectedBatch} onValueChange={setSelectedBatch}>
              <SelectTrigger className="w-64 mx-auto">
                <SelectValue placeholder="Choose a batch to edit timetable" />
              </SelectTrigger>
              <SelectContent>
                {batches.map((batch) => (
                  <SelectItem key={batch.id} value={batch.id}>
                    {batch.name} {batch.course?.name && `- ${batch.course.name}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                Timetable Grid Editor
                <Badge variant="outline" className="ml-2">{selectedTerm}</Badge>
              </div>
              <AcademicYearSelector
                academicYears={academicYears}
                selectedAcademicYear={selectedAcademicYear}
                onAcademicYearChange={setSelectedAcademicYear}
                isLoading={academicYearLoading}
              />
              <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select batch" />
                </SelectTrigger>
                <SelectContent>
                  {batches.map((batch) => (
                    <SelectItem key={batch.id} value={batch.id}>
                      {batch.name} {batch.course?.name && `- ${batch.course.name}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Copy className="h-4 w-4 mr-2" />
                Copy Schedule
              </Button>
              <Button variant="outline" size="sm">
                <Save className="h-4 w-4 mr-2" />
                Save Template
              </Button>
            </div>
          </CardTitle>
          <CardDescription>
            Create and manage the weekly schedule for {batches.find(b => b.id === selectedBatch)?.name} in {selectedYear?.name || 'the selected academic year'}.
            <br />
            <span className="text-sm text-muted-foreground">
              Configured days: {selectedDays.map(day => day.charAt(0).toUpperCase() + day.slice(1)).join(', ')}
            </span>
            {batchConfiguration?.enableFlexibleTimings && (
              <span className="text-sm text-blue-600 ml-2">
                • Day-specific timings enabled
              </span>
            )}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Timetable Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Weekly Schedule Grid
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm text-muted-foreground">
                {schedules.filter(s => s.batch_id === selectedBatch).length} periods assigned
              </span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200">
              <thead>
                <tr>
                  <th className="border border-gray-200 p-3 bg-gray-50 w-32 text-left">Time</th>
                  {selectedDays.map((day) => (
                    <th key={day} className="border border-gray-200 p-3 bg-gray-50 min-w-48 text-left capitalize">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allPeriodNumbers.map((periodNumber) => {
                  return (
                    <tr key={periodNumber}>
                      <td className="border border-gray-200 p-3 font-medium text-sm bg-gray-50">
                        <div>Period {Math.floor(periodNumber)}</div>
                      </td>
                      {selectedDays.map((day) => {
                        const dayPeriods = getPeriodsForDay(day);
                        const period = dayPeriods.find(p => p.number === periodNumber);
                        const schedule = getScheduleForSlot(day, periodNumber);
                        
                        if (!period) {
                          return (
                            <td key={`${day}-${periodNumber}`} className="border border-gray-200 p-1">
                              <div className="h-20 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-xs">
                                No Period
                              </div>
                            </td>
                          );
                        }

                        const isBreak = period.type === 'break';
                        
                        return (
                          <td key={`${day}-${periodNumber}`} className="border border-gray-200 p-1">
                            {isBreak ? (
                              <div className={`h-20 flex items-center justify-center rounded text-sm ${
                                period.label?.toLowerCase().includes('lunch') ? 'bg-orange-50 text-orange-700' : 
                                period.label?.toLowerCase().includes('morning') ? 'bg-yellow-50 text-yellow-700' : 
                                'bg-blue-50 text-blue-700'
                              }`}>
                                <div className="text-center">
                                  <div className="font-medium">{period.label}</div>
                                  <div className="text-xs">{period.start} - {period.end}</div>
                                </div>
                              </div>
                            ) : schedule ? (
                              <div className={`h-20 p-2 rounded ${getSubjectColor(schedule.subject_id)} relative group`}>
                                <div className="font-semibold text-xs">{schedule.subject?.name}</div>
                                <div className="text-xs opacity-80">{schedule.teacher?.first_name} {schedule.teacher?.last_name}</div>
                                <div className="text-xs opacity-60">{period.start} - {period.end}</div>
                                {schedule.room && (
                                  <div className="text-xs opacity-60">{schedule.room.name}</div>
                                )}
                                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={() => deleteSchedule(schedule.id)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div 
                                className="h-20 border-2 border-dashed border-gray-200 rounded hover:border-gray-400 hover:bg-gray-50 cursor-pointer flex flex-col items-center justify-center transition-colors"
                                onClick={() => handleAddSchedule(day, periodNumber)}
                              >
                                <Plus className="h-6 w-6 text-gray-400 mb-1" />
                                <div className="text-xs text-gray-500">{period.start} - {period.end}</div>
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add Schedule Dialog */}
      <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Schedule</DialogTitle>
            <DialogDescription>
              Add a new class to {selectedSlot?.day} period {selectedSlot?.period}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Subject</Label>
              <Select
                value={newSchedule.subject_id || ''}
                onValueChange={(value) => setNewSchedule(prev => ({ ...prev, subject_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name} ({subject.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Teacher</Label>
              <Select
                value={newSchedule.teacher_id || ''}
                onValueChange={(value) => setNewSchedule(prev => ({ ...prev, teacher_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select teacher" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher.profile_id || teacher.id} value={teacher.profile_id || teacher.id}>
                      {teacher.first_name} {teacher.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Room (Optional)</Label>
              <Select
                value={newSchedule.room_id || ''}
                onValueChange={(value) => setNewSchedule(prev => ({ ...prev, room_id: value || undefined }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select room" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no-room">No room assigned</SelectItem>
                  {rooms.map((room) => (
                    <SelectItem key={room.id} value={room.id}>
                      {room.name} {room.code && `(${room.code})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setScheduleDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveSchedule}>
                Add Schedule
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Total Periods</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {selectedDays.reduce((total, day) => {
                const dayPeriods = getPeriodsForDay(day);
                return total + dayPeriods.filter(p => p.type === 'class').length;
              }, 0)}
            </div>
            <p className="text-xs text-muted-foreground">per week</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Assigned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {schedules.filter(s => s.batch_id === selectedBatch).length}
            </div>
            <p className="text-xs text-muted-foreground">periods filled</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Free Periods</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {selectedDays.reduce((total, day) => {
                const dayPeriods = getPeriodsForDay(day);
                return total + dayPeriods.filter(p => p.type === 'class').length;
              }, 0) - schedules.filter(s => s.batch_id === selectedBatch).length}
            </div>
            <p className="text-xs text-muted-foreground">remaining</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Special Classes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {specialClasses.filter(sc => sc.batch_ids.includes(selectedBatch)).length}
            </div>
            <p className="text-xs text-muted-foreground">this month</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TimetableGridEditor;

}
