
import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FileDown, Calendar, TrendingUp, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAttendance } from '@/hooks/useAttendance';
import { useBatches } from '@/hooks/useBatches';
import { useStudentManagement } from '@/hooks/useStudentManagement';
import { AttendanceStats } from '@/types/attendance';

const AttendanceReports = () => {
  const [selectedBatch, setSelectedBatch] = useState<string>('');
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [dateFrom, setDateFrom] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [dateTo, setDateTo] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));
  const [reportData, setReportData] = useState<any[]>([]);
  const [studentStats, setStudentStats] = useState<AttendanceStats | null>(null);

  const { fetchAttendanceRecords, calculateAttendanceStats } = useAttendance();
  const { batches } = useBatches();
  const { students } = useStudentManagement();

  // Filter students by selected batch
  const filteredStudents = selectedBatch 
    ? students.filter(student => student.batch_id === selectedBatch)
    : students;

  // Load report data
  useEffect(() => {
    if (selectedBatch || selectedStudent) {
      loadReportData();
    }
  }, [selectedBatch, selectedStudent, dateFrom, dateTo]);

  const loadReportData = async () => {
    try {
      const records = await fetchAttendanceRecords({
        batch_id: selectedBatch || undefined,
        student_id: selectedStudent || undefined,
        date_from: dateFrom,
        date_to: dateTo
      });

      if (selectedStudent) {
        // Individual student report
        const studentRecords = records?.filter(r => r.student_id === selectedStudent) || [];
        const stats = calculateAttendanceStats(studentRecords);
        setStudentStats(stats);
      } else if (selectedBatch) {
        // Batch report - aggregate by student
        const studentData = filteredStudents.map(student => {
          const studentRecords = records?.filter(r => r.student_id === student.id) || [];
          const stats = calculateAttendanceStats(studentRecords);
          return {
            student_id: student.id,
            student_name: `${student.first_name} ${student.last_name}`,
            admission_number: student.admission_number,
            ...stats
          };
        });
        setReportData(studentData);
      }
    } catch (error) {
      console.error('Error loading report data:', error);
    }
  };

  // Chart data for batch overview
  const chartData = reportData.map(item => ({
    name: item.student_name,
    attendance: item.attendance_percentage,
    present: item.present_days,
    absent: item.absent_days
  }));

  // Pie chart data for individual student
  const pieData = studentStats ? [
    { name: 'Present', value: studentStats.present_days, color: '#10B981' },
    { name: 'Absent', value: studentStats.absent_days, color: '#EF4444' },
    { name: 'Late', value: studentStats.late_days, color: '#F59E0B' },
    { name: 'Excused', value: studentStats.excused_days, color: '#3B82F6' }
  ] : [];

  const exportToCSV = () => {
    if (selectedStudent && studentStats) {
      // Export individual student data
      const csvContent = [
        ['Student Report'],
        ['Student', selectedStudent],
        ['Period', `${dateFrom} to ${dateTo}`],
        [''],
        ['Metric', 'Value'],
        ['Total Days', studentStats.total_days],
        ['Present Days', studentStats.present_days],
        ['Absent Days', studentStats.absent_days],
        ['Late Days', studentStats.late_days],
        ['Excused Days', studentStats.excused_days],
        ['Attendance Percentage', `${studentStats.attendance_percentage}%`]
      ].map(row => row.join(',')).join('\n');

      downloadCSV(csvContent, 'student_attendance_report.csv');
    } else if (selectedBatch) {
      // Export batch data
      const headers = ['Student Name', 'Admission Number', 'Total Days', 'Present', 'Absent', 'Late', 'Excused', 'Attendance %'];
      const rows = reportData.map(item => [
        item.student_name,
        item.admission_number,
        item.total_days,
        item.present_days,
        item.absent_days,
        item.late_days,
        item.excused_days,
        `${item.attendance_percentage}%`
      ]);

      const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
      downloadCSV(csvContent, 'batch_attendance_report.csv');
    }
  };

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Attendance Reports</h2>
        </div>
        
        <Button onClick={exportToCSV} disabled={!reportData.length && !studentStats}>
          <FileDown className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Report Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Batch</label>
              <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                <SelectTrigger>
                  <SelectValue placeholder="Select batch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Batches</SelectItem>
                  {batches.map((batch) => (
                    <SelectItem key={batch.id} value={batch.id}>
                      {batch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Student</label>
              <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                <SelectTrigger>
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Students</SelectItem>
                  {filteredStudents.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.first_name} {student.last_name} ({student.admission_number})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">From Date</label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">To Date</label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Student Report */}
      {selectedStudent && studentStats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{studentStats.attendance_percentage}%</p>
                  <p className="text-sm text-gray-600">Attendance Rate</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{studentStats.total_days}</p>
                  <p className="text-sm text-gray-600">Total Days</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Present:</span>
                  <span className="font-medium text-green-600">{studentStats.present_days}</span>
                </div>
                <div className="flex justify-between">
                  <span>Absent:</span>
                  <span className="font-medium text-red-600">{studentStats.absent_days}</span>
                </div>
                <div className="flex justify-between">
                  <span>Late:</span>
                  <span className="font-medium text-yellow-600">{studentStats.late_days}</span>
                </div>
                <div className="flex justify-between">
                  <span>Excused:</span>
                  <span className="font-medium text-blue-600">{studentStats.excused_days}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Attendance Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Batch Report */}
      {selectedBatch && !selectedStudent && reportData.length > 0 && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Attendance Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="attendance" fill="#3B82F6" name="Attendance %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Detailed Report</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Admission No.</TableHead>
                    <TableHead className="text-center">Total Days</TableHead>
                    <TableHead className="text-center">Present</TableHead>
                    <TableHead className="text-center">Absent</TableHead>
                    <TableHead className="text-center">Late</TableHead>
                    <TableHead className="text-center">Attendance %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.map((student) => (
                    <TableRow key={student.student_id}>
                      <TableCell className="font-medium">{student.student_name}</TableCell>
                      <TableCell>{student.admission_number}</TableCell>
                      <TableCell className="text-center">{student.total_days}</TableCell>
                      <TableCell className="text-center text-green-600">{student.present_days}</TableCell>
                      <TableCell className="text-center text-red-600">{student.absent_days}</TableCell>
                      <TableCell className="text-center text-yellow-600">{student.late_days}</TableCell>
                      <TableCell className="text-center">
                        <span className={`font-medium ${
                          student.attendance_percentage >= 90 ? 'text-green-600' :
                          student.attendance_percentage >= 75 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {student.attendance_percentage}%
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default AttendanceReports;
