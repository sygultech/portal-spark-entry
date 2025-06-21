
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SubstitutionManagerProps {
  selectedTerm: string;
}

export const SubstitutionManager: React.FC<SubstitutionManagerProps> = ({
  selectedTerm
}) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Substitution Manager</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Substitution management will be implemented here
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
