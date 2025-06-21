
import React from 'react';
import { Student, AttendanceEntry, AttendanceStatus } from '@/types/attendance';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, Heart } from 'lucide-react';

interface DailyAttendanceGridProps {
  students: Student[];
  attendanceEntries: AttendanceEntry[];
  onAttendanceChange: (studentId: string, status: AttendanceStatus) => void;
}

const DailyAttendanceGrid: React.FC<DailyAttendanceGridProps> = ({
  students,
  attendanceEntries,
  onAttendanceChange
}) => {
  const getStudentStatus = (studentId: string): AttendanceStatus | null => {
    const entry = attendanceEntries.find(entry => entry.student_id === studentId);
    return entry?.status || null;
  };

  const getStatusButton = (status: AttendanceStatus, isActive: boolean, onClick: () => void) => {
    const baseClasses = "min-w-[80px] transition-all duration-200";
    
    switch (status) {
      case 'present':
        return (
          <Button
            variant={isActive ? "default" : "outline"}
            size="sm"
            onClick={onClick}
            className={`${baseClasses} ${isActive ? 'bg-green-600 hover:bg-green-700' : 'border-green-200 text-green-700 hover:bg-green-50'}`}
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Present
          </Button>
        );
      case 'absent':
        return (
          <Button
            variant={isActive ? "default" : "outline"}
            size="sm"
            onClick={onClick}
            className={`${baseClasses} ${isActive ? 'bg-red-600 hover:bg-red-700' : 'border-red-200 text-red-700 hover:bg-red-50'}`}
          >
            <XCircle className="h-4 w-4 mr-1" />
            Absent
          </Button>
        );
      case 'late':
        return (
          <Button
            variant={isActive ? "default" : "outline"}
            size="sm"
            onClick={onClick}
            className={`${baseClasses} ${isActive ? 'bg-yellow-600 hover:bg-yellow-700' : 'border-yellow-200 text-yellow-700 hover:bg-yellow-50'}`}
          >
            <Clock className="h-4 w-4 mr-1" />
            Late
          </Button>
        );
      case 'leave':
        return (
          <Button
            variant={isActive ? "default" : "outline"}
            size="sm"
            onClick={onClick}
            className={`${baseClasses} ${isActive ? 'bg-blue-600 hover:bg-blue-700' : 'border-blue-200 text-blue-700 hover:bg-blue-50'}`}
          >
            <Heart className="h-4 w-4 mr-1" />
            Leave
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        {students.map((student) => {
          const currentStatus = getStudentStatus(student.id);
          
          return (
            <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={student.photo_url} alt={`${student.first_name} ${student.last_name}`} />
                  <AvatarFallback>
                    {student.first_name[0]}{student.last_name[0]}
                  </AvatarFallback>
                </Avatar>
                
                <div>
                  <h3 className="font-semibold">
                    {student.first_name} {student.last_name}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Roll: {student.roll_number || 'N/A'}</span>
                    <span>•</span>
                    <span>Adm: {student.admission_number}</span>
                  </div>
                </div>
                
                {currentStatus && (
                  <Badge 
                    variant="outline" 
                    className={`ml-4 ${
                      currentStatus === 'present' ? 'border-green-200 text-green-700 bg-green-50' :
                      currentStatus === 'absent' ? 'border-red-200 text-red-700 bg-red-50' :
                      currentStatus === 'late' ? 'border-yellow-200 text-yellow-700 bg-yellow-50' :
                      'border-blue-200 text-blue-700 bg-blue-50'
                    }`}
                  >
                    {currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
                  </Badge>
                )}
              </div>
              
              <div className="flex gap-2">
                {(['present', 'absent', 'late', 'leave'] as AttendanceStatus[]).map((status) =>
                  getStatusButton(
                    status,
                    currentStatus === status,
                    () => onAttendanceChange(student.id, status)
                  )
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DailyAttendanceGrid;
