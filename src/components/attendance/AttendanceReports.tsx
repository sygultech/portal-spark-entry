
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AttendanceReports: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Attendance Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Attendance reports will be implemented here
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceReports;
