
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCourses } from "@/hooks/useCourses";
import { useBatches } from "@/hooks/useBatches";
import { Course, Batch } from "@/types/academic";
import { CourseFormValues } from "./CourseDialog";
import { BatchFormValues } from "./BatchDialog";
import CourseDialog from "./CourseDialog";
import BatchDialog from "./BatchDialog";
import BatchDetailsDialog from "./BatchDetailsDialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Plus, MoreVertical, Pencil, Trash2, Users, Archive, PlusCircle } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CoursesAndBatchesSectionProps {
  academicYearId: string;
  showArchivedBatches?: boolean;
}

const CoursesAndBatchesSection = ({ 
  academicYearId,
  showArchivedBatches = false
}: CoursesAndBatchesSectionProps) => {
  const { profile } = useAuth();
  const { courses, isLoading: isLoadingCourses, createCourse, updateCourse, deleteCourse } = useCourses(academicYearId);
  const { batches, isLoading: isLoadingBatches, createBatch, updateBatch, deleteBatch, toggleArchiveStatus } = useBatches(academicYearId);
  
  const [isCourseDialogOpen, setIsCourseDialogOpen] = useState(false);
  const [isBatchDialogOpen, setIsBatchDialogOpen] = useState(false);
  const [isBatchDetailsDialogOpen, setIsBatchDetailsDialogOpen] = useState(false);
  const [isDeleteCourseDialogOpen, setIsDeleteCourseDialogOpen] = useState(false);
  const [isDeleteBatchDialogOpen, setIsDeleteBatchDialogOpen] = useState(false);
  
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [activeCourseTab, setActiveCourseTab] = useState<string | null>(null);
  const [showingArchived, setShowingArchived] = useState(showArchivedBatches);

  // Filter batches based on selected course and archive status
  const filteredBatches = batches.filter((batch) => {
    const matchesCourse = activeCourseTab ? batch.course_id === activeCourseTab : true;
    const matchesArchiveStatus = showingArchived ? true : !batch.is_archived;
    return matchesCourse && matchesArchiveStatus;
  });

  // Toggle showing archived batches
  const toggleShowArchived = () => {
    setShowingArchived(!showingArchived);
  };
  
  const handleCreateCourseClick = () => {
    setSelectedCourse(null);
    setIsCourseDialogOpen(true);
  };
  
  const handleEditCourseClick = (course: Course) => {
    setSelectedCourse(course);
    setIsCourseDialogOpen(true);
  };
  
  const handleDeleteCourseClick = (course: Course) => {
    setSelectedCourse(course);
    setIsDeleteCourseDialogOpen(true);
  };
  
  const handleCreateBatchClick = (courseId: string) => {
    const course = courses.find((c) => c.id === courseId);
    if (course) {
      setSelectedCourse(course);
      setSelectedBatch(null);
      setIsBatchDialogOpen(true);
    }
  };
  
  const handleEditBatchClick = (batch: Batch) => {
    const course = courses.find((c) => c.id === batch.course_id);
    if (course) {
      setSelectedCourse(course);
      setSelectedBatch(batch);
      setIsBatchDialogOpen(true);
    }
  };
  
  const handleViewBatchDetails = (batch: Batch) => {
    setSelectedBatch(batch);
    setIsBatchDetailsDialogOpen(true);
  };
  
  const handleDeleteBatchClick = (batch: Batch) => {
    setSelectedBatch(batch);
    setIsDeleteBatchDialogOpen(true);
  };
  
  const handleToggleArchive = (batch: Batch) => {
    toggleArchiveStatus({ id: batch.id, isArchived: !batch.is_archived });
  };
  
  const handleSaveCourse = (values: CourseFormValues) => {
    if (!profile?.school_id) return;
    
    if (selectedCourse) {
      updateCourse({
        id: selectedCourse.id,
        ...values
      });
    } else if (academicYearId) {
      createCourse({
        name: values.name,
        code: values.code || undefined,
        duration: values.duration || undefined,
        duration_unit: values.duration_unit || undefined,
        department_id: values.department_id || undefined,
        school_id: profile.school_id,
        academic_year_id: academicYearId
      });
    }
  };
  
  const handleSaveBatch = (values: BatchFormValues) => {
    if (!profile?.school_id || !selectedCourse) return;
    
    if (selectedBatch) {
      updateBatch({
        id: selectedBatch.id,
        ...values
      });
    } else if (academicYearId) {
      createBatch({
        name: values.name,
        code: values.code || undefined,
        capacity: values.capacity || undefined,
        class_teacher_id: values.class_teacher_id || undefined,
        course_id: selectedCourse.id,
        academic_year_id: academicYearId,
        school_id: profile.school_id,
        is_archived: false
      });
    }
  };
  
  const handleConfirmDeleteCourse = () => {
    if (selectedCourse) {
      deleteCourse(selectedCourse.id);
      setIsDeleteCourseDialogOpen(false);
      if (activeCourseTab === selectedCourse.id) {
        setActiveCourseTab(null);
      }
    }
  };
  
  const handleConfirmDeleteBatch = () => {
    if (selectedBatch) {
      deleteBatch(selectedBatch.id);
      setIsDeleteBatchDialogOpen(false);
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Courses & Batches</CardTitle>
          <CardDescription>Manage your school's courses and class batches/sections</CardDescription>
        </div>
        <Button onClick={handleCreateCourseClick} size="sm" className="h-8">
          <Plus className="mr-1 h-4 w-4" /> Add Course
        </Button>
      </CardHeader>
      <CardContent>
        {isLoadingCourses ? (
          <div className="py-6 text-center text-muted-foreground">Loading courses...</div>
        ) : courses.length === 0 ? (
          <div className="py-6 text-center text-muted-foreground">
            No courses found. Create your first course to get started.
          </div>
        ) : (
          <Tabs 
            defaultValue={courses[0]?.id || "all"}
            value={activeCourseTab || "all"}
            onValueChange={(value) => setActiveCourseTab(value === "all" ? null : value)}
          >
            <div className="flex justify-between items-center mb-4">
              <TabsList>
                <TabsTrigger value="all">All Courses</TabsTrigger>
                {courses.map((course) => (
                  <TabsTrigger key={course.id} value={course.id}>{course.name}</TabsTrigger>
                ))}
              </TabsList>
              
              <Button 
                variant={showingArchived ? "secondary" : "outline"} 
                size="sm" 
                onClick={toggleShowArchived}
              >
                <Archive className="mr-1 h-4 w-4" /> 
                {showingArchived ? "Hide Archived" : "Show Archived"}
              </Button>
            </div>

            <TabsContent value="all">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Sections</TableHead>
                    <TableHead className="w-[100px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courses.map((course) => {
                    const courseBatches = batches.filter(b => b.course_id === course.id);
                    const activeBatches = courseBatches.filter(b => !b.is_archived);
                    const archivedBatches = courseBatches.filter(b => b.is_archived);
                    
                    return (
                      <TableRow key={course.id}>
                        <TableCell className="font-medium">{course.name}</TableCell>
                        <TableCell>{course.code || "—"}</TableCell>
                        <TableCell>
                          {course.duration && course.duration_unit 
                            ? `${course.duration} ${course.duration_unit}`
                            : "—"
                          }
                        </TableCell>
                        <TableCell>
                          {course.department?.name || "—"}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1 items-center">
                            <Badge variant="outline">{activeBatches.length} active</Badge>
                            {archivedBatches.length > 0 && (
                              <Badge variant="secondary">{archivedBatches.length} archived</Badge>
                            )}
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6" 
                              onClick={() => handleCreateBatchClick(course.id)}
                            >
                              <PlusCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditCourseClick(course)}>
                                <Pencil className="mr-2 h-4 w-4" /> Edit Course
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleCreateBatchClick(course.id)}>
                                <Plus className="mr-2 h-4 w-4" /> Add Section
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleDeleteCourseClick(course)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-2">All Batches/Sections</h3>
                {isLoadingBatches ? (
                  <div className="py-4 text-center text-muted-foreground">Loading batches...</div>
                ) : filteredBatches.length === 0 ? (
                  <div className="py-4 text-center text-muted-foreground">
                    No batches found. Create your first batch to get started.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Course</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Code</TableHead>
                        <TableHead>Capacity</TableHead>
                        <TableHead>Class Teacher</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-[100px] text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredBatches.map((batch) => {
                        const course = courses.find(c => c.id === batch.course_id);
                        return (
                          <TableRow key={batch.id} className={batch.is_archived ? "opacity-60" : ""}>
                            <TableCell>{course?.name || "—"}</TableCell>
                            <TableCell className="font-medium">{batch.name}</TableCell>
                            <TableCell>{batch.code || "—"}</TableCell>
                            <TableCell>{batch.capacity || "—"}</TableCell>
                            <TableCell>
                              {batch.class_teacher ? 
                                `${batch.class_teacher.first_name || ''} ${batch.class_teacher.last_name || ''}` 
                                : "—"
                              }
                            </TableCell>
                            <TableCell>
                              <Badge variant={batch.is_archived ? "outline" : "default"}>
                                {batch.is_archived ? "Archived" : "Active"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreVertical className="h-4 w-4" />
                                    <span className="sr-only">Open menu</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleViewBatchDetails(batch)}>
                                    <Users className="mr-2 h-4 w-4" /> View Students
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleEditBatchClick(batch)}>
                                    <Pencil className="mr-2 h-4 w-4" /> Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleToggleArchive(batch)}>
                                    <Archive className="mr-2 h-4 w-4" /> 
                                    {batch.is_archived ? "Unarchive" : "Archive"}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() => handleDeleteBatchClick(batch)}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </div>
            </TabsContent>
            
            {courses.map((course) => {
              const courseBatches = batches.filter(
                b => b.course_id === course.id && (showingArchived ? true : !b.is_archived)
              );
              
              return (
                <TabsContent key={course.id} value={course.id}>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">{course.name} - Sections/Batches</h3>
                    <Button onClick={() => handleCreateBatchClick(course.id)} size="sm">
                      <Plus className="mr-1 h-4 w-4" /> Add Section
                    </Button>
                  </div>
                  
                  {isLoadingBatches ? (
                    <div className="py-4 text-center text-muted-foreground">Loading batches...</div>
                  ) : courseBatches.length === 0 ? (
                    <div className="py-4 text-center text-muted-foreground">
                      No batches found for this course. Add a section to get started.
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Code</TableHead>
                          <TableHead>Capacity</TableHead>
                          <TableHead>Class Teacher</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="w-[100px] text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {courseBatches.map((batch) => (
                          <TableRow key={batch.id} className={batch.is_archived ? "opacity-60" : ""}>
                            <TableCell className="font-medium">{batch.name}</TableCell>
                            <TableCell>{batch.code || "—"}</TableCell>
                            <TableCell>{batch.capacity || "—"}</TableCell>
                            <TableCell>
                              {batch.class_teacher ? 
                                `${batch.class_teacher.first_name || ''} ${batch.class_teacher.last_name || ''}` 
                                : "—"
                              }
                            </TableCell>
                            <TableCell>
                              <Badge variant={batch.is_archived ? "outline" : "default"}>
                                {batch.is_archived ? "Archived" : "Active"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreVertical className="h-4 w-4" />
                                    <span className="sr-only">Open menu</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleViewBatchDetails(batch)}>
                                    <Users className="mr-2 h-4 w-4" /> View Students
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleEditBatchClick(batch)}>
                                    <Pencil className="mr-2 h-4 w-4" /> Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleToggleArchive(batch)}>
                                    <Archive className="mr-2 h-4 w-4" /> 
                                    {batch.is_archived ? "Unarchive" : "Archive"}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() => handleDeleteBatchClick(batch)}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </TabsContent>
              );
            })}
          </Tabs>
        )}
      </CardContent>
      
      {/* Course Dialog */}
      {isCourseDialogOpen && (
        <CourseDialog
          isOpen={isCourseDialogOpen}
          onClose={() => setIsCourseDialogOpen(false)}
          onSave={handleSaveCourse}
          course={selectedCourse || undefined}
          academicYearId={academicYearId}
        />
      )}
      
      {/* Batch Dialog */}
      {isBatchDialogOpen && selectedCourse && (
        <BatchDialog
          isOpen={isBatchDialogOpen}
          onClose={() => setIsBatchDialogOpen(false)}
          onSave={handleSaveBatch}
          batch={selectedBatch || undefined}
          course={selectedCourse}
          academicYearId={academicYearId}
        />
      )}
      
      {/* Batch Details Dialog */}
      {isBatchDetailsDialogOpen && selectedBatch && (
        <BatchDetailsDialog
          isOpen={isBatchDetailsDialogOpen}
          onClose={() => setIsBatchDetailsDialogOpen(false)}
          batch={selectedBatch}
        />
      )}
      
      {/* Delete Course Confirmation Dialog */}
      <AlertDialog open={isDeleteCourseDialogOpen} onOpenChange={setIsDeleteCourseDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the course{" "}
              <span className="font-semibold">{selectedCourse?.name}</span> and all its batches/sections.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDeleteCourse}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Delete Batch Confirmation Dialog */}
      <AlertDialog open={isDeleteBatchDialogOpen} onOpenChange={setIsDeleteBatchDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the batch/section{" "}
              <span className="font-semibold">{selectedBatch?.name}</span> and remove all students from it.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDeleteBatch}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default CoursesAndBatchesSection;
