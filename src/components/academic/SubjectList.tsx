import { useState, useMemo } from "react";
import { useSubjects } from "@/hooks/useSubjects";
import { useCourses } from "@/hooks/useCourses";
import { useBatches } from "@/hooks/useBatches";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Edit, 
  BookOpen, 
  Users,
  Clock,
  Archive,
  Trash,
  ChevronDown,
  ChevronRight,
  Plus,
  AlertCircle,
  School,
  GraduationCap,
  Users2
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
import { useToast } from "@/hooks/use-toast";
import AssignTeachersDialog from "./AssignTeachersDialog";
import TimeSlotDialog from "./TimeSlotDialog";
import { SubjectFormDialog } from "./SubjectFormDialog";
import { getSubjectDependencies, archiveSubject, deleteSubject } from "@/services/subjectService";
import { Subject } from "@/types/academic";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SubjectListProps {
  academicYearId: string;
  categoryId?: string;
}

interface GroupedSubjects {
  [courseId: string]: {
    courseName: string;
    batches: {
      [batchId: string]: {
        batchName: string;
        subjects: Subject[];
      };
    };
  };
}

const SubjectList = ({ academicYearId, categoryId }: SubjectListProps) => {
  const { profile } = useAuth();
  const [showArchived, setShowArchived] = useState(false);
  const { subjects, isLoading, createSubject, updateSubject } = useSubjects(academicYearId, categoryId, showArchived);
  const { courses } = useCourses(academicYearId);
  const { batches } = useBatches(academicYearId);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [isAssignTeacherDialogOpen, setIsAssignTeacherDialogOpen] = useState(false);
  const [isTimeSlotDialogOpen, setIsTimeSlotDialogOpen] = useState(false);
  const [isSubjectFormOpen, setIsSubjectFormOpen] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set());
  const [dependencies, setDependencies] = useState<{
    batchAssignments: number;
    teacherAssignments: number;
    timeSlots: number;
    batches: { id: string; course_name: string; name: string }[];
  } | null>(null);
  const { toast } = useToast();

  // Group subjects by course and batch
  const groupedSubjects = useMemo(() => {
    const grouped: GroupedSubjects = {};

    // Initialize courses
    courses.forEach(course => {
      grouped[course.id] = {
        courseName: course.name,
        batches: {}
      };
    });

    // Initialize batches within courses
    batches.forEach(batch => {
      if (grouped[batch.course_id]) {
        grouped[batch.course_id].batches[batch.id] = {
          batchName: batch.name,
          subjects: []
        };
      }
    });

    // Group subjects into their respective batches
    subjects.forEach(subject => {
      subject.batch_assignments?.forEach(assignment => {
        const batch = batches.find(b => b.id === assignment.batch_id);
        if (batch) {
          if (!grouped[batch.course_id]) {
            const course = courses.find(c => c.id === batch.course_id);
            grouped[batch.course_id] = {
              courseName: course?.name || 'Unknown Course',
              batches: {}
            };
          }
          if (!grouped[batch.course_id].batches[batch.id]) {
            grouped[batch.course_id].batches[batch.id] = {
              batchName: batch.name,
              subjects: []
            };
          }
          grouped[batch.course_id].batches[batch.id].subjects.push(subject);
        }
      });
    });

    return grouped;
  }, [subjects, courses, batches]);

  const handleCreateSubject = async (data: any) => {
    try {
      if (!profile?.school_id) {
        toast({
          title: "Error",
          description: "Required information missing",
          variant: "destructive"
        });
        return;
      }

      const subjectData = {
        name: data.name,
        code: data.code,
        description: data.description,
        category_id: data.category_id || null,
        subject_type: data.subject_type,
        academic_year_id: academicYearId,
        school_id: profile.school_id
      };

      if (selectedSubject) {
        // Update existing subject
        await updateSubject({
          ...subjectData,
          id: selectedSubject.id
        });
      } else {
        // Create new subject with batch assignment
        if (!selectedBatchId) {
          toast({
            title: "Error",
            description: "Batch selection is required",
            variant: "destructive"
          });
          return;
        }

        await createSubject({
          ...subjectData,
          batch_assignments: [{
            batch_id: selectedBatchId,
            is_mandatory: data.is_mandatory ?? true
          }]
        });
      }

      setIsSubjectFormOpen(false);
      setSelectedBatchId(null);
      setSelectedSubject(null);
      toast({
        title: "Success",
        description: selectedSubject ? "Subject updated successfully" : "Subject created successfully"
      });
    } catch (error: any) {
      console.error(selectedSubject ? "Error updating subject:" : "Error creating subject:", error);
      toast({
        title: "Error",
        description: error.message || (selectedSubject ? "Failed to update subject" : "Failed to create subject"),
        variant: "destructive"
      });
    }
  };

  const handleEditClick = (subject: Subject) => {
    setSelectedSubject(subject);
    setIsSubjectFormOpen(true);
  };

  const handleArchiveClick = async (subject: Subject) => {
    try {
      const deps = await getSubjectDependencies(subject.id);
      setDependencies(deps);
      setSelectedSubject(subject);
      setIsArchiveDialogOpen(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to check subject dependencies",
        variant: "destructive"
      });
    }
  };

  const handleDeleteClick = async (subject: Subject) => {
    try {
      const deps = await getSubjectDependencies(subject.id);
      setDependencies(deps);
      setSelectedSubject(subject);
      setIsDeleteDialogOpen(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to check subject dependencies",
        variant: "destructive"
      });
    }
  };

  const handleTeachersClick = (subject: Subject) => {
    setSelectedSubject(subject);
    setIsAssignTeacherDialogOpen(true);
  };
  
  const handleTimeSlotClick = (subject: Subject) => {
    setSelectedSubject(subject);
    setIsTimeSlotDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedSubject) return;
    try {
      await deleteSubject(selectedSubject.id);
      toast({
        title: "Success",
        description: "Subject deleted successfully"
      });
      setIsDeleteDialogOpen(false);
      setSelectedSubject(null);
      setDependencies(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete subject",
        variant: "destructive"
      });
    }
  };

  const confirmArchive = async () => {
    if (!selectedSubject) return;
    try {
      await archiveSubject(selectedSubject.id);
      toast({
        title: "Success",
        description: "Subject archived successfully"
      });
      setIsArchiveDialogOpen(false);
      setSelectedSubject(null);
      setDependencies(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to archive subject",
        variant: "destructive"
      });
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

  const toggleCourse = (courseId: string) => {
    const newExpanded = new Set(expandedCourses);
    if (newExpanded.has(courseId)) {
      newExpanded.delete(courseId);
    } else {
      newExpanded.add(courseId);
    }
    setExpandedCourses(newExpanded);
  };

  // Check for empty states
  const hasNoAcademicYear = !academicYearId;
  const hasNoCourses = courses.length === 0;
  const hasNoBatches = batches.length === 0;
  const hasNoSubjects = subjects.length === 0;

  // Render empty state message
  const renderEmptyState = (
    icon: React.ReactNode,
    title: string,
    description: string,
    action?: React.ReactNode
  ) => (
    <div className="py-10 flex flex-col items-center justify-center gap-4 text-center">
      {icon}
      <div>
        <h3 className="text-lg font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>
      {action}
    </div>
  );

  // If no academic year is selected
  if (hasNoAcademicYear) {
    return (
      <Card>
        <CardContent>
          {renderEmptyState(
            <School className="h-12 w-12 text-muted-foreground" />,
            "No Academic Year Selected",
            "Please select an academic year to view and manage subjects.",
          )}
        </CardContent>
      </Card>
    );
  }

  // If loading
  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <div className="py-6 text-center text-muted-foreground">
            Loading subjects...
          </div>
        </CardContent>
      </Card>
    );
  }

  // If no courses exist
  if (hasNoCourses) {
    return (
      <Card>
        <CardContent>
          {renderEmptyState(
            <GraduationCap className="h-12 w-12 text-muted-foreground" />,
            "No Courses Found",
            "Create courses first to start managing subjects.",
            <Alert className="max-w-md mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Go to Course Management to create your first course.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    );
  }

  // If no batches exist
  if (hasNoBatches) {
    return (
      <Card>
        <CardContent>
          {renderEmptyState(
            <Users2 className="h-12 w-12 text-muted-foreground" />,
            "No Batches Found",
            "Create batches within courses to start managing subjects.",
            <Alert className="max-w-md mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Go to Course Management to create batches for your courses.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Subjects by Course & Batch</CardTitle>
            <CardDescription>Manage subjects for each batch in your courses</CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="show-archived"
                checked={showArchived}
                onCheckedChange={(checked) => setShowArchived(checked as boolean)}
              />
              <label
                htmlFor="show-archived"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Show Archived
              </label>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              {Object.entries(groupedSubjects).map(([courseId, courseData]) => (
                <Collapsible
                  key={courseId}
                  open={expandedCourses.has(courseId)}
                  onOpenChange={() => toggleCourse(courseId)}
                >
                  <Card>
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover:bg-muted/50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            {expandedCourses.has(courseId) ? (
                              <ChevronDown className="h-4 w-4 mr-2" />
                            ) : (
                              <ChevronRight className="h-4 w-4 mr-2" />
                            )}
                            <CardTitle className="text-lg">{courseData.courseName}</CardTitle>
                          </div>
                          <Badge variant="outline" className="ml-2">
                            {Object.keys(courseData.batches).length} {Object.keys(courseData.batches).length === 1 ? 'Batch' : 'Batches'}
                          </Badge>
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="pt-0">
                        <div className="grid gap-4">
                          {Object.entries(courseData.batches).map(([batchId, batchData]) => (
                            <Card key={batchId} className="border border-muted">
                              <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                  <CardTitle className="text-base flex items-center gap-2">
                                    {batchData.batchName}
                                    <Badge variant="outline" className="ml-2">
                                      {batchData.subjects.length} {batchData.subjects.length === 1 ? 'Subject' : 'Subjects'}
                                    </Badge>
                                  </CardTitle>
                                </div>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => {
                                    setSelectedBatchId(batchId);
                                    setIsSubjectFormOpen(true);
                                  }}
                                >
                                  <Plus className="h-4 w-4 mr-2" />
                                  Add Subject
                                </Button>
                              </CardHeader>
                              <CardContent>
                                {batchData.subjects.length === 0 ? (
                                  <div className="py-8 flex flex-col items-center justify-center text-center border-2 border-dashed rounded-lg">
                                    <BookOpen className="h-8 w-8 text-muted-foreground mb-2" />
                                    <p className="text-sm text-muted-foreground">
                                      No subjects in this batch yet
                                    </p>
                                    <Button 
                                      variant="link" 
                                      size="sm"
                                      onClick={() => {
                                        setSelectedBatchId(batchId);
                                        setIsSubjectFormOpen(true);
                                      }}
                                    >
                                      Add your first subject
                                    </Button>
                                  </div>
                                ) : (
                                  <div className="grid gap-2">
                                    {batchData.subjects.map((subject) => (
                                      <div
                                        key={subject.id}
                                        className={`p-3 rounded-lg border ${
                                          subject.is_archived ? "opacity-60 bg-muted" : "bg-card"
                                        }`}
                                      >
                                        <div className="flex items-start justify-between">
                                          <div>
                                            <div className="font-medium flex items-center gap-2">
                                              {subject.name}
                                              {subject.is_archived && (
                                                <Badge variant="outline">Archived</Badge>
                                              )}
                                              {getSubjectTypeBadge(subject.subject_type)}
                                            </div>
                                            <div className="text-sm text-muted-foreground mt-1">
                                              {subject.code && <div>Code: {subject.code}</div>}
                                              {subject.category?.name && (
                                                <div>Category: {subject.category.name}</div>
                                              )}
                                            </div>
                                          </div>
                                          <div className="flex gap-1">
                                            <DropdownMenu>
                                              <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                  <Users className="h-4 w-4" />
                                                </Button>
                                              </DropdownMenuTrigger>
                                              <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleTeachersClick(subject)}>
                                                  <Users className="h-4 w-4 mr-2" />
                                                  Assign Teachers
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleTimeSlotClick(subject)}>
                                                  <Clock className="h-4 w-4 mr-2" />
                                                  Schedule Time Slots
                                                </DropdownMenuItem>
                                              </DropdownMenuContent>
                                            </DropdownMenu>
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              onClick={() => handleEditClick(subject)}
                                            >
                                              <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              onClick={() => handleArchiveClick(subject)}
                                            >
                                              <Archive className="h-4 w-4" />
                                            </Button>
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              onClick={() => handleDeleteClick(subject)}
                                              className="text-destructive"
                                            >
                                              <Trash className="h-4 w-4" />
                                            </Button>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

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
            <AlertDialogTitle>Delete Subject</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedSubject?.name}?
              {dependencies && (
                <div className="mt-4">
                  <p>This subject is assigned to:</p>
                  <ul className="list-disc list-inside mt-2">
                    {dependencies.batches.map(batch => (
                      <li key={batch.id} className="mb-1">
                        <span className="font-medium">{batch.course_name}</span> - {batch.name}
                      </li>
                    ))}
                    {dependencies.teacherAssignments > 0 && (
                      <li>{dependencies.teacherAssignments} teacher assignment(s)</li>
                    )}
                    {dependencies.timeSlots > 0 && (
                      <li>{dependencies.timeSlots} time slot(s)</li>
                    )}
                  </ul>
                  <p className="mt-2 text-destructive font-medium">All these associations will be removed.</p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isArchiveDialogOpen} onOpenChange={setIsArchiveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive Subject</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to archive {selectedSubject?.name}?
              {dependencies && (
                <div className="mt-4">
                  <p>This subject is assigned to:</p>
                  <ul className="list-disc list-inside mt-2">
                    {dependencies.batches.map(batch => (
                      <li key={batch.id} className="mb-1">
                        <span className="font-medium">{batch.course_name}</span> - {batch.name}
                      </li>
                    ))}
                    {dependencies.teacherAssignments > 0 && (
                      <li>{dependencies.teacherAssignments} teacher assignment(s)</li>
                    )}
                    {dependencies.timeSlots > 0 && (
                      <li>{dependencies.timeSlots} time slot(s)</li>
                    )}
                  </ul>
                  <p className="mt-2">The subject will be archived but all associations will remain intact.</p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmArchive}>
              Archive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <SubjectFormDialog
        isOpen={isSubjectFormOpen}
        onClose={() => {
          setIsSubjectFormOpen(false);
          setSelectedBatchId(null);
          setSelectedSubject(null);
        }}
        onSubmit={handleCreateSubject}
        academicYearId={academicYearId}
        subject={selectedSubject}
      />
    </>
  );
};

export default SubjectList;
