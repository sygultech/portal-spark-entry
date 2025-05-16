import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useAcademic } from "@/contexts/AcademicContext";
import { useToast } from "@/hooks/use-toast";
import { useCourses } from "@/hooks/useCourses";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, GraduationCap, School, Users } from "lucide-react";
import { Course, Batch } from "@/types/academic";

const CoursesBatches = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const { currentAcademicYear } = useAcademic();
  
  const { 
    courses, 
    isLoading, 
    createCourse, 
    updateCourse, 
    deleteCourse 
  } = useCourses(currentAcademicYear?.id);
  
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [isCourseDialogOpen, setIsCourseDialogOpen] = useState(false);
  const [isBatchDialogOpen, setIsBatchDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  
  const [courseForm, setCourseForm] = useState({
    name: "",
    description: "",
  });
  
  const [batchForm, setBatchForm] = useState({
    name: "",
    capacity: 30,
    class_teacher_id: "",
  });
  
  // Mock teachers data - in a real app, this would come from a hook/API
  const teachers = [
    { id: "1", name: "John Smith" },
    { id: "2", name: "Jane Doe" },
    { id: "3", name: "Robert Brown" },
  ];
  
  useEffect(() => {
    // When a course is selected, fetch its batches
    // For now, we'll use mock data
    if (selectedCourse) {
      const mockBatches: Batch[] = [
        {
          id: "1",
          name: `${selectedCourse.name} - A`,
          course_id: selectedCourse.id,
          capacity: 30,
          class_teacher_id: "1",
          academic_year_id: currentAcademicYear?.id || "",
          is_active: true,
          is_archived: false,
          school_id: profile?.school_id || "",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "2",
          name: `${selectedCourse.name} - B`,
          course_id: selectedCourse.id,
          capacity: 25,
          class_teacher_id: "2",
          academic_year_id: currentAcademicYear?.id || "",
          is_active: true,
          is_archived: false,
          school_id: profile?.school_id || "",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ];
      
      setBatches(mockBatches);
    } else {
      setBatches([]);
    }
  }, [selectedCourse, currentAcademicYear, profile]);
  
  const handleCourseInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCourseForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleBatchInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setBatchForm((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) : value,
    }));
  };
  
  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile?.school_id || !currentAcademicYear?.id) {
      toast({
        title: "Error",
        description: "Missing required information",
        variant: "destructive"
      });
      return;
    }
    
    try {
      if (editMode && selectedCourse) {
        await updateCourse({
          id: selectedCourse.id,
          course: courseForm
        });
        
        toast({
          title: "Course Updated",
          description: `${courseForm.name} has been updated successfully.`
        });
      } else {
        // Log what we're sending to the API for debugging
        console.log("Creating course with:", {
          ...courseForm,
          school_id: profile.school_id,
          academic_year_id: currentAcademicYear.id,
        });
        
        await createCourse({
          ...courseForm,
          school_id: profile.school_id,
          academic_year_id: currentAcademicYear.id,
        });
        
        toast({
          title: "Course Created",
          description: `${courseForm.name} has been created successfully.`
        });
      }
      
      setCourseForm({ name: "", description: "" });
      setEditMode(false);
      setIsCourseDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save course",
        variant: "destructive"
      });
    }
  };
  
  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCourse || !currentAcademicYear?.id || !profile?.school_id) {
      toast({
        title: "Error",
        description: "Please select a course first",
        variant: "destructive"
      });
      return;
    }
    
    // In a real implementation, this would call a batchService function
    try {
      const newBatch: Batch = {
        id: Date.now().toString(),
        name: batchForm.name,
        capacity: batchForm.capacity,
        class_teacher_id: batchForm.class_teacher_id || null,
        course_id: selectedCourse.id,
        academic_year_id: currentAcademicYear.id,
        is_active: true,
        is_archived: false,
        school_id: profile.school_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      // Update local state for now
      setBatches(prev => [...prev, newBatch]);
      
      toast({
        title: "Batch Created",
        description: `${batchForm.name} has been created successfully.`
      });
      
      setBatchForm({
        name: "",
        capacity: 30,
        class_teacher_id: "",
      });
      
      setIsBatchDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create batch",
        variant: "destructive"
      });
    }
  };
  
  const handleEditCourse = (course: Course) => {
    setCourseForm({
      name: course.name,
      description: course.description || "",
    });
    setSelectedCourse(course);
    setEditMode(true);
    setIsCourseDialogOpen(true);
  };
  
  const handleDeleteCourse = async (id: string) => {
    try {
      await deleteCourse(id);
      
      if (selectedCourse?.id === id) {
        setSelectedCourse(null);
      }
      
      toast({
        title: "Course Deleted",
        description: "The course has been deleted successfully."
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete course",
        variant: "destructive"
      });
    }
  };
  
  const handleDeleteBatch = async (id: string) => {
    // In a real implementation, this would call a batchService function
    try {
      // Update local state for now
      setBatches(prev => prev.filter(batch => batch.id !== id));
      
      toast({
        title: "Batch Deleted",
        description: "The batch has been deleted successfully."
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete batch",
        variant: "destructive"
      });
    }
  };
  
  const openAddCourseDialog = () => {
    setCourseForm({ name: "", description: "" });
    setEditMode(false);
    setIsCourseDialogOpen(true);
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-1">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Courses</span>
              <Dialog open={isCourseDialogOpen} onOpenChange={setIsCourseDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" onClick={openAddCourseDialog}>Add Course</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editMode ? "Edit Course" : "Create New Course"}</DialogTitle>
                    <DialogDescription>
                      {editMode ? "Update course details" : "Add a new course to your academic structure"}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateCourse}>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="name">Course Name</Label>
                        <Input
                          id="name"
                          name="name"
                          value={courseForm.name}
                          onChange={handleCourseInputChange}
                          placeholder="e.g. Grade 1, Science Stream, etc."
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="description">Description (Optional)</Label>
                        <textarea
                          id="description"
                          name="description"
                          value={courseForm.description}
                          onChange={handleCourseInputChange}
                          placeholder="Brief description of this course"
                          className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit">{editMode ? "Update" : "Create"} Course</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardTitle>
            <CardDescription>
              {currentAcademicYear ? 
                `Courses for ${currentAcademicYear.name}` : 
                "Please select an academic year"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center p-4">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : !currentAcademicYear ? (
              <div className="flex flex-col items-center text-center p-4">
                <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">Select an academic year first</p>
              </div>
            ) : courses.length === 0 ? (
              <div className="flex flex-col items-center text-center p-4">
                <School className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No courses defined yet</p>
              </div>
            ) : (
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-2">
                  {courses.map((course) => (
                    <div
                      key={course.id}
                      className={`p-3 rounded-md cursor-pointer transition-colors ${
                        selectedCourse?.id === course.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted hover:bg-muted/80"
                      }`}
                      onClick={() => setSelectedCourse(course)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <School className="h-4 w-4" />
                          <span className="font-medium">{course.name}</span>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditCourse(course);
                            }}
                            className={`p-1 rounded-full ${
                              selectedCourse?.id === course.id
                                ? "hover:bg-primary-foreground/20 text-primary-foreground"
                                : "hover:bg-background text-muted-foreground"
                            }`}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteCourse(course.id);
                            }}
                            className={`p-1 rounded-full ${
                              selectedCourse?.id === course.id
                                ? "hover:bg-primary-foreground/20 text-primary-foreground"
                                : "hover:bg-background text-muted-foreground"
                            }`}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M3 6h18"></path>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                          </button>
                        </div>
                      </div>
                      {course.description && (
                        <p className={`text-xs mt-1 line-clamp-2 ${
                          selectedCourse?.id === course.id
                            ? "text-primary-foreground/80"
                            : "text-muted-foreground"
                        }`}>
                          {course.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="md:col-span-2">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>{selectedCourse ? `Batches - ${selectedCourse.name}` : "Batches"}</span>
              <Dialog open={isBatchDialogOpen} onOpenChange={setIsBatchDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    size="sm" 
                    disabled={!selectedCourse}
                  >
                    Add Batch
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Batch</DialogTitle>
                    <DialogDescription>
                      Add a new batch to {selectedCourse?.name}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateBatch}>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="name">Batch Name</Label>
                        <Input
                          id="name"
                          name="name"
                          value={batchForm.name}
                          onChange={handleBatchInputChange}
                          placeholder="e.g. Section A, Morning Batch, etc."
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="capacity">Capacity</Label>
                        <Input
                          id="capacity"
                          name="capacity"
                          type="number"
                          value={batchForm.capacity}
                          onChange={handleBatchInputChange}
                          min="1"
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="class_teacher_id">Class Teacher (Optional)</Label>
                        <select
                          id="class_teacher_id"
                          name="class_teacher_id"
                          value={batchForm.class_teacher_id}
                          onChange={handleBatchInputChange}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="">Select a teacher</option>
                          {teachers.map((teacher) => (
                            <option key={teacher.id} value={teacher.id}>
                              {teacher.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit">Create Batch</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardTitle>
            <CardDescription>
              {selectedCourse ? 
                `Manage batches for ${selectedCourse.name}` : 
                "Select a course to manage its batches"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center p-4">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : !selectedCourse ? (
              <div className="flex flex-col items-center justify-center text-center p-8">
                <School className="h-12 w-12 text-muted-foreground mb-2" />
                <p className="text-lg font-medium">No Course Selected</p>
                <p className="text-muted-foreground mt-1">
                  Select a course from the left panel to view or manage its batches.
                </p>
              </div>
            ) : batches.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center p-8">
                <Users className="h-12 w-12 text-muted-foreground mb-2" />
                <p className="text-lg font-medium">No Batches Found</p>
                <p className="text-muted-foreground mt-1">
                  This course doesn't have any batches yet. Create your first batch.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {batches.map((batch) => (
                  <Card key={batch.id} className="overflow-hidden">
                    <div className="bg-primary/10 p-4 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        <h3 className="font-semibold">{batch.name}</h3>
                      </div>
                      <Badge variant={batch.is_active ? "default" : "secondary"}>
                        {batch.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Capacity:</span>
                        <span className="font-medium">{batch.capacity} students</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Class Teacher:</span>
                        <span className="font-medium">
                          {batch.class_teacher_id ? 
                            teachers.find(t => t.id === batch.class_teacher_id)?.name || "Unknown" : 
                            "Not Assigned"
                          }
                        </span>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2 p-4 pt-0 border-t">
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteBatch(batch.id)}
                        className="text-destructive hover:bg-destructive/10"
                      >
                        Delete
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CoursesBatches;
