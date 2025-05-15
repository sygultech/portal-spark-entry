
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useAcademic } from "@/contexts/AcademicContext";
import { useToast } from "@/hooks/use-toast";
import { useSubjects, useSubjectCategories } from "@/hooks/useSubjects";
import { useCourses } from "@/hooks/useCourses";
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
import { BookOpen, AlertCircle } from "lucide-react";
import { Subject, SubjectCategory } from "@/types/academic";

const SubjectsManagement = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const { currentAcademicYear } = useAcademic();
  
  // Fetch data using our hooks
  const { categories, isLoading: categoriesLoading, createCategory } = useSubjectCategories();
  const { subjects, isLoading: subjectsLoading, createSubject, updateSubject, deleteSubject } = 
    useSubjects(currentAcademicYear?.id);
  const { courses, isLoading: coursesLoading } = useCourses(currentAcademicYear?.id);
  
  // Teachers would typically come from a separate hook, but we'll mock it for now
  const [teachers, setTeachers] = useState([
    { id: "1", name: "John Smith" },
    { id: "2", name: "Jane Doe" },
    { id: "3", name: "Robert Brown" },
  ]);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  
  const [formData, setFormData] = useState<Omit<Subject, 'id' | 'created_at' | 'updated_at'>>({
    name: "",
    code: "",
    description: "",
    category_id: "",
    is_core: true,
    is_language: false,
    max_marks: 100,
    pass_marks: 33,
    school_id: profile?.school_id || "",
    academic_year_id: currentAcademicYear?.id || "",
  });
  
  const [categoryForm, setCategoryForm] = useState({
    name: "",
  });
  
  // Reset form data when academic year changes
  useEffect(() => {
    if (currentAcademicYear) {
      setFormData(prev => ({
        ...prev,
        academic_year_id: currentAcademicYear.id,
      }));
    }
  }, [currentAcademicYear]);
  
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
  
  const handleCategoryInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCategoryForm({ name: e.target.value });
  };
  
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile?.school_id) {
      toast({
        title: "Error",
        description: "School ID not found",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await createCategory({
        name: categoryForm.name,
        school_id: profile.school_id,
      });
      
      toast({
        title: "Category Created",
        description: `${categoryForm.name} category has been created successfully.`
      });
      
      setCategoryForm({ name: "" });
      setCategoryDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create category",
        variant: "destructive"
      });
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile?.school_id || !currentAcademicYear) {
      toast({
        title: "Error",
        description: "Missing required data",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const subjectData = {
        ...formData,
        school_id: profile.school_id,
        academic_year_id: currentAcademicYear.id,
      };
      
      if (editMode && selectedSubject) {
        await updateSubject({ 
          id: selectedSubject.id, 
          subject: subjectData
        });
        
        toast({
          title: "Subject Updated",
          description: `${formData.name} has been updated successfully.`
        });
      } else {
        await createSubject(subjectData);
        
        toast({
          title: "Subject Created",
          description: `${formData.name} has been added successfully.`
        });
      }
      
      // Reset form
      setFormData({
        name: "",
        code: "",
        description: "",
        category_id: "",
        is_core: true,
        is_language: false,
        max_marks: 100,
        pass_marks: 33,
        school_id: profile.school_id,
        academic_year_id: currentAcademicYear.id,
      });
      
      setEditMode(false);
      setSelectedSubject(null);
      setDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save subject",
        variant: "destructive"
      });
    }
  };
  
  const handleEdit = (subject: Subject) => {
    setSelectedSubject(subject);
    setFormData({
      name: subject.name,
      code: subject.code || "",
      description: subject.description || "",
      category_id: subject.category_id || "",
      is_core: subject.is_core,
      is_language: subject.is_language,
      max_marks: subject.max_marks || 100,
      pass_marks: subject.pass_marks || 33,
      school_id: subject.school_id,
      academic_year_id: subject.academic_year_id,
    });
    setEditMode(true);
    setDialogOpen(true);
  };
  
  const handleDelete = async (id: string) => {
    try {
      await deleteSubject(id);
      
      toast({
        title: "Subject Deleted",
        description: "The subject has been deleted successfully."
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete subject",
        variant: "destructive"
      });
    }
  };
  
  const openAddDialog = () => {
    setSelectedSubject(null);
    setFormData({
      name: "",
      code: "",
      description: "",
      category_id: "",
      is_core: true,
      is_language: false,
      max_marks: 100,
      pass_marks: 33,
      school_id: profile?.school_id || "",
      academic_year_id: currentAcademicYear?.id || "",
    });
    setEditMode(false);
    setDialogOpen(true);
  };
  
  const isLoading = subjectsLoading || categoriesLoading || coursesLoading;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Subjects</h3>
        <div className="flex gap-2">
          <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">Add Category</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create Subject Category</DialogTitle>
                <DialogDescription>
                  Add a new subject category to organize your subjects.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateCategory}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="categoryName">Category Name</Label>
                    <Input
                      id="categoryName"
                      value={categoryForm.name}
                      onChange={handleCategoryInputChange}
                      placeholder="e.g. Sciences, Languages, Arts"
                      required
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Create Category</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openAddDialog}>Add New Subject</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editMode ? "Edit Subject" : "Create New Subject"}</DialogTitle>
                <DialogDescription>
                  {editMode ? "Modify subject details" : "Add a new subject to your academic structure."}
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
                    <Label htmlFor="code">Subject Code (Optional)</Label>
                    <Input
                      id="code"
                      name="code"
                      value={formData.code || ""}
                      onChange={handleInputChange}
                      placeholder="e.g. MATH101"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="category_id">Subject Category</Label>
                    <Select
                      value={formData.category_id || ""}
                      onValueChange={(value) => handleSelectChange("category_id", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Uncategorized</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
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
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is_language"
                      checked={formData.is_language}
                      onCheckedChange={(checked) => handleCheckboxChange("is_language", checked === true)}
                    />
                    <Label htmlFor="is_language">Language Subject</Label>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="max_marks">Maximum Marks</Label>
                      <Input
                        id="max_marks"
                        name="max_marks"
                        type="number"
                        value={formData.max_marks || 100}
                        onChange={handleInputChange}
                        min="0"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="pass_marks">Pass Marks</Label>
                      <Input
                        id="pass_marks"
                        name="pass_marks"
                        type="number"
                        value={formData.pass_marks || 33}
                        onChange={handleInputChange}
                        min="0"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Input
                      id="description"
                      name="description"
                      value={formData.description || ""}
                      onChange={handleInputChange}
                      placeholder="Brief description of the subject"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">{editMode ? "Update" : "Create"} Subject</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : !currentAcademicYear ? (
        <div className="flex flex-col items-center justify-center p-8 text-muted-foreground text-center">
          <AlertCircle className="h-12 w-12 mb-2" />
          <h3 className="text-lg font-medium">No Academic Year Selected</h3>
          <p className="text-sm mt-1">Please select or create an academic year first.</p>
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Marks</TableHead>
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
                        {subject.code && (
                          <span className="text-xs text-muted-foreground">({subject.code})</span>
                        )}
                        {subject.is_core && (
                          <Badge variant="secondary" className="ml-2">Core</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {subject.category_id ? (
                        categories.find(c => c.id === subject.category_id)?.name || "Unknown"
                      ) : (
                        <span className="text-muted-foreground">Uncategorized</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {subject.is_language ? "Language" : "Regular"}
                    </TableCell>
                    <TableCell>
                      {subject.max_marks !== null ? (
                        <>Max: {subject.max_marks}, Pass: {subject.pass_marks}</>
                      ) : (
                        "Not Applicable"
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(subject)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(subject.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
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
