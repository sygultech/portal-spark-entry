import { useState } from "react";
import { useSubjects } from "@/hooks/useSubjects";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Edit, 
  Trash2, 
  BookOpen, 
  Plus,
  Users,
  Clock
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { SubjectFormDialog } from "./SubjectFormDialog";
import { useToast } from "@/hooks/use-toast";
import AssignTeachersDialog from "./AssignTeachersDialog";
import TimeSlotDialog from "./TimeSlotDialog";

interface SubjectListProps {
  academicYearId: string;
  categoryId?: string;
}

const SubjectList = ({ academicYearId, categoryId }: SubjectListProps) => {
  const { subjects, isLoading, createSubject, updateSubject, deleteSubject } = useSubjects(academicYearId, categoryId);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<any>(null);
  const [isAssignTeacherDialogOpen, setIsAssignTeacherDialogOpen] = useState(false);
  const [isTimeSlotDialogOpen, setIsTimeSlotDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleAddClick = () => {
    setSelectedSubject(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (subject: any) => {
    setSelectedSubject(subject);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (subject: any) => {
    setSelectedSubject(subject);
    setIsDeleteDialogOpen(true);
  };
  
  const handleTeachersClick = (subject: any) => {
    setSelectedSubject(subject);
    setIsAssignTeacherDialogOpen(true);
  };
  
  const handleTimeSlotClick = (subject: any) => {
    setSelectedSubject(subject);
    setIsTimeSlotDialogOpen(true);
  };

  const handleFormSubmit = (data: any) => {
    if (selectedSubject) {
      updateSubject({ id: selectedSubject.id, ...data });
    } else {
      createSubject({
        ...data,
        academic_year_id: academicYearId
      });
    }
    setIsFormOpen(false);
  };

  const handleConfirmDelete = () => {
    if (selectedSubject) {
      deleteSubject(selectedSubject.id);
      setIsDeleteDialogOpen(false);
    }
  };

  const getSubjectTypeBadge = (type: string | null | undefined) => {
    if (!type) return null;
    
    const colorMap: Record<string, string> = {
      'core': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'elective': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      'activity-based': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'language': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      'other': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    };
    
    return (
      <Badge variant="outline" className={colorMap[type] || ''}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    );
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Subjects</CardTitle>
            <CardDescription>Manage your academic subjects</CardDescription>
          </div>
          <Button onClick={handleAddClick}>
            <Plus className="mr-2 h-4 w-4" />
            Add Subject
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-6 text-center text-muted-foreground">
              Loading subjects...
            </div>
          ) : subjects.length === 0 ? (
            <div className="py-10 flex flex-col items-center justify-center gap-4 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground" />
              <div>
                <h3 className="text-lg font-medium">No subjects yet</h3>
                <p className="text-sm text-muted-foreground">
                  Start adding subjects for this academic year.
                </p>
              </div>
              <Button variant="outline" onClick={handleAddClick}>
                <Plus className="mr-2 h-4 w-4" />
                Create Subject
              </Button>
            </div>
          ) : (
            <ScrollArea className="h-[400px] rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Grading</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subjects.map((subject) => (
                    <TableRow key={subject.id}>
                      <TableCell className="font-medium">{subject.name}</TableCell>
                      <TableCell>{subject.code || "-"}</TableCell>
                      <TableCell>
                        {subject.category ? subject.category.name : "-"}
                      </TableCell>
                      <TableCell>
                        {getSubjectTypeBadge(subject.subject_type)}
                      </TableCell>
                      <TableCell>
                        {subject.grading_type ? (
                          <Badge variant="outline">
                            {subject.grading_type}
                            {subject.max_marks ? ` (${subject.max_marks})` : ''}
                          </Badge>
                        ) : "-"}
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button variant="ghost" size="icon" onClick={() => handleTeachersClick(subject)} title="Assign Teachers">
                          <Users className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleTimeSlotClick(subject)} title="Schedule Time Slots">
                          <Clock className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleEditClick(subject)} title="Edit Subject">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(subject)} title="Delete Subject">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <SubjectFormDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        subject={selectedSubject}
      />

      {selectedSubject && (
        <AssignTeachersDialog
          isOpen={isAssignTeacherDialogOpen}
          onClose={() => setIsAssignTeacherDialogOpen(false)}
          subject={selectedSubject}
          academicYearId={academicYearId}
        />
      )}
      
      {selectedSubject && (
        <TimeSlotDialog
          isOpen={isTimeSlotDialogOpen}
          onClose={() => setIsTimeSlotDialogOpen(false)}
          subject={selectedSubject}
        />
      )}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the subject "{selectedSubject?.name}" and all associated data.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default SubjectList;
