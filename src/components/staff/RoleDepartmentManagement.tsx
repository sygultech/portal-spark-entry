import React, { useState } from "react";
import { useDepartments } from "@/hooks/useDepartments";
import { useDesignations } from "@/hooks/useDesignations";
import { useAuth } from "@/contexts/AuthContext";
import { Department } from "@/services/departmentService";
import { DepartmentFormValues } from "../academic/DepartmentDialog";
import DepartmentDialog from "../academic/DepartmentDialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Users, 
  Edit, 
  Trash2, 
  Plus,
  MoreVertical,
  MoreHorizontal,
  Pencil,
  Loader2
} from "lucide-react";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

// Mock data for roles
const mockRoles = [
  { id: 1, name: "Teacher", description: "Regular teaching staff", staffCount: 25, systemRole: "teacher" },
  { id: 2, name: "Head of Department", description: "Department head", staffCount: 5, systemRole: "teacher" },
  { id: 3, name: "Assistant Principal", description: "Assists the principal", staffCount: 2, systemRole: "school_admin" },
  { id: 4, name: "Principal", description: "School principal", staffCount: 1, systemRole: "school_admin" },
  { id: 5, name: "Office Staff", description: "Administrative support staff", staffCount: 6, systemRole: "staff" },
];

const RoleDepartmentManagement = () => {
  const [activeTab, setActiveTab] = useState("departments");
  const [departmentDialogOpen, setDepartmentDialogOpen] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [designationDialogOpen, setDesignationDialogOpen] = useState(false);
  const [roles, setRoles] = useState(mockRoles);
  const [editItem, setEditItem] = useState<any>(null);
  const { toast } = useToast();
  const { profile } = useAuth();
  const { departments, isLoading: departmentsLoading, createDepartment, updateDepartment, deleteDepartment } = useDepartments();
  const { designations, isLoading: designationsLoading, createDesignation, updateDesignation, deleteDesignation } = useDesignations();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    department: "",
    systemRole: "teacher",
  });

  // Permission matrix state (for UI display only)
  const [permissions, setPermissions] = useState({
    viewStudents: { read: true, write: false, delete: false },
    viewTeachers: { read: true, write: false, delete: false },
    manageClasses: { read: true, write: false, delete: false },
    manageAttendance: { read: true, write: true, delete: false },
    manageGrades: { read: true, write: true, delete: false },
  });

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePermissionChange = (module: string, action: string, checked: boolean) => {
    setPermissions(prev => ({
      ...prev,
      [module]: {
        ...prev[module as keyof typeof prev],
        [action]: checked
      }
    }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      department: "",
      systemRole: "teacher",
    });
    setEditItem(null);
  };

  const handleCreateDepartment = () => {
    setSelectedDepartment(null);
    setDepartmentDialogOpen(true);
  };

  const handleEditDepartment = (department: Department) => {
    setSelectedDepartment(department);
    setDepartmentDialogOpen(true);
  };

  const handleDeleteDepartment = (department: Department) => {
    setSelectedDepartment(department);
    setIsDeleteDialogOpen(true);
  };

  const handleSaveDepartment = async (values: DepartmentFormValues) => {
    if (!profile?.school_id) return;
    if (selectedDepartment) {
      await updateDepartment({
        id: selectedDepartment.id,
        ...values
      });
    } else {
      await createDepartment({
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

  const handleEdit = (item: any, type: string) => {
    setEditItem({ ...item, type });
    setFormData({
      name: item.name,
      description: item.description || "",
      department: item.department_id || "",
      systemRole: item.systemRole || "teacher",
    });

    if (type === "department") {
      setDepartmentDialogOpen(true);
    } else if (type === "role") {
      setRoleDialogOpen(true);
    } else if (type === "designation") {
      setDesignationDialogOpen(true);
    }
  };

  const handleDelete = async (id: string, type: string) => {
    if (type === "department") {
      deleteDepartment(id);
    } else if (type === "role") {
      setRoles(roles.filter(item => String(item.id) !== id));
      toast({
        title: "Role deleted",
        description: "The role has been successfully removed",
      });
    } else if (type === "designation") {
      try {
        await deleteDesignation(id);
        toast({
          title: "Designation deleted",
          description: "The designation has been successfully removed",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete designation. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  const handleRoleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editItem?.type === "role") {
      setRoles(roles.map(item => 
        item.id === editItem.id 
          ? { ...item, name: formData.name, description: formData.description, systemRole: formData.systemRole } 
          : item
      ));
      
      toast({
        title: "Role updated",
        description: "The role has been successfully updated",
      });
    } else {
      const newRole = {
        id: Math.max(...roles.map(r => r.id)) + 1,
        name: formData.name,
        description: formData.description,
        staffCount: 0,
        systemRole: formData.systemRole,
      };
      
      setRoles([...roles, newRole]);
      
      toast({
        title: "Role created",
        description: "The role has been successfully created",
      });
    }
    
    resetForm();
    setRoleDialogOpen(false);
  };

  const handleDesignationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.department) {
      toast({
        title: "Error",
        description: "Please select a department",
        variant: "destructive"
      });
      return;
    }
    
    try {
      if (editItem?.type === "designation") {
        await updateDesignation(editItem.id, {
          name: formData.name,
          department_id: formData.department,
          description: formData.description
        });
        
        toast({
          title: "Designation updated",
          description: "The designation has been successfully updated",
        });
      } else {
        await createDesignation({
          name: formData.name,
          department_id: formData.department,
          school_id: profile!.school_id,
          description: formData.description
        });
        
        toast({
          title: "Designation created",
          description: "The designation has been successfully created",
        });
      }
      
      // Only reset form and close dialog after successful API call
      resetForm();
      setDesignationDialogOpen(false);
    } catch (error: any) {
      console.error('Error saving designation:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save designation. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Roles & Departments</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="designations">Designations</TabsTrigger>
        </TabsList>

        <TabsContent value="departments" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Departments</h2>
            <Button onClick={handleCreateDepartment}>
              <Plus className="h-4 w-4 mr-2" />
              Add Department
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Staff Count</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {departmentsLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">
                        <div className="flex justify-center items-center py-4">
                          <Loader2 className="h-6 w-6 animate-spin" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : departments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">
                        No departments found
                      </TableCell>
                    </TableRow>
                  ) : (
                    departments.map((department) => (
                      <TableRow key={department.id}>
                        <TableCell>{department.name}</TableCell>
                        <TableCell>{department.description}</TableCell>
                        <TableCell>{department.staff_count || 0}</TableCell>
                        <TableCell>{new Date(department.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditDepartment(department)}>
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDeleteDepartment(department)}>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Staff Roles</h2>
            <Button onClick={() => {
              resetForm();
              setRoleDialogOpen(true);
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Role
            </Button>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Role Name</TableHead>
                    <TableHead className="hidden md:table-cell">Description</TableHead>
                    <TableHead>System Role</TableHead>
                    <TableHead>Staff Count</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roles.map(role => (
                    <TableRow key={role.id}>
                      <TableCell className="font-medium">{role.name}</TableCell>
                      <TableCell className="hidden md:table-cell">{role.description}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{role.systemRole}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{role.staffCount}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleEdit(role, "role")}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete the role "{role.name}". 
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(String(role.id), "role")} className="bg-destructive text-destructive-foreground">
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="designations" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Staff Designations</h2>
            <Button onClick={() => {
              resetForm();
              setDesignationDialogOpen(true);
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Designation
            </Button>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Designation</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Staff Count</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {designationsLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center">
                        <div className="flex justify-center items-center py-4">
                          <Loader2 className="h-6 w-6 animate-spin" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : designations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center">
                        No designations found
                      </TableCell>
                    </TableRow>
                  ) : (
                    designations.map(designation => (
                      <TableRow key={designation.id}>
                        <TableCell className="font-medium">{designation.name}</TableCell>
                        <TableCell>{designation.departments?.name || 'N/A'}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>0</span> {/* TODO: Implement staff count */}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleEdit(designation, "designation")}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently delete the designation "{designation.name}". 
                                    This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(designation.id, "designation")} className="bg-destructive text-destructive-foreground">
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Department Dialog */}
      <DepartmentDialog
        isOpen={departmentDialogOpen}
        onClose={() => setDepartmentDialogOpen(false)}
        onSave={handleSaveDepartment}
        department={selectedDepartment}
      />

      {/* Role Dialog */}
      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editItem ? "Edit Role" : "Add Role"}</DialogTitle>
            <DialogDescription>
              {editItem ? "Update the role details and permissions" : "Create a new role with specific permissions"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRoleSubmit}>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Role Name</Label>
                  <Input 
                    id="name" 
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    placeholder="e.g., Department Head"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="systemRole">System Role</Label>
                  <select
                    id="systemRole"
                    name="systemRole"
                    value={formData.systemRole}
                    onChange={handleFormChange}
                    className="w-full h-10 px-3 rounded-md border border-input"
                  >
                    <option value="teacher">Teacher</option>
                    <option value="school_admin">School Admin</option>
                    <option value="staff">Staff</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  placeholder="Brief role description"
                  rows={2}
                />
              </div>

              {/* Permissions Matrix */}
              <div className="space-y-2 pt-2">
                <Label className="text-base">Role Permissions</Label>
                <p className="text-sm text-muted-foreground pb-2">
                  Define what this role can access and modify
                </p>

                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Module</TableHead>
                        <TableHead className="text-center">Read</TableHead>
                        <TableHead className="text-center">Write</TableHead>
                        <TableHead className="text-center">Delete</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(permissions).map(([module, actions]) => (
                        <TableRow key={module}>
                          <TableCell className="font-medium">
                            {module.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </TableCell>
                          <TableCell className="text-center">
                            <Checkbox
                              checked={actions.read}
                              onCheckedChange={(checked) => 
                                handlePermissionChange(module, 'read', checked === true)
                              }
                            />
                          </TableCell>
                          <TableCell className="text-center">
                            <Checkbox
                              checked={actions.write}
                              onCheckedChange={(checked) => 
                                handlePermissionChange(module, 'write', checked === true)
                              }
                            />
                          </TableCell>
                          <TableCell className="text-center">
                            <Checkbox
                              checked={actions.delete}
                              onCheckedChange={(checked) => 
                                handlePermissionChange(module, 'delete', checked === true)
                              }
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => {
                resetForm();
                setRoleDialogOpen(false);
              }}>
                Cancel
              </Button>
              <Button type="submit">
                {editItem ? "Update" : "Create"} Role
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Designation Dialog */}
      <Dialog open={designationDialogOpen} onOpenChange={setDesignationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editItem ? "Edit Designation" : "Add Designation"}</DialogTitle>
            <DialogDescription>
              {editItem ? "Update the designation details" : "Create a new staff designation"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleDesignationSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Designation Title</Label>
                <Input 
                  id="name" 
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  placeholder="e.g., Senior Teacher"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                {departmentsLoading ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading departments...
                  </div>
                ) : departments.length === 0 ? (
                  <div className="text-sm text-muted-foreground">
                    No departments available. Please create a department first.
                  </div>
                ) : (
                  <select
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleFormChange}
                    className="w-full h-10 px-3 rounded-md border border-input"
                    required
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  placeholder="Brief designation description"
                  rows={2}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => {
                resetForm();
                setDesignationDialogOpen(false);
              }}>
                Cancel
              </Button>
              <Button type="submit" disabled={departmentsLoading || departments.length === 0}>
                {editItem ? "Update" : "Create"} Designation
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the department
              and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default RoleDepartmentManagement;
