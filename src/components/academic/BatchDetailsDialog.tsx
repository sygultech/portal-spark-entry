
import { useState, useEffect } from "react";
import { useBatchStudents } from "@/hooks/useBatches";
import { Batch } from "@/types/academic";
import AddStudentDialog from "./AddStudentDialog";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Plus, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";

interface BatchDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  batch: Batch;
}

const BatchDetailsDialog = ({
  isOpen,
  onClose,
  batch
}: BatchDetailsDialogProps) => {
  const { students, isLoading, removeStudent } = useBatchStudents(batch?.id);
  const [isAddStudentDialogOpen, setIsAddStudentDialogOpen] = useState(false);
  const [studentToRemove, setStudentToRemove] = useState<{id: string, name: string} | null>(null);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  
  const handleRemoveStudent = (batchStudentId: string, studentName: string) => {
    setStudentToRemove({ id: batchStudentId, name: studentName });
    setIsRemoveDialogOpen(true);
  };
  
  const handleConfirmRemove = () => {
    if (studentToRemove) {
      removeStudent(studentToRemove.id);
      setIsRemoveDialogOpen(false);
    }
  };
  
  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>
              {batch.name} - Students
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Students</h3>
              <Button 
                size="sm" 
                onClick={() => setIsAddStudentDialogOpen(true)}
              >
                <Plus className="mr-1 h-4 w-4" /> Add Student
              </Button>
            </div>
            
            {isLoading ? (
              <div className="py-8 text-center text-muted-foreground">Loading students...</div>
            ) : students.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                No students in this batch. Add students to get started.
              </div>
            ) : (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Roll Number</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead className="w-[80px] text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((batchStudent) => {
                      const student = batchStudent.student;
                      const fullName = `${student.first_name || ''} ${student.last_name || ''}`.trim();
                      
                      return (
                        <TableRow key={batchStudent.id}>
                          <TableCell>{batchStudent.roll_number || "—"}</TableCell>
                          <TableCell className="font-medium">
                            {fullName || "No name"}
                          </TableCell>
                          <TableCell>{student.email}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                              onClick={() => handleRemoveStudent(batchStudent.id, fullName || student.email)}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Remove</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button onClick={onClose}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add Student Dialog */}
      <AddStudentDialog
        isOpen={isAddStudentDialogOpen}
        onClose={() => setIsAddStudentDialogOpen(false)}
        batch={batch}
        existingStudentIds={students.map(s => s.student_id)}
      />
      
      {/* Remove Student Confirmation Dialog */}
      <AlertDialog open={isRemoveDialogOpen} onOpenChange={setIsRemoveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove <span className="font-semibold">{studentToRemove?.name}</span> from this batch.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmRemove}
              className="bg-red-600 hover:bg-red-700"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default BatchDetailsDialog;
