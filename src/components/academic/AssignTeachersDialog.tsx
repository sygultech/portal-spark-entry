
import { useState, useEffect } from "react";
import { useTeachers } from "@/hooks/useTeachers";
import { useBatches } from "@/hooks/useBatches";
import { useSubjectTeachers } from "@/hooks/useSubjectTeachers";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, Plus } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface AssignTeachersDialogProps {
  isOpen: boolean;
  onClose: () => void;
  subject: any;
  academicYearId: string;
}

const AssignTeachersDialog = ({ 
  isOpen, 
  onClose, 
  subject,
  academicYearId
}: AssignTeachersDialogProps) => {
  const { teachers, isLoading: teachersLoading } = useTeachers();
  const { batches, isLoading: batchesLoading } = useBatches(academicYearId);
  const { 
    subjectTeachers, 
    isLoading: assignmentsLoading,
    assignTeacher,
    removeTeacher
  } = useSubjectTeachers(subject?.id, undefined, academicYearId);
  
  const [selectedTeacher, setSelectedTeacher] = useState<string>("");
  const [selectedBatch, setSelectedBatch] = useState<string>("");
  
  useEffect(() => {
    if (isOpen) {
      setSelectedTeacher("");
      setSelectedBatch("");
    }
  }, [isOpen]);
  
  const handleAssign = () => {
    if (selectedTeacher && selectedBatch && subject) {
      assignTeacher({
        subject_id: subject.id,
        teacher_id: selectedTeacher,
        batch_id: selectedBatch,
        academic_year_id: academicYearId
      });
      setSelectedTeacher("");
      setSelectedBatch("");
    }
  };
  
  const handleRemove = (assignmentId: string) => {
    removeTeacher(assignmentId);
  };
  
  const isAssigning = teachersLoading || batchesLoading;
  const canAssign = selectedTeacher && selectedBatch;
  
  // Filter out already assigned combinations
  const isAlreadyAssigned = (teacherId: string, batchId: string) => {
    return subjectTeachers.some(
      st => st.teacher_id === teacherId && st.batch_id === batchId
    );
  };

  // Ensure we have teachers and batches to display
  const availableTeachers = teachers.filter(teacher => teacher.role === 'teacher');
  const hasTeachers = availableTeachers.length > 0;
  const hasBatches = batches.length > 0;
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Assign Teachers for {subject?.name}</DialogTitle>
          <DialogDescription>
            Assign teachers to this subject for specific batches
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col md:flex-row gap-4 items-end my-4">
          <div className="flex-1">
            <label className="text-sm font-medium mb-1 block">Select Teacher</label>
            <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a teacher" />
              </SelectTrigger>
              <SelectContent>
                {!hasTeachers ? (
                  <SelectItem value="no-teachers" disabled>No teachers available</SelectItem>
                ) : (
                  availableTeachers.map((teacher) => (
                    <SelectItem 
                      key={teacher.id} 
                      value={teacher.id || "unknown-id"}>
                      {teacher.first_name || ''} {teacher.last_name || ''} ({teacher.email})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex-1">
            <label className="text-sm font-medium mb-1 block">Select Batch/Class</label>
            <Select value={selectedBatch} onValueChange={setSelectedBatch}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a batch" />
              </SelectTrigger>
              <SelectContent>
                {!hasBatches ? (
                  <SelectItem value="no-batches" disabled>No batches available</SelectItem>
                ) : (
                  batches.map((batch) => (
                    <SelectItem 
                      key={batch.id} 
                      value={batch.id || "unknown-id"}
                      disabled={selectedTeacher ? isAlreadyAssigned(selectedTeacher, batch.id) : false}
                    >
                      {batch.name} {batch.code ? `(${batch.code})` : ''}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          
          <Button onClick={handleAssign} disabled={!canAssign || isAssigning}>
            <Plus className="mr-2 h-4 w-4" />
            Assign
          </Button>
        </div>
        
        <Separator className="my-4" />
        
        <div className="text-sm font-medium mb-2">Current Assignments</div>
        
        {assignmentsLoading ? (
          <div className="text-center py-4 text-muted-foreground">Loading assignments...</div>
        ) : subjectTeachers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No teachers assigned to this subject yet
          </div>
        ) : (
          <ScrollArea className="h-[300px] rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Batch/Class</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subjectTeachers.map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell>
                      {assignment.teacher?.first_name || ''} {assignment.teacher?.last_name || ''} <br />
                      <span className="text-xs text-muted-foreground">{assignment.teacher?.email}</span>
                    </TableCell>
                    <TableCell>
                      {assignment.batch?.name} {assignment.batch?.code ? `(${assignment.batch.code})` : ''}
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleRemove(assignment.id)}
                        title="Remove assignment"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
        
        <DialogFooter className="mt-4">
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AssignTeachersDialog;

// force update
