
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useBatchManagement } from '@/hooks/useBatchManagement';
import { attendanceService } from '@/services/attendanceService';
import { AttendanceConfiguration, Student, PeriodSlot, AttendanceEntry as AttendanceEntryType, AttendanceStatus } from '@/types/attendance';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Users, Clock, CheckCircle, XCircle, AlertTriangle, Loader2, Save, RotateCcw } from 'lucide-react';
import DailyAttendanceGrid from './DailyAttendanceGrid';
import PeriodAttendanceGrid from './PeriodAttendanceGrid';
import SessionAttendanceGrid from './SessionAttendanceGrid';

const AttendanceEntry = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const { activeBatches, isLoading: batchesLoading } = useBatchManagement();
  
  const [selectedBatch, setSelectedBatch] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [attendanceEntries, setAttendanceEntries] = useState<AttendanceEntryType[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const schoolId = profile?.school_id || '';

  // Fetch attendance configuration for selected batch
  const { data: configuration, isLoading: configLoading } = useQuery({
    queryKey: ['attendanceConfiguration', selectedBatch],
    queryFn: () => attendanceService.getAttendanceConfiguration(selectedBatch),
    enabled: !!selectedBatch
  });

  // Fetch students for selected batch
  const { data: students, isLoading: studentsLoading } = useQuery({
    queryKey: ['batchStudents', selectedBatch],
    queryFn: () => attendanceService.getStudentsByBatch(selectedBatch),
    enabled: !!selectedBatch
  });

  // Fetch available days for the batch
  const { data: availableDays } = useQuery({
    queryKey: ['availableDays', selectedBatch],
    queryFn: () => attendanceService.getAvailableDays(selectedBatch),
    enabled: !!selectedBatch && configuration?.attendance_mode === 'period'
  });

  // Fetch period grid for period-wise attendance
  const { data: periodSlots, isLoading: periodsLoading } = useQuery({
    queryKey: ['periodGrid', selectedBatch, selectedDate],
    queryFn: () => attendanceService.getPeriodGrid(selectedBatch, selectedDate),
    enabled: !!selectedBatch && !!selectedDate && configuration?.attendance_mode === 'period'
  });

  // Save attendance mutation
  const saveAttendanceMutation = useMutation({
    mutationFn: (entries: AttendanceEntryType[]) => {
      // Convert AttendanceEntry to AttendanceRecord format
      const attendanceRecords = entries.map(entry => ({
        id: crypto.randomUUID(),
        batch_id: selectedBatch,
        student_id: entry.student_id,
        date: entry.date,
        mode: configuration?.attendance_mode || 'daily', // Include current mode
        period_number: entry.period_number !== undefined ? entry.period_number : null, // Convert undefined to null
        session: entry.session !== undefined ? entry.session : null, // Convert undefined to null
        status: entry.status,
        remarks: entry.remarks,
        school_id: schoolId, // Add school_id
        marked_by: '',
        marked_at: new Date().toISOString()
      }));
      
      // Debug logging to see what's being sent
      // Filter out invalid records for session mode
      const validRecords = attendanceRecords.filter(record => {
        if (record.mode === 'session') {
          // For session mode, session must not be null/undefined
          const isValid = record.session !== null && record.session !== undefined;
          if (!isValid) {
            console.warn('Filtering out invalid session record:', record);
          }
          return isValid;
        }
        return true; // Valid for other modes
      });

      console.log('=== ATTENDANCE SAVE DEBUG ===');
      console.log('Configuration mode:', configuration?.attendance_mode);
      console.log('Original records:', attendanceRecords.length);
      console.log('Valid records after filtering:', validRecords.length);
      console.log('Valid records to save:', validRecords);
      validRecords.forEach((record, index) => {
        const passesConstraint = record.mode === 'session' ? 
          (record.period_number === null && record.session !== null && record.session !== undefined) : 
          true;
        console.log(`Record ${index + 1}:`, {
          mode: record.mode,
          period_number: record.period_number,
          session: record.session,
          passes_constraint: passesConstraint
        });
      });
      console.log('===========================');
      
      if (validRecords.length === 0) {
        throw new Error('No valid attendance records to save. Please mark attendance with proper session data.');
      }
      
      return attendanceService.saveAttendance(validRecords);
    },
    onSuccess: (result) => {
      toast({
        title: 'Attendance Saved',
        description: result.message
      });
      setHasUnsavedChanges(false);
    },
    onError: (error) => {
      console.error('Save attendance mutation error:', error);
      toast({
        title: 'Save Failed',
        description: `Failed to save attendance: ${error.message || 'Unknown error'}. Changes are stored offline.`,
        variant: 'destructive'
      });
    }
  });

  // Load saved attendance from localStorage on component mount
  useEffect(() => {
    const loadSavedAttendance = () => {
      const savedData = localStorage.getItem(`attendance_${selectedBatch}_${selectedDate}`);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        console.log('Loading attendance from localStorage:', parsedData);
        
        // Validate and filter out invalid entries for session mode
        if (configuration?.attendance_mode === 'session') {
          const validEntries = parsedData.filter((entry: any) => entry.session);
          const invalidEntries = parsedData.filter((entry: any) => !entry.session);
          
          if (invalidEntries.length > 0) {
            console.warn('Filtering out invalid cached entries without session data:', invalidEntries);
            toast({
              title: 'Cached Data Cleaned',
              description: `Removed ${invalidEntries.length} invalid cached attendance entries.`,
              variant: 'default'
            });
          }
          
          setAttendanceEntries(validEntries);
        } else {
          setAttendanceEntries(parsedData);
        }
      } else {
        setAttendanceEntries([]);
      }
    };

    if (selectedBatch && selectedDate) {
      loadSavedAttendance();
    }
  }, [selectedBatch, selectedDate]);

  // Auto-save to localStorage when entries change
  useEffect(() => {
    if (attendanceEntries.length > 0) {
      localStorage.setItem(
        `attendance_${selectedBatch}_${selectedDate}`,
        JSON.stringify(attendanceEntries)
      );
      setHasUnsavedChanges(true);
    }
  }, [attendanceEntries, selectedBatch, selectedDate]);

  const handleAttendanceChange = (studentId: string, status: AttendanceStatus, periodNumber?: number, session?: 'morning' | 'afternoon', remarks?: string) => {
    setAttendanceEntries(prev => {
      const existingIndex = prev.findIndex(entry => 
        entry.student_id === studentId && 
        entry.period_number === periodNumber &&
        entry.session === session
      );

      const newEntry: AttendanceEntryType = {
        student_id: studentId,
        date: selectedDate,
        period_number: periodNumber,
        session: session,
        status,
        remarks
      };

      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = newEntry;
        return updated;
      } else {
        return [...prev, newEntry];
      }
    });
  };

  const handleBulkAction = (action: 'present' | 'clear') => {
    if (!students) return;

    if (action === 'clear') {
      setAttendanceEntries([]);
      localStorage.removeItem(`attendance_${selectedBatch}_${selectedDate}`);
      setHasUnsavedChanges(false);
      return;
    }

    // Mark all present based on attendance mode
    const newEntries: AttendanceEntryType[] = [];

    students.forEach(student => {
      if (configuration?.attendance_mode === 'period' && periodSlots) {
        periodSlots.forEach(period => {
          newEntries.push({
            student_id: student.id,
            date: selectedDate,
            period_number: period.period_number,
            status: 'present'
          });
        });
      } else if (configuration?.attendance_mode === 'session') {
        ['morning', 'afternoon'].forEach(session => {
          newEntries.push({
            student_id: student.id,
            date: selectedDate,
            session: session as 'morning' | 'afternoon',
            status: 'present'
          });
        });
      } else {
        newEntries.push({
          student_id: student.id,
          date: selectedDate,
          status: 'present'
        });
      }
    });

    setAttendanceEntries(newEntries);
  };

  const handleSave = () => {
    if (attendanceEntries.length === 0) {
      toast({
        title: 'No Data',
        description: 'No attendance data to save.',
        variant: 'destructive'
      });
      return;
    }

    // For session mode, validate that entries have session data
    if (configuration?.attendance_mode === 'session') {
      const invalidEntries = attendanceEntries.filter(entry => !entry.session);
      if (invalidEntries.length > 0) {
        console.warn('Found attendance entries without session data:', invalidEntries);
        toast({
          title: 'Invalid Session Data',
          description: `${invalidEntries.length} attendance entries are missing session information. They will be filtered out.`,
          variant: 'destructive'
        });
      }
    }

    saveAttendanceMutation.mutate(attendanceEntries);
  };

  const getAttendanceStats = () => {
    if (!students || attendanceEntries.length === 0) {
      return { present: 0, absent: 0, late: 0, leave: 0, total: students?.length || 0 };
    }

    const stats = { present: 0, absent: 0, late: 0, leave: 0, total: students.length };

    students.forEach(student => {
      const studentEntries = attendanceEntries.filter(entry => entry.student_id === student.id);
      
      if (studentEntries.length === 0) {
        stats.absent++;
      } else {
        // For daily mode, check single entry
        if (configuration?.attendance_mode === 'daily') {
          const entry = studentEntries[0];
          stats[entry.status]++;
        } else {
          // For period/session mode, check if student has any present entries
          const hasPresent = studentEntries.some(entry => entry.status === 'present');
          if (hasPresent) {
            stats.present++;
          } else {
            stats.absent++;
          }
        }
      }
    });

    return stats;
  };

  const stats = getAttendanceStats();

  if (batchesLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading batches...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Selection Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="batch">Select Batch</Label>
          <Select value={selectedBatch} onValueChange={setSelectedBatch}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a batch..." />
            </SelectTrigger>
            <SelectContent>
              {activeBatches.map((batch) => (
                <SelectItem key={batch.id} value={batch.id}>
                  {batch.name} - {batch.course.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
          />
        </div>
      </div>

      {selectedBatch && (
        <>
          {/* Configuration Status */}
          {configLoading ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading configuration...</span>
            </div>
          ) : !configuration ? (
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  <div>
                    <h3 className="font-semibold text-orange-800">No Configuration Found</h3>
                    <p className="text-orange-700">
                      No attendance configuration found for this batch. Please contact admin to set up attendance mode.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Stats and Actions */}
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex flex-wrap gap-4">
                  <Badge variant="outline" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    {stats.total} Students
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-2 text-green-700 border-green-200">
                    <CheckCircle className="h-4 w-4" />
                    {stats.present} Present
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-2 text-red-700 border-red-200">
                    <XCircle className="h-4 w-4" />
                    {stats.absent} Absent
                  </Badge>
                  {stats.late > 0 && (
                    <Badge variant="outline" className="flex items-center gap-2 text-yellow-700 border-yellow-200">
                      <Clock className="h-4 w-4" />
                      {stats.late} Late
                    </Badge>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleBulkAction('present')}>
                    Mark All Present
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleBulkAction('clear')}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Clear All
                  </Button>
                  <Button 
                    onClick={handleSave}
                    disabled={!hasUnsavedChanges || saveAttendanceMutation.isPending}
                    className="flex items-center gap-2"
                  >
                    {saveAttendanceMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Save Attendance
                  </Button>
                </div>
              </div>

              {/* Attendance Grid */}
              {studentsLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2">Loading students...</span>
                </div>
              ) : !students || students.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Students Found</h3>
                      <p className="text-muted-foreground">
                        No students are enrolled in this batch.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Attendance - {configuration.attendance_mode === 'daily' ? 'Daily Mode' : 
                        configuration.attendance_mode === 'period' ? 'Period-wise Mode' : 'Session Mode'}
                    </CardTitle>
                    <CardDescription>
                      Mark attendance for {students.length} students on {selectedDate}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {configuration.attendance_mode === 'daily' && (
                      <DailyAttendanceGrid
                        students={students}
                        attendanceEntries={attendanceEntries}
                        onAttendanceChange={handleAttendanceChange}
                      />
                    )}
                    
                    {configuration.attendance_mode === 'period' && (
                      <PeriodAttendanceGrid
                        students={students}
                        periodSlots={periodSlots || []}
                        attendanceEntries={attendanceEntries}
                        onAttendanceChange={handleAttendanceChange}
                        isLoadingPeriods={periodsLoading}
                        selectedDate={selectedDate}
                        availableDays={availableDays || []}
                      />
                    )}
                    
                    {configuration.attendance_mode === 'session' && (
                      <SessionAttendanceGrid
                        students={students}
                        attendanceEntries={attendanceEntries}
                        onAttendanceChange={handleAttendanceChange}
                      />
                    )}
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default AttendanceEntry;
