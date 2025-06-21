
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ConflictCheckerProps {
  selectedClass: string;
  selectedTerm: string;
}

export const ConflictChecker: React.FC<ConflictCheckerProps> = ({
  selectedClass,
  selectedTerm
}) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Conflict Checker</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Conflict checker will be implemented here
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
