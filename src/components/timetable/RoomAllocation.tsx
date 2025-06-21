
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RoomAllocationProps {
  selectedTerm: string;
}

export const RoomAllocation: React.FC<RoomAllocationProps> = ({
  selectedTerm
}) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Room Allocation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Room allocation management will be implemented here
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
