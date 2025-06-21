
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar, Users, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAttendance } from '@/hooks/useAttendance';
import { useBatches } from '@/hooks/useBatches';
import { useStudentManagement } from '@/hooks/useStudentManagement';

const DailyAttendanceView = () => {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedBatch, setSelectedBatch] = useState<string>('');
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [batchStudents, setBatchStudents] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const { 
    fetchAttendanceRecords, 
    markAttendance, 
    bulkMarkAttendance,
    isMarkingAttendance,
    fetchBatchAttendanceStats 
  } = useAttendance();
  const { batches } = useBatches();
  const { students } = useStudentManagement();

  // Fetch attendance records when date or batch changes
  useEffect(() => {
    if (selectedDate && selectedBatch) {
      loadAttendanceData();
    }
  }, [selectedDate, selectedBatch]);

  // Filter students by batch
  useEffect(() => {
    if (selectedBatch) {
      const filtered = students.filter(student => student.batch_id === selectedBatch);
      setBatchStudents(filtered);
    }
  }, [selectedBatch, students]);

  const loadAttendanceData = async () => {
    try {
      const records = await fetchAttendanceRecords({
        batch_id: selectedBatch,
        date_from: selectedDate,
        date_to: selectedDate,
        attendance_mode: 'daily'
      });
      setAttendanceRecords(records || []);
    } catch (error) {
      console.error('Error loading attendance data:', error);
    }
  };

  const getStudentAttendanceStatus = (studentId: string) => {
    const record = attendanceRecords.find(r => r.student_id === studentId);
    return record?.status || 'unmarked';
  };

  const markStudentAttendance = (studentId: string, status: string) => {
    markAttendance({
      student_id: studentId,
      batch_id: selectedBatch,
      attendance_date: selectedDate,
      attendance_mode: 'daily',
      status: status as any,
      academic_year_id: batches.find(b => b.id === selectedBatch)?.academic_year_id
    });
  };

  const markAllPresent = () => {
    const unmarkedStudents = batchStudents.filter(student => 
      getStudentAttendanceStatus(student.id) === 'unmarked'
    );

    const attendanceData = unmarkedStudents.map(student => ({
      student_id: student.id,
      batch_id: selectedBatch,
      attendance_date: selectedDate,
      attendance_mode: 'daily' as const,
      status: 'present' as const,
      academic_year_id: batches.find(b => b.id === selectedBatch)?.academic_year_id
    }));

    if (attendanceData.length > 0) {
      bulkMarkAttendance(attendanceData);
    }
  };

  const filteredStudents = batchStudents.filter(student =>
    `${student.first_name} ${student.last_name} ${student.admission_number}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800';
      case 'absent': return 'bg-red-100 text-red-800';
      case 'late': return 'bg-yellow-100 text-yellow-800';
      case 'excused': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present': return <CheckCircle className="h-4 w-4" />;
      case 'absent': return <XCircle className="h-4 w-4" />;
      case 'late': return <Clock className="h-4 w-4" />;
      case 'excused': return <AlertCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  const stats = {
    total: filteredStudents.length,
    present: filteredStudents.filter(s => getStudentAttendanceStatus(s.id) === 'present').length,
    absent: filteredStudents.filter(s => getStudentAttendanceStatus(s.id) === 'absent').length,
    late: filteredStudents.filter(s => getStudentAttendanceStatus(s.id) === 'late').length,
    unmarked: filteredStudents.filter(s => getStudentAttendanceStatus(s.id) === 'unmarked').length
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Daily Attendance</h2>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full sm:w-auto"
          />
          
          <Select value={selectedBatch} onValueChange={setSelectedBatch}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Select batch" />
            </SelectTrigger>
            <SelectContent>
              {batches.map((batch) => (
                <SelectItem key={batch.id} value={batch.id}>
                  {batch.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedBatch && (
        <>
          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="text-xl font-bold">{stats.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Present</p>
                    <p className="text-xl font-bold text-green-600">{stats.present}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <div>
                    <p className="text-sm text-gray-600">Absent</p>
                    <p className="text-xl font-bold text-red-600">{stats.absent}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-yellow-600" />
                  <div>
                    <p className="text-sm text-gray-600">Late</p>
                    <p className="text-xl font-bold text-yellow-600">{stats.late}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-600">Unmarked</p>
                    <p className="text-xl font-bold text-gray-600">{stats.unmarked}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <Input
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            
            <Button 
              onClick={markAllPresent}
              disabled={isMarkingAttendance || stats.unmarked === 0}
              className="w-full sm:w-auto"
            >
              Mark All Present
            </Button>
          </div>

          {/* Students Table */}
          <Card>
            <CardHeader>
              <CardTitle>Students - {format(new Date(selectedDate), 'MMMM d, yyyy')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Admission No.</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => {
                    const status = getStudentAttendanceStatus(student.id);
                    return (
                      <TableRow key={student.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{student.first_name} {student.last_name}</p>
                            <p className="text-sm text-gray-500">{student.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>{student.admission_number}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(status)}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(status)}
                              {status === 'unmarked' ? 'Not Marked' : status.charAt(0).toUpperCase() + status.slice(1)}
                            </div>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant={status === 'present' ? 'default' : 'outline'}
                              onClick={() => markStudentAttendance(student.id, 'present')}
                              disabled={isMarkingAttendance}
                            >
                              Present
                            </Button>
                            <Button
                              size="sm"
                              variant={status === 'absent' ? 'destructive' : 'outline'}
                              onClick={() => markStudentAttendance(student.id, 'absent')}
                              disabled={isMarkingAttendance}
                            >
                              Absent
                            </Button>
                            <Button
                              size="sm"
                              variant={status === 'late' ? 'secondary' : 'outline'}
                              onClick={() => markStudentAttendance(student.id, 'late')}
                              disabled={isMarkingAttendance}
                            >
                              Late
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default DailyAttendanceView;
