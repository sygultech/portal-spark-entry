
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useBatchManagement } from '@/hooks/useBatchManagement';
import { attendanceService } from '@/services/attendanceService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { BarChart3, Calendar, Download, Filter, Users, TrendingUp, TrendingDown, Minus, Loader2 } from 'lucide-react';

const AttendanceReports = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const { activeBatches, isLoading: batchesLoading } = useBatchManagement();
  
  const [filters, setFilters] = useState({
    batchId: 'all',
    studentId: 'all',
    dateFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    dateTo: new Date().toISOString().split('T')[0]
  });

  const [reportType, setReportType] = useState<'summary' | 'detailed' | 'analytics'>('summary');

  // Fetch attendance records based on filters
  const { data: attendanceRecords, isLoading: recordsLoading } = useQuery({
    queryKey: ['attendanceRecords', filters],
    queryFn: () => attendanceService.getAttendanceRecords({
      batchId: filters.batchId === 'all' ? undefined : filters.batchId,
      studentId: filters.studentId === 'all' ? undefined : filters.studentId,
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo
    }),
    enabled: !!(filters.batchId !== 'all' || filters.studentId !== 'all')
  });

  // Fetch students for the selected batch (for detailed filtering)
  const { data: batchStudents } = useQuery({
    queryKey: ['batchStudents', filters.batchId],
    queryFn: () => attendanceService.getStudentsByBatch(filters.batchId),
    enabled: !!(filters.batchId && filters.batchId !== 'all')
  });

  // Mock analytics data - replace with real data when backend is ready
  const mockAnalytics = {
    attendancePercentage: 92.5,
    averagePresent: 23,
    totalStudents: 25,
    trendDirection: 'up',
    weeklyStats: [
      { week: 'Week 1', percentage: 94 },
      { week: 'Week 2', percentage: 91 },
      { week: 'Week 3', percentage: 93 },
      { week: 'Week 4', percentage: 89 }
    ]
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleExport = () => {
    // Mock export functionality
    toast({
      title: 'Export Started',
      description: 'Your attendance report is being prepared for download.'
    });
    
    // In real implementation, this would trigger a backend API call to generate and download the report
    console.log('Exporting attendance report with filters:', filters);
  };

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

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
      {/* Report Type Selector */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={reportType === 'summary' ? 'default' : 'outline'}
          onClick={() => setReportType('summary')}
          className="flex items-center gap-2"
        >
          <BarChart3 className="h-4 w-4" />
          Summary
        </Button>
        <Button
          variant={reportType === 'detailed' ? 'default' : 'outline'}
          onClick={() => setReportType('detailed')}
          className="flex items-center gap-2"
        >
          <Users className="h-4 w-4" />
          Detailed
        </Button>
        <Button
          variant={reportType === 'analytics' ? 'default' : 'outline'}
          onClick={() => setReportType('analytics')}
          className="flex items-center gap-2"
        >
          <TrendingUp className="h-4 w-4" />
          Analytics
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Report Filters
          </CardTitle>
          <CardDescription>
            Configure the parameters for your attendance report
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="batch">Batch</Label>
              <Select value={filters.batchId} onValueChange={(value) => handleFilterChange('batchId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select batch..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Batches</SelectItem>
                  {activeBatches.map((batch) => (
                    <SelectItem key={batch.id} value={batch.id}>
                      {batch.name} - {batch.course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {filters.batchId !== 'all' && batchStudents && (
              <div className="space-y-2">
                <Label htmlFor="student">Student</Label>
                <Select value={filters.studentId} onValueChange={(value) => handleFilterChange('studentId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select student..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Students</SelectItem>
                    {batchStudents.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.first_name} {student.last_name} ({student.roll_number})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="dateFrom">From Date</Label>
              <Input
                id="dateFrom"
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateTo">To Date</Label>
              <Input
                id="dateTo"
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              {filters.batchId !== 'all'
                ? `Showing data for ${activeBatches.find(b => b.id === filters.batchId)?.name || 'selected batch'}`
                : 'Select a batch to view attendance data'
              }
            </div>
            <Button onClick={handleExport} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Content */}
      {filters.batchId === 'all' ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Data Selected</h3>
              <p className="text-muted-foreground">
                Please select a batch and date range to view attendance reports.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : recordsLoading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading attendance data...</span>
        </div>
      ) : (
        <>
          {/* Summary Report */}
          {reportType === 'summary' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
                  {getTrendIcon(mockAnalytics.trendDirection)}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{mockAnalytics.attendancePercentage}%</div>
                  <p className="text-xs text-muted-foreground">
                    {mockAnalytics.averagePresent} of {mockAnalytics.totalStudents} students
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Present</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mockAnalytics.averagePresent}</div>
                  <p className="text-xs text-muted-foreground">Average per day</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Report Period</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Math.ceil((new Date(filters.dateTo).getTime() - new Date(filters.dateFrom).getTime()) / (1000 * 60 * 60 * 24))}
                  </div>
                  <p className="text-xs text-muted-foreground">Days selected</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Detailed Report */}
          {reportType === 'detailed' && (
            <Card>
              <CardHeader>
                <CardTitle>Detailed Attendance Records</CardTitle>
                <CardDescription>
                  Individual attendance records for the selected period
                </CardDescription>
              </CardHeader>
              <CardContent>
                {attendanceRecords && attendanceRecords.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Student</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Period</TableHead>
                        <TableHead>Marked By</TableHead>
                        <TableHead>Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {attendanceRecords.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                          <TableCell>
                            {batchStudents?.find(s => s.id === record.student_id)?.first_name} {' '}
                            {batchStudents?.find(s => s.id === record.student_id)?.last_name}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                record.status === 'present' ? 'border-green-200 text-green-700 bg-green-50' :
                                record.status === 'absent' ? 'border-red-200 text-red-700 bg-red-50' :
                                record.status === 'late' ? 'border-yellow-200 text-yellow-700 bg-yellow-50' :
                                'border-blue-200 text-blue-700 bg-blue-50'
                              }
                            >
                              {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>{record.period_number || 'All Day'}</TableCell>
                          <TableCell>Teacher</TableCell>
                          <TableCell>{new Date(record.marked_at).toLocaleTimeString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Records Found</h3>
                    <p className="text-muted-foreground">
                      No attendance records found for the selected criteria. This might be because:
                    </p>
                    <ul className="text-muted-foreground text-sm mt-2 space-y-1">
                      <li>• No attendance has been marked for this period</li>
                      <li>• The backend system is not yet connected</li>
                      <li>• The date range doesn't contain any school days</li>
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Analytics Report */}
          {reportType === 'analytics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Weekly Trends</CardTitle>
                    <CardDescription>Attendance percentage over the last 4 weeks</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockAnalytics.weeklyStats.map((week) => (
                        <div key={week.week} className="flex items-center justify-between">
                          <span className="text-sm font-medium">{week.week}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${week.percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-muted-foreground">{week.percentage}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Status Distribution</CardTitle>
                    <CardDescription>Breakdown of attendance statuses</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="text-sm">Present</span>
                        </div>
                        <span className="text-sm font-medium">92%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <span className="text-sm">Absent</span>
                        </div>
                        <span className="text-sm font-medium">5%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                          <span className="text-sm">Late</span>
                        </div>
                        <span className="text-sm font-medium">2%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <span className="text-sm">Leave</span>
                        </div>
                        <span className="text-sm font-medium">1%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-blue-800 mb-2">Advanced Analytics Coming Soon</h3>
                    <p className="text-blue-700">
                      Detailed analytics including student performance trends, class-wise comparisons, 
                      and predictive insights will be available once the backend system is integrated.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AttendanceReports;
