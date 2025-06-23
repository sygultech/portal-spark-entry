
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useBatchManagement } from '@/hooks/useBatchManagement';
import { attendanceService } from '@/services/attendanceService';
import { AttendanceConfiguration, Student, PeriodSlot, AttendanceEntry as AttendanceEntryType, AttendanceRecordInput, AttendanceStatus } from '@/types/attendance';
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
  const { profile, isLoading: profileLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { activeBatches, isLoading: batchesLoading } = useBatchManagement();
  
  const [selectedBatch, setSelectedBatch] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [attendanceEntries, setAttendanceEntries] = useState<AttendanceEntryType[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Wait for profile to load and ensure school_id is available
  const schoolId = profile?.school_id;
  if (!schoolId && !profileLoading) {
    console.error('No school_id found in profile:', profile);
  }

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

  // Fetch existing attendance records from database
  const { data: existingAttendanceRecords, isLoading: attendanceLoading } = useQuery({
    queryKey: ['attendanceRecords', selectedBatch, selectedDate],
    queryFn: () => attendanceService.getAttendanceRecords({
      batchId: selectedBatch,
      dateFrom: selectedDate,
      dateTo: selectedDate
    }),
    enabled: !!selectedBatch && !!selectedDate
  });

  // Save attendance mutation
  const saveAttendanceMutation = useMutation({
    mutationFn: (entries: AttendanceEntryType[]) => {
      // Ensure we have a valid school_id
      if (!schoolId) {
        throw new Error('No school ID available. Please try again.');
      }

      // Convert AttendanceEntry to AttendanceRecordInput format
      const attendanceRecords: AttendanceRecordInput[] = entries.map(entry => ({
        id: entry.id!, // ID is now always present
        batch_id: selectedBatch,
        student_id: entry.student_id,
        date: entry.date,
        mode: configuration?.attendance_mode || 'daily', // Include current mode
        period_number: entry.period_number !== undefined ? entry.period_number : null, // Convert undefined to null
        session: entry.session !== undefined ? entry.session : null, // Convert undefined to null
        status: entry.status,
        remarks: entry.remarks,
        school_id: schoolId // Add school_id
        // marked_by and marked_at will be set by the service with correct user ID
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
      console.log('Original entries:', entries);
      console.log('Converted records:', attendanceRecords.length);
      console.log('Valid records after filtering:', validRecords.length);
      console.log('Valid records to save:', validRecords);
      
      // Debug ID usage - check which records have pre-existing IDs from database
      const recordsWithExistingIds = validRecords.filter(r => 
        entries.find(e => e.student_id === r.student_id && 
                         e.date === r.date && 
                         e.period_number === r.period_number && 
                         e.session === r.session)?.id
      );
      const newRecordsCount = validRecords.length - recordsWithExistingIds.length;
      console.log(`Updating ${recordsWithExistingIds.length} existing records, creating ${newRecordsCount} new records`);
      validRecords.forEach((record, index) => {
        const passesConstraint = record.mode === 'session' ? 
          (record.period_number === null && record.session !== null && record.session !== undefined) : 
          true;
        const originalEntry = entries.find(e => e.student_id === record.student_id && 
                                           e.date === record.date && 
                                           e.period_number === record.period_number && 
                                           e.session === record.session);
        console.log(`Record ${index + 1}:`, {
          id: record.id,
          has_original_id: !!originalEntry?.id,
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
      
      // Invalidate and refetch attendance records to show updated data from database
      queryClient.invalidateQueries({ 
        queryKey: ['attendanceRecords', selectedBatch, selectedDate] 
      });
    },
    onError: (error) => {
      console.error('Save attendance mutation error:', error);
      
      // Handle specific error cases
      let errorMessage = 'An unknown error occurred. Changes are stored offline.';
      
      if (error.message?.includes('School ID is required')) {
        errorMessage = 'School ID is missing. Please refresh the page and try again.';
      } else if (error.message?.includes('check your permissions')) {
        errorMessage = 'You do not have permission to save attendance records for this school.';
      } else if (error.message?.includes('Some attendance records could not be saved')) {
        errorMessage = 'Only some records were saved. Please try saving again.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: 'Save Failed',
        description: errorMessage,
        variant: 'destructive'
      });
      
      // Keep unsaved changes flag true so user knows data isn't saved
      setHasUnsavedChanges(true);
    }
  });

  // Helper function to check if current entries match database records
  const entriesMatchDatabase = () => {
    if (!existingAttendanceRecords || existingAttendanceRecords.length === 0) {
      return false;
    }
    
    if (attendanceEntries.length !== existingAttendanceRecords.length) {
      return false;
    }
    
    // Check if all entries match database records
    return attendanceEntries.every(entry => {
      return existingAttendanceRecords.some(record => 
        record.student_id === entry.student_id &&
        record.date === entry.date &&
        (record.period_number || undefined) === entry.period_number &&
        (record.session || undefined) === entry.session &&
        record.status === entry.status &&
        // If entry has an ID, it should match the database record ID
        (!entry.id || record.id === entry.id)
      );
    });
  };

  // Load attendance data directly from database
  useEffect(() => {
    const loadAttendanceData = () => {
      if (!selectedBatch || !selectedDate) {
        setAttendanceEntries([]);
        return;
      }

      // If we have database records, use them
      if (existingAttendanceRecords && existingAttendanceRecords.length > 0) {
        // Convert database records to AttendanceEntry format
        const dbEntries: AttendanceEntryType[] = existingAttendanceRecords.map(record => ({
          id: record.id, // Preserve original database record ID
          student_id: record.student_id,
          date: record.date,
          period_number: record.period_number || undefined,
          session: record.session || undefined,
          status: record.status,
          remarks: record.remarks || undefined
        }));
        
        setAttendanceEntries(dbEntries);
        setHasUnsavedChanges(false); // Data from DB is already saved
      } else if (!attendanceLoading) {
        // No database records and not loading, start with empty state
        setAttendanceEntries([]);
        setHasUnsavedChanges(false);
      }
    };

    loadAttendanceData();
  }, [selectedBatch, selectedDate, existingAttendanceRecords, attendanceLoading]);

  // Sync hasUnsavedChanges based on whether current entries match database records
  useEffect(() => {
    if (attendanceEntries.length === 0) {
      setHasUnsavedChanges(false);
      return;
    }
    
    // If we have database records and current entries match them, mark as saved
    if (existingAttendanceRecords && existingAttendanceRecords.length > 0 && entriesMatchDatabase()) {
      setHasUnsavedChanges(false);
    } else if (!existingAttendanceRecords || existingAttendanceRecords.length === 0) {
      // If no database records exist, mark as unsaved (localStorage data)
      setHasUnsavedChanges(true);
    } else {
      // If database records exist but don't match current entries, mark as unsaved
      setHasUnsavedChanges(true);
    }
  }, [attendanceEntries, existingAttendanceRecords]);

  // Warn user before leaving page with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && attendanceEntries.length > 0) {
        e.preventDefault();
        e.returnValue = 'You have unsaved attendance data. Are you sure you want to leave without saving?';
        return 'You have unsaved attendance data. Are you sure you want to leave without saving?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges, attendanceEntries.length]);

  // Update hasUnsavedChanges when entries change
  useEffect(() => {
    if (attendanceEntries.length > 0) {
      setHasUnsavedChanges(true);
    }
  }, [attendanceEntries]);

  const handleAttendanceChange = (studentId: string, status: AttendanceStatus, periodNumber?: number, session?: 'morning' | 'afternoon', remarks?: string) => {
    setAttendanceEntries(prev => {
      const existingIndex = prev.findIndex(entry => 
        entry.student_id === studentId && 
        entry.period_number === periodNumber &&
        entry.session === session
      );

      if (existingIndex >= 0) {
        // Update existing entry, preserving the original ID
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex], // Preserve existing fields including ID
          status,
          remarks,
          // Keep original: id, student_id, date, period_number, session
        };
        return updated;
      } else {
        // Create new entry with a generated UUID
        const newEntry: AttendanceEntryType = {
          id: crypto.randomUUID(), // Generate UUID immediately for new entries
          student_id: studentId,
          date: selectedDate,
          period_number: periodNumber,
          session: session,
          status,
          remarks
        };
        return [...prev, newEntry];
      }
    });
  };

  const handleBulkAction = (action: 'present' | 'clear') => {
    if (!students) return;

    if (action === 'clear') {
      setAttendanceEntries([]);
      setHasUnsavedChanges(false);
      return;
    }

    // Mark all present based on attendance mode
    const newEntries: AttendanceEntryType[] = [];

    students.forEach(student => {
      if (configuration?.attendance_mode === 'period' && periodSlots) {
        periodSlots.forEach(period => {
          newEntries.push({
            id: crypto.randomUUID(),
            student_id: student.id,
            date: selectedDate,
            period_number: period.period_number,
            status: 'present'
          });
        });
      } else if (configuration?.attendance_mode === 'session') {
        ['morning', 'afternoon'].forEach(session => {
          newEntries.push({
            id: crypto.randomUUID(),
            student_id: student.id,
            date: selectedDate,
            session: session as 'morning' | 'afternoon',
            status: 'present'
          });
        });
      } else {
        newEntries.push({
          id: crypto.randomUUID(),
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
              {/* Warning for localStorage data */}
              {hasUnsavedChanges && attendanceEntries.length > 0 && (!existingAttendanceRecords || existingAttendanceRecords.length === 0) && (
                <Card className="border-orange-200 bg-orange-50 border-2 shadow-lg">
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                                                 <h3 className="font-semibold text-orange-800 mb-1">
                           Unsaved Attendance Data ({attendanceEntries.length} entries)
                         </h3>
                         <p className="text-orange-700 text-sm mb-3">
                           You're viewing unsaved attendance data from your browser's cache. This data is not yet saved to the database and may be lost if you refresh the page or navigate away.
                         </p>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Button 
                            onClick={handleSave}
                            disabled={saveAttendanceMutation.isPending || profileLoading || !schoolId}
                            size="sm"
                            className="bg-orange-600 hover:bg-orange-700 text-white"
                          >
                            {saveAttendanceMutation.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                              <Save className="h-4 w-4 mr-2" />
                            )}
                            Save Attendance Now
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => {
                              setAttendanceEntries([]);
                              localStorage.removeItem(`attendance_${selectedBatch}_${selectedDate}`);
                              setHasUnsavedChanges(false);
                            }}
                            className="border-orange-200 text-orange-700 hover:bg-orange-100"
                          >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Discard Changes
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

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
                    className={`flex items-center gap-2 ${
                      hasUnsavedChanges && attendanceEntries.length > 0 && (!existingAttendanceRecords || existingAttendanceRecords.length === 0)
                        ? 'bg-orange-600 hover:bg-orange-700 text-white border-orange-600 animate-pulse'
                        : ''
                    }`}
                    variant={
                      hasUnsavedChanges && attendanceEntries.length > 0 && (!existingAttendanceRecords || existingAttendanceRecords.length === 0)
                        ? 'default'
                        : 'default'
                    }
                  >
                    {saveAttendanceMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    {hasUnsavedChanges && attendanceEntries.length > 0 && (!existingAttendanceRecords || existingAttendanceRecords.length === 0)
                      ? 'Save Now (Unsaved)'
                      : 'Save Attendance'
                    }
                  </Button>
                </div>
              </div>

              {/* Attendance Grid */}
              {(studentsLoading || attendanceLoading) ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2">
                    {studentsLoading ? 'Loading students...' : 'Loading attendance data...'}
                  </span>
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
                      {existingAttendanceRecords && existingAttendanceRecords.length > 0 && (
                        <Badge variant="outline" className="ml-2 text-green-700 border-green-200">
                          Saved
                        </Badge>
                      )}
                      {hasUnsavedChanges && (
                        <Badge variant="outline" className="ml-2 text-orange-700 border-orange-200">
                          Unsaved Changes
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription>
                      Mark attendance for {students.length} students on {selectedDate}
                      {existingAttendanceRecords && existingAttendanceRecords.length > 0 ? (
                        <span className="text-green-600 ml-2">• Previously saved attendance loaded from database</span>
                      ) : hasUnsavedChanges && attendanceEntries.length > 0 ? (
                        <span className="text-orange-600 ml-2">• Unsaved data loaded from browser cache - Please save!</span>
                      ) : (
                        <span className="text-gray-600 ml-2">• Ready for new attendance entries</span>
                      )}
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
