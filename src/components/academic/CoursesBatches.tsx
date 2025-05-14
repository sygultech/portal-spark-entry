
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { School, Users } from "lucide-react";

interface Course {
  id: string;
  name: string;
  description: string;
  academic_year_id: string;
  school_id: string;
}

interface Batch {
  id: string;
  name: string;
  course_id: string;
  capacity: number;
  class_teacher_id: string | null;
  academic_year_id: string;
  is_active: boolean;
}

interface Teacher {
  id: string;
  name: string;
}

const CoursesBatches = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [courseDialogOpen, setCourseDialogOpen] = useState(false);
  const [batchDialogOpen, setBatchDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("courses");
  
  // Mock data for academic years and teachers
  const academicYears = [
    { id: "1", name: "2024-2025" },
    { id: "2", name: "2023-2024" },
  ];
  
  const teachers: Teacher[] = [
    { id: "1", name: "John Smith" },
    { id: "2", name: "Jane Doe" },
    { id: "3", name: "Robert Brown" },
  ];
  
  const [courseForm, setCourseForm] = useState({
    name: "",
    description: "",
    academic_year_id: academicYears[0].id,
  });
  
  const [batchForm, setBatchForm] = useState({
    name: "",
    course_id: "",
    capacity: 30,
    class_teacher_id: "",
    academic_year_id: academicYears[0].id,
  });

  const fetchCourses = async () => {
    try {
      setLoading(true);
      
      // Mock data - in a real implementation this would fetch from Supabase
      const mockCourses: Course[] = [
        {
          id: "1",
          name: "Grade 1",
          description: "First grade elementary",
          academic_year_id: "1",
          school_id: profile?.school_id || "",
        },
        {
          id: "2",
          name: "Grade 2",
          description: "Second grade elementary",
          academic_year_id: "1",
          school_id: profile?.school_id || "",
        },
        {
          id: "3",
          name: "Grade 3",
          description: "Third grade elementary",
          academic_year_id: "1",
          school_id: profile?.school_id || "",
        },
      ];
      
      setCourses(mockCourses);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast({
        title: "Error",
        description: "Failed to fetch courses. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const fetchBatches = async () => {
    try {
      setLoading(true);
      
      // Mock data - in a real implementation this would fetch from Supabase
      const mockBatches: Batch[] = [
        {
          id: "1",
          name: "Grade 1 - A",
          course_id: "1",
          capacity: 30,
          class_teacher_id: "1",
          academic_year_id: "1",
          is_active: true,
        },
        {
          id: "2",
          name: "Grade 1 - B",
          course_id: "1", 
          capacity: 30,
          class_teacher_id: "2",
          academic_year_id: "1",
          is_active: true,
        },
        {
          id: "3",
          name: "Grade 2 - A",
          course_id: "2",
          capacity: 35,
          class_teacher_id: "3",
          academic_year_id: "1",
          is_active: true,
        },
      ];
      
      setBatches(mockBatches);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching batches:", error);
      toast({
        title: "Error",
        description: "Failed to fetch batches. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  // Initial data fetch
  useState(() => {
    fetchCourses();
    fetchBatches();
  });

  const handleCourseInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCourseForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCourseSelectChange = (name: string, value: string) => {
    setCourseForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBatchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBatchForm((prev) => ({
      ...prev,
      [name]: name === "capacity" ? parseInt(value) || 0 : value,
    }));
  };

  const handleBatchSelectChange = (name: string, value: string) => {
    setBatchForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real implementation, this would save to Supabase
    const newCourse: Course = {
      id: Date.now().toString(),
      ...courseForm,
      school_id: profile?.school_id || "",
    };

    setCourses((prev) => [...prev, newCourse]);
    setCourseDialogOpen(false);
    toast({
      title: "Course created",
      description: `${courseForm.name} has been added successfully.`,
    });
    
    // Reset form
    setCourseForm({
      name: "",
      description: "",
      academic_year_id: academicYears[0].id,
    });
  };

  const handleBatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real implementation, this would save to Supabase
    const newBatch: Batch = {
      id: Date.now().toString(),
      ...batchForm,
      is_active: true,
    };

    setBatches((prev) => [...prev, newBatch]);
    setBatchDialogOpen(false);
    toast({
      title: "Batch created",
      description: `${batchForm.name} has been added successfully.`,
    });
    
    // Reset form
    setBatchForm({
      name: "",
      course_id: "",
      capacity: 30,
      class_teacher_id: "",
      academic_year_id: academicYears[0].id,
    });
  };

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="batches">Batches</TabsTrigger>
          </TabsList>
          
          {activeTab === "courses" ? (
            <Dialog open={courseDialogOpen} onOpenChange={setCourseDialogOpen}>
              <DialogTrigger asChild>
                <Button>Add New Course</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Course</DialogTitle>
                  <DialogDescription>
                    Add a new course to your academic structure.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCourseSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Course Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={courseForm.name}
                        onChange={handleCourseInputChange}
                        placeholder="e.g. Grade 1"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">Description</Label>
                      <Input
                        id="description"
                        name="description"
                        value={courseForm.description}
                        onChange={handleCourseInputChange}
                        placeholder="Course description"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="academic_year_id">Academic Year</Label>
                      <Select
                        value={courseForm.academic_year_id}
                        onValueChange={(value) => handleCourseSelectChange("academic_year_id", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select academic year" />
                        </SelectTrigger>
                        <SelectContent>
                          {academicYears.map((year) => (
                            <SelectItem key={year.id} value={year.id}>
                              {year.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Create Course</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          ) : (
            <Dialog open={batchDialogOpen} onOpenChange={setBatchDialogOpen}>
              <DialogTrigger asChild>
                <Button>Add New Batch</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Batch</DialogTitle>
                  <DialogDescription>
                    Add a new batch to a course.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleBatchSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="course_id">Course</Label>
                      <Select
                        value={batchForm.course_id}
                        onValueChange={(value) => handleBatchSelectChange("course_id", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select course" />
                        </SelectTrigger>
                        <SelectContent>
                          {courses.map((course) => (
                            <SelectItem key={course.id} value={course.id}>
                              {course.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="name">Batch Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={batchForm.name}
                        onChange={handleBatchInputChange}
                        placeholder="e.g. Grade 1 - A"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="capacity">Capacity</Label>
                      <Input
                        id="capacity"
                        name="capacity"
                        type="number"
                        min="1"
                        value={batchForm.capacity}
                        onChange={handleBatchInputChange}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="class_teacher_id">Class Teacher</Label>
                      <Select
                        value={batchForm.class_teacher_id}
                        onValueChange={(value) => handleBatchSelectChange("class_teacher_id", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select teacher" />
                        </SelectTrigger>
                        <SelectContent>
                          {teachers.map((teacher) => (
                            <SelectItem key={teacher.id} value={teacher.id}>
                              {teacher.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="academic_year_id">Academic Year</Label>
                      <Select
                        value={batchForm.academic_year_id}
                        onValueChange={(value) => handleBatchSelectChange("academic_year_id", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select academic year" />
                        </SelectTrigger>
                        <SelectContent>
                          {academicYears.map((year) => (
                            <SelectItem key={year.id} value={year.id}>
                              {year.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Create Batch</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <TabsContent value="courses">
          {loading ? (
            <div className="flex justify-center p-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Academic Year</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courses.length > 0 ? (
                    courses.map((course) => (
                      <TableRow key={course.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <School className="h-4 w-4" />
                            {course.name}
                          </div>
                        </TableCell>
                        <TableCell>{course.description}</TableCell>
                        <TableCell>
                          {academicYears.find(y => y.id === course.academic_year_id)?.name || "Unknown"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedCourse(course.id);
                                setActiveTab("batches");
                              }}
                            >
                              View Batches
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                            >
                              Edit
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                        No courses found. Create your first course.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="batches">
          {selectedCourse && (
            <div className="mb-4 p-2 bg-muted rounded-md">
              <p className="text-sm">
                Filtered by course: <span className="font-semibold">
                  {courses.find(c => c.id === selectedCourse)?.name}
                </span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSelectedCourse(null)}
                  className="ml-2"
                >
                  Clear filter
                </Button>
              </p>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center p-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Class Teacher</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {batches
                    .filter(batch => selectedCourse ? batch.course_id === selectedCourse : true)
                    .length > 0 ? (
                    batches
                      .filter(batch => selectedCourse ? batch.course_id === selectedCourse : true)
                      .map((batch) => (
                        <TableRow key={batch.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              {batch.name}
                            </div>
                          </TableCell>
                          <TableCell>
                            {courses.find(c => c.id === batch.course_id)?.name || "Unknown"}
                          </TableCell>
                          <TableCell>{batch.capacity}</TableCell>
                          <TableCell>
                            {teachers.find(t => t.id === batch.class_teacher_id)?.name || "Unassigned"}
                          </TableCell>
                          <TableCell>
                            {batch.is_active ? (
                              <Badge variant="default" className="bg-green-500">Active</Badge>
                            ) : (
                              <Badge variant="outline">Inactive</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                              >
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                              >
                                Archive
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                        {selectedCourse 
                          ? "No batches found for this course. Create your first batch."
                          : "No batches found. Create your first batch."}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CoursesBatches;
