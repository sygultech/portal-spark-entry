
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ClipboardCheck, Settings, BarChart3 } from 'lucide-react';
import AttendanceConfiguration from '@/components/attendance/AttendanceConfiguration';
import AttendanceEntry from '@/components/attendance/AttendanceEntry';
import AttendanceReports from '@/components/attendance/AttendanceReports';

const Attendance = () => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState('entry');

  const isSchoolAdmin = profile?.roles?.includes('school_admin');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Attendance Management</h1>
          <p className="text-muted-foreground">
            Manage student attendance with configurable modes and comprehensive reporting
          </p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-2">
          <ClipboardCheck className="h-4 w-4" />
          Active Module
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="entry" className="flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4" />
            Mark Attendance
          </TabsTrigger>
          {isSchoolAdmin && (
            <TabsTrigger value="configuration" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Configuration
            </TabsTrigger>
          )}
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="entry" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Mark Attendance</CardTitle>
              <CardDescription>
                Record student attendance based on the configured mode for each batch
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AttendanceEntry />
            </CardContent>
          </Card>
        </TabsContent>

        {isSchoolAdmin && (
          <TabsContent value="configuration" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Attendance Configuration</CardTitle>
                <CardDescription>
                  Configure attendance modes and settings for different batches
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AttendanceConfiguration />
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Reports</CardTitle>
              <CardDescription>
                View and analyze attendance patterns and statistics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AttendanceReports />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Attendance;
