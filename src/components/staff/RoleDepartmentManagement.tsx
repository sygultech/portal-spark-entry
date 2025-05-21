
import React, { useState } from "react";
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
  Plus 
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

// Mock data for departments
const mockDepartments = [
  { id: 1, name: "Mathematics", description: "Mathematics department", staffCount: 8, createdAt: "2023-03-15" },
  { id: 2, name: "Science", description: "Science department", staffCount: 12, createdAt: "2023-03-15" },
  { id: 3, name: "English", description: "English language department", staffCount: 10, createdAt: "2023-04-20" },
  { id: 4, name: "Administration", description: "School administration", staffCount: 5, createdAt: "2023-01-10" },
  { id: 5, name: "Physical Education", description: "Sports and physical education", staffCount: 4, createdAt: "2023-05-05" },
];

// Mock data for roles
const mockRoles = [
  { id: 1, name: "Teacher", description: "Regular teaching staff", staffCount: 25, systemRole: "teacher" },
  { id: 2, name: "Head of Department", description: "Department head", staffCount: 5, systemRole: "teacher" },
  { id: 3, name: "Assistant Principal", description: "Assists the principal", staffCount: 2, systemRole: "school_admin" },
  { id: 4, name: "Principal", description: "School principal", staffCount: 1, systemRole: "school_admin" },
  { id: 5, name: "Office Staff", description: "Administrative support staff", staffCount: 6, systemRole: "staff" },
];

// Mock data for designations
const mockDesignations = [
  { id: 1, name: "Junior Teacher", department: "General", staffCount: 15 },
  { id: 2, name: "Senior Teacher", department: "General", staffCount: 10 },
  { id: 3, name: "Department Head", department: "Administration", staffCount: 5 },
  { id: 4, name: "Principal", department: "Administration", staffCount: 1 },
  { id: 5, name: "Office Manager", department: "Administration", staffCount: 1 },
  { id: 6, name: "Secretary", department: "Administration", staffCount: 2 },
];

const RoleDepartmentManagement = () => {
  const [activeTab, setActiveTab] = useState("departments");
  const [departmentDialogOpen, setDepartmentDialogOpen] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [designationDialogOpen, setDesignationDialogOpen] = useState(false);
  const [departments, setDepartments] = useState(mockDepartments);
  const [roles, setRoles] = useState(mockRoles);
  const [designations, setDesignations] = useState(mockDesignations);
  const [editItem, setEditItem] = useState<any>(null);
  const { toast } = useToast();

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

  const handleEdit = (item: any, type: string) => {
    setEditItem({ ...item, type });
    setFormData({
      name: item.name,
      description: item.description || "",
      department: item.department || "",
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

  const handleDelete = (id: number, type: string) => {
    if (type === "department") {
      setDepartments(departments.filter(item => item.id !== id));
      toast({
        title: "Department deleted",
        description: "The department has been successfully removed",
      });
    } else if (type === "role") {
      setRoles(roles.filter(item => item.id !== id));
      toast({
        title: "Role deleted",
        description: "The role has been successfully removed",
      });
    } else if (type === "designation") {
      setDesignations(designations.filter(item => item.id !== id));
      toast({
        title: "Designation deleted",
        description: "The designation has been successfully removed",
      });
    }
  };

  const handleDepartmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editItem?.type === "department") {
      setDepartments(departments.map(item => 
        item.id === editItem.id 
          ? { ...item, name: formData.name, description: formData.description } 
          : item
      ));
      
      toast({
        title: "Department updated",
        description: "The department has been successfully updated",
      });
    } else {
      const newDepartment = {
        id: Math.max(...departments.map(d => d.id)) + 1,
        name: formData.name,
        description: formData.description,
        staffCount: 0,
        createdAt: new Date().toISOString().split('T')[0],
      };
      
      setDepartments([...departments, newDepartment]);
      
      toast({
        title: "Department created",
        description: "The department has been successfully created",
      });
    }
    
    resetForm();
    setDepartmentDialogOpen(false);
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

  const handleDesignationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editItem?.type === "designation") {
      setDesignations(designations.map(item => 
        item.id === editItem.id 
          ? { ...item, name: formData.name, department: formData.department } 
          : item
      ));
      
      toast({
        title: "Designation updated",
        description: "The designation has been successfully updated",
      });
    } else {
      const newDesignation = {
        id: Math.max(...designations.map(d => d.id)) + 1,
        name: formData.name,
        department: formData.department,
        staffCount: 0,
      };
      
      setDesignations([...designations, newDesignation]);
      
      toast({
        title: "Designation created",
        description: "The designation has been successfully created",
      });
    }
    
    resetForm();
    setDesignationDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="designations">Designations</TabsTrigger>
        </TabsList>

        {/* Departments Tab */}
        <TabsContent value="departments" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Departments</h2>
            <Button onClick={() => {
              resetForm();
              setDepartmentDialogOpen(true);
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Department
            </Button>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Department Name</TableHead>
                    <TableHead className="hidden md:table-cell">Description</TableHead>
                    <TableHead>Staff Count</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {departments.map(department => (
                    <TableRow key={department.id}>
                      <TableCell className="font-medium">{department.name}</TableCell>
                      <TableCell className="hidden md:table-cell">{department.description}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{department.staffCount}</span>
                        </div>
                      </TableCell>
                      <TableCell>{new Date(department.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleEdit(department, "department")}
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
                                  This will permanently delete the department "{department.name}". 
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDelete(department.id, "department")}
                                  className="bg-destructive text-destructive-foreground"
                                >
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

        {/* Roles Tab */}
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
                                <AlertDialogAction 
                                  onClick={() => handleDelete(role.id, "role")}
                                  className="bg-destructive text-destructive-foreground"
                                >
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

        {/* Designations Tab */}
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
                  {designations.map(designation => (
                    <TableRow key={designation.id}>
                      <TableCell className="font-medium">{designation.name}</TableCell>
                      <TableCell>{designation.department}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{designation.staffCount}</span>
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
                                <AlertDialogAction 
                                  onClick={() => handleDelete(designation.id, "designation")}
                                  className="bg-destructive text-destructive-foreground"
                                >
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
      </Tabs>

      {/* Department Dialog */}
      <Dialog open={departmentDialogOpen} onOpenChange={setDepartmentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editItem ? "Edit Department" : "Add Department"}</DialogTitle>
            <DialogDescription>
              {editItem ? "Update the department details" : "Create a new department for your institution"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleDepartmentSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Department Name</Label>
                <Input 
                  id="name" 
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  placeholder="e.g., Mathematics"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  placeholder="Brief department description"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => {
                resetForm();
                setDepartmentDialogOpen(false);
              }}>
                Cancel
              </Button>
              <Button type="submit">
                {editItem ? "Update" : "Create"} Department
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

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
                          <TableCell>
                            {module.replace(/([A-Z])/g, " $1")
                              .replace(/^./, str => str.toUpperCase())
                              .replace(/View/g, '')
                              .replace(/Manage/g, '')}
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
                <select
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleFormChange}
                  className="w-full h-10 px-3 rounded-md border border-input"
                  required
                >
                  <option value="">Select Department</option>
                  <option value="General">General</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.name}>{dept.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => {
                resetForm();
                setDesignationDialogOpen(false);
              }}>
                Cancel
              </Button>
              <Button type="submit">
                {editItem ? "Update" : "Create"} Designation
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RoleDepartmentManagement;
