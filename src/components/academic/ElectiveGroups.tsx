
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Users } from "lucide-react";

interface ElectiveGroup {
  id: string;
  name: string;
  description: string;
  course_id: string;
  min_selections: number;
  max_selections: number;
  enrollment_deadline: string;
  academic_year_id: string;
  school_id: string;
}

interface Elective {
  id: string;
  name: string;
  group_id: string;
  capacity: number;
  teacher_id: string | null;
  description: string;
  students_enrolled: number;
}

const ElectiveGroups = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [groups, setGroups] = useState<ElectiveGroup[]>([]);
  const [electives, setElectives] = useState<Elective[]>([]);
  const [loading, setLoading] = useState(true);
  const [groupDialogOpen, setGroupDialogOpen] = useState(false);
  const [electiveDialogOpen, setElectiveDialogOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  
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
  
  const [groupForm, setGroupForm] = useState({
    name: "",
    description: "",
    course_id: "",
    min_selections: 1,
    max_selections: 1,
    enrollment_deadline: format(new Date(), "yyyy-MM-dd"),
    academic_year_id: academicYears[0].id,
  });
  
  const [electiveForm, setElectiveForm] = useState({
    name: "",
    description: "",
    capacity: 30,
    teacher_id: "",
    group_id: "",
  });

  const fetchElectiveData = async () => {
    try {
      setLoading(true);
      
      // Mock data - in a real implementation this would fetch from Supabase
      const mockGroups: ElectiveGroup[] = [
        {
          id: "1",
          name: "Language Electives",
          description: "Foreign language options for Grade 2",
          course_id: "2",
          min_selections: 1,
          max_selections: 1,
          enrollment_deadline: "2024-07-15",
          academic_year_id: "1",
          school_id: profile?.school_id || "",
        },
        {
          id: "2",
          name: "Arts Electives",
          description: "Arts and crafts options for Grade 3",
          course_id: "3",
          min_selections: 1,
          max_selections: 2,
          enrollment_deadline: "2024-07-20",
          academic_year_id: "1",
          school_id: profile?.school_id || "",
        },
      ];
      
      const mockElectives: Elective[] = [
        {
          id: "1",
          name: "Spanish",
          group_id: "1",
          capacity: 25,
          teacher_id: "1",
          description: "Introduction to Spanish language",
          students_enrolled: 18,
        },
        {
          id: "2",
          name: "French",
          group_id: "1",
          capacity: 25,
          teacher_id: "2",
          description: "Introduction to French language",
          students_enrolled: 15,
        },
        {
          id: "3",
          name: "German",
          group_id: "1",
          capacity: 20,
          teacher_id: "3",
          description: "Introduction to German language",
          students_enrolled: 12,
        },
        {
          id: "4",
          name: "Drawing",
          group_id: "2",
          capacity: 30,
          teacher_id: "1",
          description: "Basic drawing techniques",
          students_enrolled: 22,
        },
        {
          id: "5",
          name: "Crafts",
          group_id: "2",
          capacity: 25,
          teacher_id: "3",
          description: "Arts and crafts activities",
          students_enrolled: 20,
        },
      ];
      
      setGroups(mockGroups);
      setElectives(mockElectives);
      setLoading(false);
      
      // Set the first group as selected by default
      if (mockGroups.length > 0 && !selectedGroup) {
        setSelectedGroup(mockGroups[0].id);
      }
      
    } catch (error) {
      console.error("Error fetching elective data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch elective data. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  // Initial data fetch
  useState(() => {
    fetchElectiveData();
  });

  const handleGroupInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setGroupForm((prev) => ({
      ...prev,
      [name]: type === "number" ? parseInt(value) || 0 : value,
    }));
  };

  const handleGroupSelectChange = (name: string, value: string) => {
    setGroupForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleElectiveInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setElectiveForm((prev) => ({
      ...prev,
      [name]: type === "number" ? parseInt(value) || 0 : value,
    }));
  };

  const handleElectiveSelectChange = (name: string, value: string) => {
    setElectiveForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGroupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real implementation, this would save to Supabase
    const newGroup: ElectiveGroup = {
      id: Date.now().toString(),
      ...groupForm,
      school_id: profile?.school_id || "",
    };

    setGroups((prev) => [...prev, newGroup]);
    setSelectedGroup(newGroup.id);
    setGroupDialogOpen(false);
    toast({
      title: "Elective group created",
      description: `${groupForm.name} has been added successfully.`,
    });
    
    // Reset form
    setGroupForm({
      name: "",
      description: "",
      course_id: "",
      min_selections: 1,
      max_selections: 1,
      enrollment_deadline: format(new Date(), "yyyy-MM-dd"),
      academic_year_id: academicYears[0].id,
    });
  };

  const handleElectiveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedGroup) {
      toast({
        title: "Error",
        description: "Please select an elective group first.",
        variant: "destructive",
      });
      return;
    }
    
    // In a real implementation, this would save to Supabase
    const newElective: Elective = {
      id: Date.now().toString(),
      ...electiveForm,
      group_id: selectedGroup,
      students_enrolled: 0,
    };

    setElectives((prev) => [...prev, newElective]);
    setElectiveDialogOpen(false);
    toast({
      title: "Elective created",
      description: `${electiveForm.name} has been added successfully.`,
    });
    
    // Reset form
    setElectiveForm({
      name: "",
      description: "",
      capacity: 30,
      teacher_id: "",
      group_id: selectedGroup,
    });
  };

  const filteredElectives = selectedGroup 
    ? electives.filter(elective => elective.group_id === selectedGroup) 
    : [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Elective Groups</h3>
        <Dialog open={groupDialogOpen} onOpenChange={setGroupDialogOpen}>
          <DialogTrigger asChild>
            <Button>Create New Elective Group</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Elective Group</DialogTitle>
              <DialogDescription>
                Define a new elective group for students to choose from.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleGroupSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Group Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={groupForm.name}
                    onChange={handleGroupInputChange}
                    placeholder="e.g. Language Electives"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    name="description"
                    value={groupForm.description}
                    onChange={handleGroupInputChange}
                    placeholder="Brief description of this elective group"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="course_id">Course</Label>
                  <Select
                    value={groupForm.course_id}
                    onValueChange={(value) => handleGroupSelectChange("course_id", value)}
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="min_selections">Minimum Selections</Label>
                    <Input
                      id="min_selections"
                      name="min_selections"
                      type="number"
                      value={groupForm.min_selections}
                      onChange={handleGroupInputChange}
                      min="1"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="max_selections">Maximum Selections</Label>
                    <Input
                      id="max_selections"
                      name="max_selections"
                      type="number"
                      value={groupForm.max_selections}
                      onChange={handleGroupInputChange}
                      min={groupForm.min_selections}
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="enrollment_deadline">Enrollment Deadline</Label>
                  <Input
                    id="enrollment_deadline"
                    name="enrollment_deadline"
                    type="date"
                    value={groupForm.enrollment_deadline}
                    onChange={handleGroupInputChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="academic_year_id">Academic Year</Label>
                  <Select
                    value={groupForm.academic_year_id}
                    onValueChange={(value) => handleGroupSelectChange("academic_year_id", value)}
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
                <Button type="submit">Create Elective Group</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Available Elective Groups</CardTitle>
              <CardDescription>
                Select a group to view or edit its electives
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center p-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-2">
                  {groups.map((group) => (
                    <div
                      key={group.id}
                      className={`p-3 rounded-md cursor-pointer transition-colors ${
                        selectedGroup === group.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted hover:bg-muted/80"
                      }`}
                      onClick={() => setSelectedGroup(group.id)}
                    >
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">{group.name}</h4>
                        <Badge variant={selectedGroup === group.id ? "outline" : "secondary"} className={selectedGroup === group.id ? "border-primary-foreground text-primary-foreground" : ""}>
                          {electives.filter(e => e.group_id === group.id).length} electives
                        </Badge>
                      </div>
                      <p className={`text-xs mt-1 ${
                        selectedGroup === group.id
                          ? "text-primary-foreground/80"
                          : "text-muted-foreground"
                      }`}>
                        {courses.find(c => c.id === group.course_id)?.name || "No course"} • 
                        {group.min_selections === group.max_selections 
                          ? ` Select ${group.min_selections}`
                          : ` Select ${group.min_selections}-${group.max_selections}`
                        }
                      </p>
                      <p className={`text-xs mt-1 ${
                        selectedGroup === group.id
                          ? "text-primary-foreground/80"
                          : "text-muted-foreground"
                      }`}>
                        Deadline: {format(new Date(group.enrollment_deadline), "MMM d, yyyy")}
                      </p>
                    </div>
                  ))}
                  
                  {groups.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">
                      No elective groups defined yet.
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>
                  {selectedGroup 
                    ? groups.find(g => g.id === selectedGroup)?.name 
                    : "Electives"
                  }
                </CardTitle>
                <CardDescription>
                  {selectedGroup
                    ? groups.find(g => g.id === selectedGroup)?.description || "Manage electives in this group"
                    : "Select an elective group"
                  }
                </CardDescription>
              </div>
              
              {selectedGroup && (
                <Dialog open={electiveDialogOpen} onOpenChange={setElectiveDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">Add Elective</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Elective</DialogTitle>
                      <DialogDescription>
                        Add a new elective to this group.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleElectiveSubmit}>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="name">Elective Name</Label>
                          <Input
                            id="name"
                            name="name"
                            value={electiveForm.name}
                            onChange={handleElectiveInputChange}
                            placeholder="e.g. Spanish"
                            required
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="description">Description</Label>
                          <Input
                            id="description"
                            name="description"
                            value={electiveForm.description}
                            onChange={handleElectiveInputChange}
                            placeholder="Brief description of this elective"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="capacity">Capacity</Label>
                          <Input
                            id="capacity"
                            name="capacity"
                            type="number"
                            value={electiveForm.capacity}
                            onChange={handleElectiveInputChange}
                            min="1"
                            required
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="teacher_id">Assign Teacher</Label>
                          <Select
                            value={electiveForm.teacher_id}
                            onValueChange={(value) => handleElectiveSelectChange("teacher_id", value)}
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
                      </div>
                      <DialogFooter>
                        <Button type="submit">Add Elective</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center p-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : selectedGroup ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Elective</TableHead>
                      <TableHead>Teacher</TableHead>
                      <TableHead>Enrollment</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredElectives.length > 0 ? (
                      filteredElectives.map((elective) => (
                        <TableRow key={elective.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium flex items-center gap-2">
                                <BookOpen className="h-4 w-4" />
                                {elective.name}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {elective.description}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {teachers.find(t => t.id === elective.teacher_id)?.name || "Unassigned"}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <div className="mr-2">
                                {elective.students_enrolled}/{elective.capacity}
                              </div>
                              <div className="w-24 bg-muted rounded-full h-2 overflow-hidden">
                                <div 
                                  className={`h-full ${
                                    elective.students_enrolled / elective.capacity > 0.8 
                                      ? "bg-orange-500" 
                                      : "bg-green-500"
                                  }`}
                                  style={{ width: `${(elective.students_enrolled / elective.capacity) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm">
                                Edit
                              </Button>
                              <Button variant="outline" size="sm">
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                          No electives defined for this group yet.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
                  <BookOpen className="h-12 w-12 mb-2 opacity-20" />
                  <p>Select an elective group from the left panel</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ElectiveGroups;
