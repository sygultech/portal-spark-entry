
import { useState } from "react";
import { useDepartments } from "@/hooks/useDepartments";
import { useAuth } from "@/contexts/AuthContext";
import { Department } from "@/services/departmentService";
import { DepartmentFormValues } from "./DepartmentDialog";
import DepartmentDialog from "./DepartmentDialog";
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
import { Plus, MoreVertical, Pencil, Trash2 } from "lucide-react";
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

const DepartmentsSection = () => {
  const { profile } = useAuth();
  const { departments, isLoading, createDepartment, updateDepartment, deleteDepartment } = useDepartments();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  
  const handleCreateClick = () => {
    setSelectedDepartment(null);
    setIsDialogOpen(true);
  };
  
  const handleEditClick = (department: Department) => {
    setSelectedDepartment(department);
    setIsDialogOpen(true);
  };
  
  const handleDeleteClick = (department: Department) => {
    setSelectedDepartment(department);
    setIsDeleteDialogOpen(true);
  };
  
  const handleSaveDepartment = (values: DepartmentFormValues) => {
    if (!profile?.school_id) return;
    
    if (selectedDepartment) {
      updateDepartment({
        id: selectedDepartment.id,
        ...values
      });
    } else {
      createDepartment({
        name: values.name,
        description: values.description,
        school_id: profile.school_id
      });
    }
  };
  
  const handleConfirmDelete = () => {
    if (selectedDepartment) {
      deleteDepartment(selectedDepartment.id);
      setIsDeleteDialogOpen(false);
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Departments</CardTitle>
          <CardDescription>Manage your school's departments</CardDescription>
        </div>
        <Button onClick={handleCreateClick} size="sm" className="h-8">
          <Plus className="mr-1 h-4 w-4" /> Add Department
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="py-6 text-center text-muted-foreground">Loading departments...</div>
        ) : departments.length === 0 ? (
          <div className="py-6 text-center text-muted-foreground">
            No departments found. Create your first department to get started.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-[100px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {departments.map((department) => (
                <TableRow key={department.id}>
                  <TableCell className="font-medium">{department.name}</TableCell>
                  <TableCell>
                    {department.description ? department.description : "—"}
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
                        <DropdownMenuItem onClick={() => handleEditClick(department)}>
                          <Pencil className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDeleteClick(department)}
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
      </CardContent>
      
      {/* Department Dialog */}
      <DepartmentDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSaveDepartment}
        department={selectedDepartment || undefined}
      />
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the department{" "}
              <span className="font-semibold">{selectedDepartment?.name}</span>.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
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

export default DepartmentsSection;
