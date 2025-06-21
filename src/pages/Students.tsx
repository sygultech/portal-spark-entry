
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useStudentManagement } from "@/hooks/useStudentManagement";
import { useQueryClient } from "@tanstack/react-query";

export default function Students() {
  console.log("Students component rendering...");
  
  const { profile } = useAuth();
  const schoolId = profile?.school_id;

  console.log("Profile:", profile);
  console.log("School ID:", schoolId);

  const {
    students,
    isStudentsLoading,
    categories,
    isCategoriesLoading,
    createStudent,
    updateStudent,
    isUpdatingStudent,
    addDisciplinaryRecord,
    addTransferRecord,
    generateCertificate
  } = useStudentManagement();

  console.log("Students data:", students);
  console.log("Students loading:", isStudentsLoading);
  console.log("Categories:", categories);

  const queryClient = useQueryClient();

  const handleRefreshStudents = () => {
    queryClient.invalidateQueries({ queryKey: ['students', schoolId] });
  };

  const [activeTab, setActiveTab] = useState("list");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isAddStudentFormOpen, setIsAddStudentFormOpen] = useState(false);

  const handleCreateStudent = async (data: any) => {
    if (!schoolId) {
      toast.error("School ID not found. Please try again or contact support.");
      return;
    }
    try {
      await createStudent({
        ...data,
        school_id: schoolId
      });
      setIsAddStudentFormOpen(false);
      toast.success("Student added successfully");
    } catch (error) {
      console.error('Error creating student:', error);
      toast.error("Failed to add student. Please try again.");
    }
  };

  const handleBatchAction = (action: string, studentIds: string[]) => {
    switch (action) {
      case "promote":
        toast.success(`${studentIds.length} students promoted`);
        break;
      case "transfer":
        toast.success(`${studentIds.length} students marked for transfer`);
        break;
      case "print":
        toast.success("Generating documents...");
        break;
      default:
        break;
    }
  };

  const handleBulkImport = () => {
    toast.success("Bulk import feature coming soon...");
  };

  const handleExportData = () => {
    toast.success("Exporting student data...");
  };

  console.log("About to render Students JSX...");

  if (isStudentsLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2">Loading students...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Students Management</h1>
          <Button onClick={() => setIsAddStudentFormOpen(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            Add New Student
          </Button>
        </div>
        
        <div className="bg-muted p-4 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{students.length}</div>
              <div className="text-sm text-muted-foreground">Total Students</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {students.filter(s => s.status === 'active').length}
              </div>
              <div className="text-sm text-muted-foreground">Active Students</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">0</div>
              <div className="text-sm text-muted-foreground">Pending Admissions</div>
            </div>
            <div className="text-center">
              <Button variant="outline" size="sm" onClick={handleBulkImport}>
                Bulk Import
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-muted">
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <div className="bg-white rounded-lg border p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Student List</h2>
              <Button variant="outline" onClick={handleRefreshStudents}>
                Refresh
              </Button>
            </div>
            
            {students.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No students found.</p>
                <Button 
                  className="mt-4" 
                  onClick={() => setIsAddStudentFormOpen(true)}
                >
                  Add First Student
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {students.map((student) => (
                  <div 
                    key={student.id} 
                    className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedStudent(student)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">
                          {student.first_name} {student.last_name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {student.email}
                        </p>
                        {student.admission_number && (
                          <p className="text-sm text-muted-foreground">
                            Admission: {student.admission_number}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          student.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {student.status || 'active'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="categories">
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Student Categories</h2>
            {categories.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No categories found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category) => (
                  <div key={category.id} className="border rounded-lg p-4">
                    <h3 className="font-medium">{category.name}</h3>
                    {category.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {category.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Simple Add Student Form Modal */}
      {isAddStudentFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Add New Student</h2>
            <p className="text-muted-foreground mb-4">
              Student form component will be implemented here.
            </p>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setIsAddStudentFormOpen(false)}
              >
                Close
              </Button>
              <Button onClick={() => {
                toast.success("Student form will be implemented");
                setIsAddStudentFormOpen(false);
              }}>
                Add Student
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
