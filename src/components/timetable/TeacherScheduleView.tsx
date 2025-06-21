
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TeacherScheduleViewProps {
  selectedTerm: string;
}

export const TeacherScheduleView: React.FC<TeacherScheduleViewProps> = ({
  selectedTerm
}) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Teacher Schedule View</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Teacher schedule view will be implemented here
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
