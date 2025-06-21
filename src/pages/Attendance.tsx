
import { useState } from 'react';
import { Users, Calendar, TrendingUp, FileText, Settings, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import DailyAttendanceView from '@/components/attendance/DailyAttendanceView';
import AttendanceReports from '@/components/attendance/AttendanceReports';
import AttendanceConfigurationDialog from '@/components/attendance/AttendanceConfigurationDialog';
import LeaveRequestDialog from '@/components/attendance/LeaveRequestDialog';
import { useAttendance } from '@/hooks/useAttendance';
import { useLeaveRequests } from '@/hooks/useLeaveRequests';

const Attendance = () => {
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState(null);

  const { configurations, configurationsLoading } = useAttendance();
  const { leaveRequests, updateLeaveRequest } = useLeaveRequests();

  const pendingLeaveRequests = leaveRequests?.filter(req => req.status === 'pending') || [];

  const handleEditConfig = (config: any) => {
    setSelectedConfig(config);
    setConfigDialogOpen(true);
  };

  const handleApproveLeave = (id: string) => {
    updateLeaveRequest({ id, status: 'approved' });
  };

  const handleRejectLeave = (id: string, reason: string) => {
    updateLeaveRequest({ id, status: 'rejected', rejection_reason: reason });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Student Attendance</h1>
          <p className="text-gray-600">Manage student attendance, leave requests, and generate reports</p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={() => setLeaveDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Leave Request
          </Button>
          <Button onClick={() => setConfigDialogOpen(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Configuration
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Active Configurations</p>
                <p className="text-xl font-bold">{configurations?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Pending Leave Requests</p>
                <p className="text-xl font-bold">{pendingLeaveRequests.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Today's Attendance</p>
                <p className="text-xl font-bold">-</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Average Attendance</p>
                <p className="text-xl font-bold">-</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="daily" className="space-y-4">
        <TabsList>
          <TabsTrigger value="daily">Daily Attendance</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="leave-requests">Leave Requests</TabsTrigger>
          <TabsTrigger value="configurations">Configurations</TabsTrigger>
        </TabsList>

        <TabsContent value="daily">
          <DailyAttendanceView />
        </TabsContent>

        <TabsContent value="reports">
          <AttendanceReports />
        </TabsContent>

        <TabsContent value="leave-requests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Leave Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingLeaveRequests.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No pending leave requests</p>
              ) : (
                <div className="space-y-4">
                  {pendingLeaveRequests.map((request) => (
                    <div key={request.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">Student: {request.student?.first_name} {request.student?.last_name}</h4>
                          <p className="text-sm text-gray-600">
                            {request.start_date} to {request.end_date}
                          </p>
                        </div>
                        <Badge variant="outline" className="capitalize">
                          {request.leave_type.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm mb-3">{request.reason}</p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleApproveLeave(request.id)}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRejectLeave(request.id, 'Rejected by administrator')}
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configurations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Configurations</CardTitle>
            </CardHeader>
            <CardContent>
              {configurationsLoading ? (
                <p>Loading configurations...</p>
              ) : configurations?.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No configurations found</p>
              ) : (
                <div className="space-y-4">
                  {configurations?.map((config) => (
                    <div key={config.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">Batch Configuration</h4>
                          <p className="text-sm text-gray-600">
                            Mode: {config.attendance_mode.replace('_', ' ')}
                          </p>
                          <p className="text-sm text-gray-600">
                            Auto Absent: {config.auto_absent_enabled ? 'Yes' : 'No'}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant={config.is_active ? 'default' : 'secondary'}>
                            {config.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditConfig(config)}
                          >
                            Edit
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <AttendanceConfigurationDialog
        isOpen={configDialogOpen}
        onClose={() => {
          setConfigDialogOpen(false);
          setSelectedConfig(null);
        }}
        configuration={selectedConfig}
      />

      <LeaveRequestDialog
        isOpen={leaveDialogOpen}
        onClose={() => setLeaveDialogOpen(false)}
      />
    </div>
  );
};

export default Attendance;
