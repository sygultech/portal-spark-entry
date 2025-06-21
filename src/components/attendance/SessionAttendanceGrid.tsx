
import React from 'react';
import { Student, AttendanceEntry, AttendanceStatus } from '@/types/attendance';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle, XCircle, Clock, Heart, Sun, Moon } from 'lucide-react';

interface SessionAttendanceGridProps {
  students: Student[];
  attendanceEntries: AttendanceEntry[];
  onAttendanceChange: (studentId: string, status: AttendanceStatus, periodNumber?: number, session?: 'morning' | 'afternoon') => void;
}

const SessionAttendanceGrid: React.FC<SessionAttendanceGridProps> = ({
  students,
  attendanceEntries,
  onAttendanceChange
}) => {
  const getStudentSessionStatus = (studentId: string, session: 'morning' | 'afternoon'): AttendanceStatus | null => {
    const entry = attendanceEntries.find(
      entry => entry.student_id === studentId && entry.session === session
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

  const handleSessionClick = (studentId: string, session: 'morning' | 'afternoon') => {
    const currentStatus = getStudentSessionStatus(studentId, session);
    
    // Cycle through statuses: null -> present -> absent -> late -> leave -> null
    const statusCycle: (AttendanceStatus | null)[] = [null, 'present', 'absent', 'late', 'leave'];
    const currentIndex = statusCycle.indexOf(currentStatus);
    const nextIndex = (currentIndex + 1) % statusCycle.length;
    const nextStatus = statusCycle[nextIndex];
    
    if (nextStatus) {
      onAttendanceChange(studentId, nextStatus, undefined, session);
    } else {
      // Remove entry by cycling back to present
      onAttendanceChange(studentId, 'present', undefined, session);
    }
  };

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

      {/* Session Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <Sun className="h-5 w-5 text-orange-600" />
          <div>
            <h4 className="font-semibold text-orange-800">Morning Session</h4>
            <p className="text-sm text-orange-700">Usually 8:00 AM - 12:00 PM</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
          <Moon className="h-5 w-5 text-indigo-600" />
          <div>
            <h4 className="font-semibold text-indigo-800">Afternoon Session</h4>
            <p className="text-sm text-indigo-700">Usually 1:00 PM - 5:00 PM</p>
          </div>
        </div>
      </div>

      {/* Attendance Grid */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-64 sticky left-0 bg-white z-10">Student</TableHead>
              <TableHead className="text-center w-32">
                <div className="flex items-center justify-center gap-2">
                  <Sun className="h-4 w-4 text-orange-600" />
                  Morning
                </div>
              </TableHead>
              <TableHead className="text-center w-32">
                <div className="flex items-center justify-center gap-2">
                  <Moon className="h-4 w-4 text-indigo-600" />
                  Afternoon
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => {
              const morningStatus = getStudentSessionStatus(student.id, 'morning');
              const afternoonStatus = getStudentSessionStatus(student.id, 'afternoon');
              
              return (
                <TableRow key={student.id}>
                  <TableCell className="sticky left-0 bg-white z-10 border-r">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={student.photo_url} alt={`${student.first_name} ${student.last_name}`} />
                        <AvatarFallback>
                          {student.first_name[0]}{student.last_name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {student.first_name} {student.last_name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Roll: {student.roll_number || 'N/A'} • Adm: {student.admission_number}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  
                  {/* Morning Session */}
                  <TableCell className="text-center p-4">
                    <button
                      onClick={() => handleSessionClick(student.id, 'morning')}
                      className={`w-16 h-16 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${getStatusColor(morningStatus)} hover:scale-105 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-1`}
                      title={`Click to mark morning attendance for ${student.first_name} ${student.last_name}`}
                    >
                      {getStatusIcon(morningStatus)}
                    </button>
                  </TableCell>
                  
                  {/* Afternoon Session */}
                  <TableCell className="text-center p-4">
                    <button
                      onClick={() => handleSessionClick(student.id, 'afternoon')}
                      className={`w-16 h-16 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${getStatusColor(afternoonStatus)} hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1`}
                      title={`Click to mark afternoon attendance for ${student.first_name} ${student.last_name}`}
                    >
                      {getStatusIcon(afternoonStatus)}
                    </button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div className="text-sm text-muted-foreground">
        Click on the session boxes to cycle through attendance statuses: Not Marked → Present → Absent → Late → Leave
      </div>
    </div>
  );
};

export default SessionAttendanceGrid;
