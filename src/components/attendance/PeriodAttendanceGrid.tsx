
import React from 'react';
import { Student, AttendanceEntry, AttendanceStatus, PeriodSlot } from '@/types/attendance';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle, XCircle, Clock, Heart, AlertTriangle, Loader2 } from 'lucide-react';

interface PeriodAttendanceGridProps {
  students: Student[];
  periodSlots: PeriodSlot[];
  attendanceEntries: AttendanceEntry[];
  onAttendanceChange: (studentId: string, status: AttendanceStatus, periodNumber?: number) => void;
  isLoadingPeriods: boolean;
  selectedDate: string;
  availableDays: string[];
}

const PeriodAttendanceGrid: React.FC<PeriodAttendanceGridProps> = ({
  students,
  periodSlots,
  attendanceEntries,
  onAttendanceChange,
  isLoadingPeriods,
  selectedDate,
  availableDays
}) => {
  const getStudentPeriodStatus = (studentId: string, periodNumber: number): AttendanceStatus | null => {
    const entry = attendanceEntries.find(
      entry => entry.student_id === studentId && entry.period_number === periodNumber
    );
    return entry?.status || null;
  };

  const getStatusIcon = (status: AttendanceStatus | null) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'absent':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'late':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'leave':
        return <Heart className="h-4 w-4 text-blue-600" />;
      default:
        return <div className="h-4 w-4 border border-gray-300 rounded-sm bg-gray-50" />;
    }
  };

  const getStatusColor = (status: AttendanceStatus | null) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 border-green-200';
      case 'absent':
        return 'bg-red-100 border-red-200';
      case 'late':
        return 'bg-yellow-100 border-yellow-200';
      case 'leave':
        return 'bg-blue-100 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200 hover:bg-gray-100';
    }
  };

  const handleCellClick = (studentId: string, periodNumber: number) => {
    const currentStatus = getStudentPeriodStatus(studentId, periodNumber);
    
    // Cycle through  statuses: null -> present -> absent -> late -> leave -> null
    const statusCycle: (AttendanceStatus | null)[] = [null, 'present', 'absent', 'late', 'leave'];
    const currentIndex = statusCycle.indexOf(currentStatus);
    const nextIndex = (currentIndex + 1) % statusCycle.length;
    const nextStatus = statusCycle[nextIndex];
    
    if (nextStatus) {
      onAttendanceChange(studentId, nextStatus, periodNumber);
    } else {
      // Remove entry by not calling onAttendanceChange or handle removal.
      // For now, we'll set to 'absent' as default when cycling back
      onAttendanceChange(studentId, 'present', periodNumber);
    }
  };

  if (isLoadingPeriods) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading period configuration...</span>
      </div>
    );
  }

  if (!periodSlots || periodSlots.length === 0) {
    // Determine the day of week from selected date
    const getDayOfWeek = (dateString: string) => {
      const date = new Date(dateString);
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return days[date.getDay()];
    };

    const selectedDayOfWeek = getDayOfWeek(selectedDate);
    const selectedDayLower = selectedDayOfWeek.toLowerCase();

    // Check if the selected day is in available days
    const isDayConfigured = availableDays.includes(selectedDayLower);

    // Format available days for display
    const formatDayName = (day: string) => day.charAt(0).toUpperCase() + day.slice(1);
    const availableDaysFormatted = availableDays.map(formatDayName).join(', ');

    return (
      <div className="flex items-center justify-center p-8 border-2 border-dashed border-orange-200 rounded-lg bg-orange-50">
        <div className="text-center max-w-md">
          <AlertTriangle className="h-12 w-12 text-orange-600 mx-auto mb-4" />
          
          {!isDayConfigured && availableDays.length > 0 ? (
            <>
              <h3 className="text-lg font-semibold text-orange-800 mb-2">
                No Classes on {selectedDayOfWeek}
              </h3>
              <p className="text-orange-700 mb-3">
                The selected date ({selectedDate}) falls on a {selectedDayOfWeek}, but there are no period configurations for this day.
              </p>
              <p className="text-orange-700">
                <strong>Classes are configured for:</strong><br />
                {availableDaysFormatted}
              </p>
            </>
          ) : availableDays.length === 0 ? (
            <>
              <h3 className="text-lg font-semibold text-orange-800 mb-2">No Timetable Configuration Found</h3>
              <p className="text-orange-700">
                Please contact admin to set up the timetable configuration for this batch.
              </p>
            </>
          ) : (
            <>
              <h3 className="text-lg font-semibold text-orange-800 mb-2">No Periods Found</h3>
              <p className="text-orange-700">
                No period configuration found for {selectedDayOfWeek}.
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2 text-sm">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <span>Present</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <XCircle className="h-4 w-4 text-red-600" />
          <span>Absent</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-yellow-600" />
          <span>Late</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Heart className="h-4 w-4 text-blue-600" />
          <span>Leave</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="h-4 w-4 border border-gray-300 rounded-sm bg-gray-50" />
          <span>Not Marked</span>
        </div>
      </div>

      {/* Attendance Grid */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-48 sticky left-0 bg-white z-10">Student</TableHead>
              {periodSlots.map((period) => (
                <TableHead key={period.period_number} className="text-center min-w-[100px]">
                  <div className="space-y-1">
                    <div className="font-semibold">Period {period.period_number}</div>
                    <div className="text-xs text-muted-foreground">
                      {period.start_time} - {period.end_time}
                    </div>
                    {period.subject_name && (
                      <Badge variant="outline" className="text-xs">
                        {period.subject_name}
                      </Badge>
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.id}>
                <TableCell className="sticky left-0 bg-white z-10 border-r">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={student.photo_url} alt={`${student.first_name} ${student.last_name}`} />
                      <AvatarFallback className="text-xs">
                        {student.first_name[0]}{student.last_name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-sm">
                        {student.first_name} {student.last_name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Roll: {student.roll_number || 'N/A'}
                      </div>
                    </div>
                  </div>
                </TableCell>
                {periodSlots.map((period) => {
                  const status = getStudentPeriodStatus(student.id, period.period_number);
                  return (
                    <TableCell key={period.period_number} className="text-center p-2">
                      <button
                        onClick={() => handleCellClick(student.id, period.period_number)}
                        className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${getStatusColor(status)} hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1`}
                        title={`Click to mark attendance for ${student.first_name} ${student.last_name} - Period ${period.period_number}`}
                      >
                        {getStatusIcon(status)}
                      </button>
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="text-sm text-muted-foreground">
        Click on the boxes to cycle through attendance statuses: Not Marked → Present → Absent → Late → Leave
      </div>
    </div>
  );
};

export default PeriodAttendanceGrid;
