
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext"; 
import { useBatchStudents } from "@/hooks/useBatches";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, BookOpen } from "lucide-react";
import AddStudentDialog from "./AddStudentDialog";
import { Batch } from "@/types/academic";
import BatchSubjectTab from "./BatchSubjectTab";

interface BatchDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  batch: Batch & {
    class_teacher?: { id: string; first_name: string; last_name: string } | null;
  };
  academicYearId: string;
}

const BatchDetailsDialog = ({
  isOpen,
  onClose,
  batch,
  academicYearId
}: BatchDetailsDialogProps) => {
  const { profile } = useAuth();
  const { students, isLoading, addStudent, removeStudent, ensureTable } = useBatchStudents(batch?.id);
  const [isAddStudentDialogOpen, setIsAddStudentDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("students");

  const handleAddStudent = async (studentId: string, rollNumber?: string) => {
    if (!batch) return;
    
    try {
      // First ensure the batch_students table exists
      await ensureTable({
        operation: 'insert',
        data: {
          batch_id: batch.id,
          student_id: studentId,
          roll_number: rollNumber || null
        }
      });
      
      // Then add the student
      addStudent({ studentId, rollNumber });
      setIsAddStudentDialogOpen(false);
    } catch (error) {
      console.error("Error adding student to batch:", error);
    }
  };
  
  const handleRemoveStudent = async (batchStudentId: string) => {
    if (!batch) return;
    
    try {
      removeStudent(batchStudentId);
    } catch (error) {
      console.error("Error removing student from batch:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{batch?.name} Details</DialogTitle>
          <DialogDescription>
            {batch?.code ? `Code: ${batch.code}` : ""} 
            {batch?.capacity ? ` • Capacity: ${batch.capacity}` : ""}
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="students" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="students" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Students
            </TabsTrigger>
            <TabsTrigger value="subjects" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Subjects
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="students" className="space-y-4 pt-4">
            <div className="flex justify-end">
              <Button onClick={() => setIsAddStudentDialogOpen(true)}>
                Add Student
              </Button>
            </div>
            
            {/* Students content */}
            <div className="rounded-md border">
              {isLoading ? (
                <div className="p-8 text-center">Loading students...</div>
              ) : students.length === 0 ? (
                <div className="p-8 text-center">
                  No students enrolled in this batch yet.
                </div>
              ) : (
                <div className="relative w-full overflow-auto">
                  <table className="w-full caption-bottom text-sm">
                    <thead>
                      <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                        <th className="h-12 px-4 text-left align-middle font-medium">Roll No</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Name</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Email</th>
                        <th className="h-12 px-4 text-right align-middle font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student) => (
                        <tr key={student.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                          <td className="p-4 align-middle">{student.roll_number || "-"}</td>
                          <td className="p-4 align-middle">
                            {student.student?.first_name} {student.student?.last_name}
                          </td>
                          <td className="p-4 align-middle">{student.student?.email}</td>
                          <td className="p-4 text-right align-middle">
                            <Button variant="ghost" size="sm" onClick={() => handleRemoveStudent(student.id)}>
                              Remove
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="subjects" className="pt-4">
            <BatchSubjectTab batch={batch} academicYearId={academicYearId} />
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>

      <AddStudentDialog
        isOpen={isAddStudentDialogOpen}
        onClose={() => setIsAddStudentDialogOpen(false)}
        onSubmit={handleAddStudent}
        existingStudentIds={students.map(s => s.student_id)}
        batch={batch}
      />
    </Dialog>
  );
};

export default BatchDetailsDialog;
