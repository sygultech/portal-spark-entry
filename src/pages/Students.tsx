
import { useState } from "react";
import { useStudents } from "@/hooks/useStudents";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { UserPlus, FileUp, Download, Filter, Search } from "lucide-react";
import StudentList from "@/components/students/StudentList";
import StudentImportDialog from "@/components/students/StudentImportDialog";
import StudentFormDialog from "@/components/students/StudentFormDialog";
import StudentFilters from "@/components/students/StudentFilters";
import { Student } from "@/types/school";

export default function Students() {
  const { students, isLoading, error } = useStudents();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const [showFilters, setShowFilters] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showAddStudentDialog, setShowAddStudentDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleAddStudent = () => {
    setSelectedStudent(null);
    setShowAddStudentDialog(true);
  };

  const handleEditStudent = (student: Student) => {
    setSelectedStudent(student);
    setShowAddStudentDialog(true);
  };

  const handleStudentSubmit = (data: any) => {
    // This will be implemented when backend is ready
    toast({
      title: selectedStudent ? "Student Updated" : "Student Added",
      description: `Student ${data.first_name} ${data.last_name} has been ${selectedStudent ? 'updated' : 'added'} successfully.`,
    });
    setShowAddStudentDialog(false);
  };

  const handleImportSubmit = (data: any) => {
    // This will be implemented when backend is ready
    toast({
      title: "Students Imported",
      description: `${data.length} students have been imported successfully.`,
    });
    setShowImportDialog(false);
  };

  const filteredStudents = students.filter((student) => {
    // Basic search
    const fullName = `${student.first_name} ${student.last_name}`.toLowerCase();
    if (searchQuery && !fullName.includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Filter handling will be expanded when backend is implemented
    return true;
  });

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Students</h1>
          <Breadcrumb className="mt-1">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/school-admin">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/students">Students</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleAddStudent} className="flex items-center gap-1">
            <UserPlus className="h-4 w-4" />
            <span>Add Student</span>
          </Button>
          <Button variant="outline" onClick={() => setShowImportDialog(true)} className="flex items-center gap-1">
            <FileUp className="h-4 w-4" />
            <span>Import</span>
          </Button>
          <Button variant="secondary" className="flex items-center gap-1">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </Button>
        </div>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Students</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="transferred">Transferred</TabsTrigger>
          <TabsTrigger value="graduated">Graduated</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <Card>
            <CardContent className="p-6">
              {/* Search and Filter Bar */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search students by name, ID, or admission number..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={handleSearch}
                  />
                </div>
                <Button
                  variant={showFilters ? "default" : "outline"}
                  className="flex items-center gap-1"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="h-4 w-4" />
                  <span>Filters</span>
                </Button>
              </div>

              {/* Filters Section */}
              {showFilters && (
                <StudentFilters 
                  activeFilters={activeFilters}
                  onFilterChange={setActiveFilters}
                  className="mb-6"
                />
              )}

              {/* Students List */}
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : error ? (
                <div className="text-center p-8 text-red-500">
                  <p>Failed to load students. Please try again later.</p>
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="text-center p-8 text-muted-foreground">
                  {searchQuery ? 
                    <p>No students found matching your search criteria.</p> : 
                    <p>No students have been added yet.</p>
                  }
                </div>
              ) : (
                <StudentList 
                  students={filteredStudents}
                  onEdit={handleEditStudent}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="active">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">Active students will be shown here.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="transferred">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">Transferred students will be shown here.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="graduated">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">Graduated students will be shown here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      {showAddStudentDialog && (
        <StudentFormDialog
          isOpen={showAddStudentDialog}
          onClose={() => setShowAddStudentDialog(false)}
          onSubmit={handleStudentSubmit}
          student={selectedStudent}
        />
      )}

      {showImportDialog && (
        <StudentImportDialog
          isOpen={showImportDialog}
          onClose={() => setShowImportDialog(false)}
          onImport={handleImportSubmit}
        />
      )}
    </div>
  );
}
