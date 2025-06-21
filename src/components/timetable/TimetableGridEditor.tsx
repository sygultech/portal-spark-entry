
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { useBatches } from '@/hooks/useBatches';
import { useAcademicYears } from '@/hooks/useAcademicYears';
import { useAuth } from '@/contexts/AuthContext';

interface TimetableGridEditorProps {
  selectedClass: string;
  selectedTerm: string;
}

export const TimetableGridEditor: React.FC<TimetableGridEditorProps> = ({
  selectedClass,
  selectedTerm
}) => {
  const { profile } = useAuth();
  const { batches } = useBatches();
  const { academicYears } = useAcademicYears();
  const [selectedBatch, setSelectedBatch] = useState<string>('');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Timetable Grid Editor</CardTitle>
          <div className="flex gap-4">
            <Select value={selectedBatch} onValueChange={setSelectedBatch}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select Batch" />
              </SelectTrigger>
              <SelectContent>
                {batches.map((batch) => (
                  <SelectItem key={batch.id} value={batch.id}>
                    {batch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Period
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Timetable grid editor will be implemented here
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
