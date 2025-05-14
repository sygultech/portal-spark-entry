
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BookOpen } from "lucide-react";

interface Subject {
  id: string;
  name: string;
  course_id: string;
  is_core: boolean;
  subject_type: string;
  grading_type: string;
  max_marks: number;
  teacher_id: string | null;
  academic_year_id: string;
}

const SubjectsManagement = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Mock data for courses, teachers, etc.
  const courses = [
    { id: "1", name: "Grade 1" },
    { id: "2", name: "Grade 2" },
    { id: "3", name: "Grade 3" },
  ];
  
  const academicYears = [
    { id: "1", name: "2024-2025" },
    { id: "2", name: "2023-2024" },
  ];
  
  const teachers = [
    { id: "1", name: "John Smith" },
    { id: "2", name: "Jane Doe" },
    { id: "3", name: "Robert Brown" },
  ];
  
  const subjectTypes = ["Language", "Science", "Mathematics", "Social Studies", "Arts"];
  const gradingTypes = ["Marks", "Grades", "Hybrid"];
  
  const [formData, setFormData] = useState({
    name: "",
    course_id: "",
    is_core: true,
    subject_type: "",
    grading_type: "Marks",
    max_marks: 100,
    teacher_id: "",
    academic_year_id: academicYears[0].id,
  });

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      
      // Mock data - in a real implementation this would fetch from Supabase
      const mockSubjects: Subject[] = [
        {
          id: "1",
          name: "Mathematics",
          course_id: "1",
          is_core: true,
          subject_type: "Mathematics",
          grading_type: "Marks",
          max_marks: 100,
          teacher_id: "1",
          academic_year_id: "1",
        },
        {
          id: "2",
          name: "English",
          course_id: "1",
          is_core: true,
          subject_type: "Language",
          grading_type: "Marks",
          max_marks: 100,
          teacher_id: "2",
          academic_year_id: "1",
        },
        {
          id: "3",
          name: "Science",
          course_id: "2",
          is_core: true,
          subject_type: "Science",
          grading_type: "Grades",
          max_marks: 0,
          teacher_id: "3",
          academic_year_id: "1",
        },
      ];
      
      setSubjects(mockSubjects);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      toast({
        title: "Error",
        description: "Failed to fetch subjects. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  // Initial data fetch
  useState(() => {
    fetchSubjects();
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseInt(value) || 0 : value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real implementation, this would save to Supabase
    const newSubject: Subject = {
      id: Date.now().toString(),
      ...formData,
    };

    setSubjects((prev) => [...prev, newSubject]);
    setDialogOpen(false);
    toast({
      title: "Subject created",
      description: `${formData.name} has been added successfully.`,
    });
    
    // Reset form
    setFormData({
      name: "",
      course_id: "",
      is_core: true,
      subject_type: "",
      grading_type: "Marks",
      max_marks: 100,
      teacher_id: "",
      academic_year_id: academicYears[0].id,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Subjects</h3>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add New Subject</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Subject</DialogTitle>
              <DialogDescription>
                Add a new subject to your academic structure.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Subject Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Mathematics"
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="course_id">Course</Label>
                  <Select
                    value={formData.course_id}
                    onValueChange={(value) => handleSelectChange("course_id", value)}
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
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_core"
                    checked={formData.is_core}
                    onCheckedChange={(checked) => handleCheckboxChange("is_core", checked === true)}
                  />
                  <Label htmlFor="is_core">Core Subject</Label>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="subject_type">Subject Type</Label>
                  <Select
                    value={formData.subject_type}
                    onValueChange={(value) => handleSelectChange("subject_type", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject type" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjectTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="grading_type">Grading Type</Label>
                  <Select
                    value={formData.grading_type}
                    onValueChange={(value) => handleSelectChange("grading_type", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select grading type" />
                    </SelectTrigger>
                    <SelectContent>
                      {gradingTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {formData.grading_type === "Marks" && (
                  <div className="grid gap-2">
                    <Label htmlFor="max_marks">Maximum Marks</Label>
                    <Input
                      id="max_marks"
                      name="max_marks"
                      type="number"
                      value={formData.max_marks}
                      onChange={handleInputChange}
                      min="0"
                      required
                    />
                  </div>
                )}
                
                <div className="grid gap-2">
                  <Label htmlFor="teacher_id">Assign Teacher</Label>
                  <Select
                    value={formData.teacher_id}
                    onValueChange={(value) => handleSelectChange("teacher_id", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select teacher" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Unassigned</SelectItem>
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
                    value={formData.academic_year_id}
                    onValueChange={(value) => handleSelectChange("academic_year_id", value)}
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
                <Button type="submit">Create Subject</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Grading</TableHead>
                <TableHead>Teacher</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subjects.length > 0 ? (
                subjects.map((subject) => (
                  <TableRow key={subject.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        {subject.name}
                        {subject.is_core && (
                          <Badge variant="secondary" className="ml-2">Core</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {courses.find(c => c.id === subject.course_id)?.name || "Unknown"}
                    </TableCell>
                    <TableCell>{subject.subject_type}</TableCell>
                    <TableCell>
                      {subject.grading_type}
                      {subject.grading_type === "Marks" && ` (${subject.max_marks})`}
                    </TableCell>
                    <TableCell>
                      {teachers.find(t => t.id === subject.teacher_id)?.name || "Unassigned"}
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
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                    No subjects found. Create your first subject.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default SubjectsManagement;
