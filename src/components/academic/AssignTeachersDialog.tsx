import { useState, useEffect } from "react";
import { useTeachers } from "@/hooks/useTeachers";
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

interface Teacher {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  avatar_url: string | null;
  school_id: string | null;
  roles: string[];
  created_at: string;
  updated_at: string;
}

interface AssignTeachersDialogProps {
  isOpen: boolean;
  onClose: () => void;
  subject: any;
  academicYearId: string;
  batchId: string;
}

const AssignTeachersDialog = ({ 
  isOpen, 
  onClose, 
  subject,
  academicYearId,
  batchId
}: AssignTeachersDialogProps) => {
  const { teachers, isLoading: teachersLoading } = useTeachers();
  const { 
    subjectTeachers, 
    isLoading: assignmentsLoading,
    addSubjectTeacher,
    removeSubjectTeacher
  } = useSubjectTeachers(subject?.id, batchId, academicYearId);
  
  const [selectedTeacher, setSelectedTeacher] = useState<string>("");
  
  useEffect(() => {
    if (isOpen) {
      setSelectedTeacher("");
    }
  }, [isOpen]);
  
  const handleAssign = () => {
    if (selectedTeacher && subject) {
      addSubjectTeacher(selectedTeacher);
      setSelectedTeacher("");
    }
  };
  
  const handleRemove = (assignmentId: string) => {
    removeSubjectTeacher(assignmentId);
  };
  
  const isAssigning = teachersLoading;
  const canAssign = selectedTeacher;
  
  // Filter out already assigned teachers
  const isAlreadyAssigned = (teacherId: string) => {
    return subjectTeachers.some(
      st => st.teacher_id === teacherId
    );
  };

  // Ensure we have teachers to display
  const availableTeachers = teachers.filter(teacher => 
    teacher.roles?.includes('teacher')
  );
  const hasTeachers = availableTeachers.length > 0;
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Assign Teachers for {subject?.name}</DialogTitle>
          <DialogDescription>
            Assign teachers to this subject
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
                      value={teacher.id}
                      disabled={isAlreadyAssigned(teacher.id)}
                    >
                      {teacher.first_name || ''} {teacher.last_name || ''} ({teacher.email})
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
