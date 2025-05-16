
// Ensure no SelectItem has an empty string value
import React, { useState } from 'react';
import { useBatchSubjects } from '@/hooks/useBatchSubjects';
import { useSubjects } from '@/hooks/useSubjects';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Batch, Subject } from '@/types/academic';
import { useToast } from '@/hooks/use-toast';
import { Trash2 } from 'lucide-react';

interface BatchSubjectTabProps {
  batch: Batch;
  academicYearId: string;
}

const BatchSubjectTab: React.FC<BatchSubjectTabProps> = ({ 
  batch, 
  academicYearId 
}) => {
  const { subjects: allSubjects, isLoading: isLoadingSubjects } = useSubjects(academicYearId);
  const { batchSubjects, addBatchSubject, removeBatchSubject, isLoading } = useBatchSubjects(batch.id);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const { toast } = useToast();

  // Filter out subjects already added to the batch
  const availableSubjects = allSubjects.filter(subject => 
    !batchSubjects.some(bs => bs.subject_id === subject.id)
  );

  const handleAddSubject = async () => {
    if (!selectedSubjectId) {
      toast({
        title: "Error",
        description: "Please select a subject to add",
        variant: "destructive"
      });
      return;
    }

    try {
      await addBatchSubject(selectedSubjectId);
      setSelectedSubjectId("");
      toast({
        title: "Success",
        description: "Subject added to the batch successfully",
      });
    } catch (error) {
      console.error("Error adding subject to batch:", error);
      toast({
        title: "Error",
        description: "Failed to add subject to the batch",
        variant: "destructive"
      });
    }
  };

  const handleRemoveSubject = async (batchSubjectId: string) => {
    try {
      await removeBatchSubject(batchSubjectId);
      toast({
        title: "Success",
        description: "Subject removed from the batch successfully",
      });
    } catch (error) {
      console.error("Error removing subject from batch:", error);
      toast({
        title: "Error",
        description: "Failed to remove subject from the batch",
        variant: "destructive"
      });
    }
  };

  const getSubjectById = (subjectId: string) => {
    return allSubjects.find(s => s.id === subjectId);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium mb-2">Add Subject to Batch</h3>
        <div className="flex space-x-2">
          <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId}>
            <SelectTrigger className="w-[300px]">
              <SelectValue placeholder="Select a subject" />
            </SelectTrigger>
            <SelectContent>
              {availableSubjects.length === 0 ? (
                <SelectItem value="no-subjects" disabled>No available subjects</SelectItem>
              ) : (
                availableSubjects.map(subject => (
                  <SelectItem key={subject.id} value={subject.id || "unknown-id"}>
                    {subject.name} {subject.code ? `(${subject.code})` : ''}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          <Button 
            onClick={handleAddSubject} 
            disabled={!selectedSubjectId || selectedSubjectId === "no-subjects"}
          >
            Add Subject
          </Button>
        </div>
      </div>
      
      <Separator className="my-4" />
      
      <div>
        <h3 className="text-lg font-medium mb-2">Batch Subjects</h3>
        {isLoading ? (
          <div className="text-center py-4">Loading batch subjects...</div>
        ) : batchSubjects.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No subjects have been added to this batch yet.
          </div>
        ) : (
          <div className="space-y-2">
            {batchSubjects.map((batchSubject) => {
              const subject = getSubjectById(batchSubject.subject_id);
              return (
                <div 
                  key={batchSubject.id}
                  className="flex items-center justify-between p-3 rounded-md border"
                >
                  <div>
                    <div className="font-medium">
                      {subject?.name || "Unknown Subject"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {subject?.code && `Code: ${subject.code}`}
                      {(subject?.category_id && subject?.category?.name) && ` • Category: ${subject.category.name}`}
                      {subject?.subject_type && ` • Type: ${subject.subject_type}`}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveSubject(batchSubject.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default BatchSubjectTab;
