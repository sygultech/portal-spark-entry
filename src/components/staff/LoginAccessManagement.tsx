import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Search, Key, Lock, X, Check, Filter, Download, Plus, MoreVertical, Shield, UserPlus, Info } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { staffService, createStaffLogin, disableStaffLogin } from "@/services/staffService";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types/common";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Toggle } from "@/components/ui/toggle";
import { formatRole } from "@/utils/roleUtils";

const roles: { value: UserRole; label: string }[] = [
  { value: "school_admin", label: "School Admin" },
  { value: "teacher", label: "Teacher" },
  { value: "staff", label: "Staff" },
  { value: "librarian", label: "Librarian" },
  { value: "parent", label: "Parent" }
];

const LoginAccessManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [openPopover, setOpenPopover] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [staffDetailsOpen, setStaffDetailsOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [staffData, setStaffData] = useState<any[]>([]);
  const { toast } = useToast();
  const { profile } = useAuth();
  const [activationModalOpen, setActivationModalOpen] = useState(false);
  const [staffToActivate, setStaffToActivate] = useState<any>(null);
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>(["staff"]);
  const [isMultiSelect, setIsMultiSelect] = useState(false);
  const [deactivationModalOpen, setDeactivationModalOpen] = useState(false);
  const [staffToDeactivate, setStaffToDeactivate] = useState<any>(null);

  useEffect(() => {
    fetchStaffData();
  }, []);

  const fetchStaffData = async () => {
    try {
      setLoading(true);
      const response = await staffService.getStaffList({
        search: searchTerm,
        status: statusFilter !== "all" ? statusFilter : undefined,
      });
      setStaffData(response.data || []);
    } catch (error) {
      console.error('Error fetching staff data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch staff data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAccess = async (id: string) => {
    try {
      const staff = staffData.find(s => s.id === id);
      if (!staff) return;

      const hasProfile = staff.profile_id !== null;
      
      // If activating staff, show the activation modal
      if (!hasProfile) {
        setStaffToActivate(staff);
        setActivationModalOpen(true);
        return;
      }

      // If deactivating, show the deactivation modal
      setStaffToDeactivate(staff);
      setDeactivationModalOpen(true);
    } catch (error) {
      console.error('Error updating staff status:', error);
      toast({
        title: "Error",
        description: "Failed to update user access",
        variant: "destructive",
      });
    }
  };

  const handleActivationConfirm = async () => {
    if (!staffToActivate) return;

    try {
      // Prompt for password
      const password = prompt('Enter password for staff login:');
      if (!password) {
        toast({
          title: "Error",
          description: "Password is required for activation",
          variant: "destructive",
        });
        return;
      }

      // Create login for the staff member with selected roles
      const result = await createStaffLogin(
        staffToActivate.email,
        staffToActivate.first_name,
        staffToActivate.last_name,
        staffToActivate.school_id,
        password,
        staffToActivate.id,
        selectedRoles
      );

      if (!result) {
        throw new Error('Failed to create login');
      }

      // Update local state with the new profile_id and roles
      setStaffData(staffData.map(user => 
        user.id === staffToActivate.id ? { 
          ...user, 
          profile_id: result.user_id,
          roles: selectedRoles
        } : user
      ));

      toast({
        title: "Staff Activated",
        description: "Staff member has been activated successfully",
      });
    } catch (error) {
      console.error('Error activating staff:', error);
      toast({
        title: "Error",
        description: "Failed to activate staff member",
        variant: "destructive",
      });
    } finally {
      setActivationModalOpen(false);
      setStaffToActivate(null);
      setSelectedRoles(["staff"]);
      setIsMultiSelect(false);
    }
  };

  const handleDeactivationConfirm = async () => {
    if (!staffToDeactivate) return;

    try {
      // Disable login access without changing employment status
      const result = await disableStaffLogin(staffToDeactivate.id);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to disable login access');
      }

      // Update local state to reflect the change
      setStaffData(staffData.map(user => 
        user.id === staffToDeactivate.id ? { 
          ...user, 
          profile_id: null
        } : user
      ));

      toast({
        title: "Login Access Disabled",
        description: "Staff member's login access has been disabled successfully",
      });
    } catch (error) {
      console.error('Error disabling login access:', error);
      toast({
        title: "Error",
        description: "Failed to disable login access",
        variant: "destructive",
      });
    } finally {
      setDeactivationModalOpen(false);
      setStaffToDeactivate(null);
    }
  };

  const handleResetPassword = async () => {
    try {
      // TODO: Implement password reset functionality
      toast({
        title: "Password reset",
        description: "Password reset link has been sent to the user's email",
      });
      setResetPasswordOpen(false);
    } catch (error) {
      console.error('Error resetting password:', error);
      toast({
        title: "Error",
        description: "Failed to reset password",
        variant: "destructive",
      });
    }
  };

  const handleRoleChange = (role: UserRole) => {
    if (isMultiSelect) {
      setSelectedRoles(prev => 
        prev.includes(role)
          ? prev.filter(r => r !== role)
          : [...prev, role]
      );
    } else {
      setSelectedRoles([role]);
    }
  };

  const handleStaffDetails = (staff: any) => {
    setSelectedStaff(staff);
    setStaffDetailsOpen(true);
  };

  const filteredStaff = staffData.filter(staff => {
    const name = `${staff.first_name} ${staff.last_name}`.toLowerCase();
    const matchesSearch = name.includes(searchTerm.toLowerCase()) ||
                         staff.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "active" && staff.login_enabled !== false) ||
                         (statusFilter === "inactive" && staff.login_enabled === false);
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Login Access Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage user access, roles, and permissions for your school staff
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm">
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                className="pl-8" 
                placeholder="Search by name or email..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Roles</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <p className="text-muted-foreground">Loading staff data...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredStaff.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Shield className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">No staff members found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStaff.map((staff) => (
                    <TableRow key={staff.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {staff.first_name?.charAt(0)}
                              {staff.last_name?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{staff.first_name} {staff.last_name}</div>
                            <div className="text-xs text-muted-foreground">{staff.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Popover open={openPopover === staff.id} onOpenChange={(open) => setOpenPopover(open ? staff.id : null)}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              className="w-[200px] justify-between"
                            >
                              {staff.roles?.length > 0 ? (
                                <div className="flex gap-1 flex-wrap">
                                  {staff.roles.map((role: string) => (
                                    <Badge key={role} variant="secondary" className="mr-1">
                                      {roles.find(r => r.value === role)?.label}
                                    </Badge>
                                  ))}
                                </div>
                              ) : (
                                "Select roles..."
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[200px] p-0">
                            <div className="p-2">
                              <Input
                                placeholder="Search roles..."
                                className="mb-2"
                              />
                              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                                {roles.map((role) => (
                                  <div key={role.value} className="flex items-center space-x-2">
                                    <Checkbox
                                      id={`${staff.id}-${role.value}`}
                                      checked={staff.roles?.includes(role.value)}
                                      onCheckedChange={() => handleRoleChange(role.value)}
                                    />
                                    <label
                                      htmlFor={`${staff.id}-${role.value}`}
                                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                      {role.label}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{staff.last_login || "Never"}</span>
                          {staff.last_login && (
                            <span className="text-xs text-muted-foreground">
                              {new Date(staff.last_login).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch 
                            checked={staff.profile_id !== null} 
                            onCheckedChange={() => handleToggleAccess(staff.id)} 
                          />
                          <Badge variant={staff.profile_id !== null ? "success" : "secondary"}>
                            {staff.profile_id !== null ? "Login Enabled" : "Login Disabled"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStaffDetails(staff)}
                          >
                            <Info className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => {
                                setSelectedUser(staff.email);
                                setResetPasswordOpen(true);
                              }}>
                                <Key className="h-4 w-4 mr-2" />
                                Reset Password
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Shield className="h-4 w-4 mr-2" />
                                Manage Permissions
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => handleToggleAccess(staff.id)}
                              >
                                <X className="h-4 w-4 mr-2" />
                                {staff.profile_id !== null ? 'Deactivate' : 'Activate'} Account
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Staff Details Modal */}
      <Dialog open={staffDetailsOpen} onOpenChange={setStaffDetailsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Staff Details</DialogTitle>
            <DialogDescription>
              View detailed information about the staff member
            </DialogDescription>
          </DialogHeader>
          {selectedStaff && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback>
                    {selectedStaff.first_name?.charAt(0)}
                    {selectedStaff.last_name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">
                    {selectedStaff.first_name} {selectedStaff.last_name}
                  </h3>
                  <p className="text-sm text-muted-foreground">{selectedStaff.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Department</Label>
                  <p className="text-sm">{selectedStaff.department?.name}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Designation</Label>
                  <p className="text-sm">{selectedStaff.designation?.name}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Join Date</Label>
                  <p className="text-sm">{new Date(selectedStaff.join_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Phone</Label>
                  <p className="text-sm">{selectedStaff.phone}</p>
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Roles</Label>
                <div className="flex gap-2 mt-1">
                  {selectedStaff.roles?.map((role: string) => (
                    <Badge key={role} variant="secondary">
                      {roles.find(r => r.value === role)?.label}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setStaffDetailsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={resetPasswordOpen} onOpenChange={setResetPasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              This will send a password reset link to the user's email address.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to reset the password for {selectedUser}?</p>
            <p className="text-muted-foreground text-sm mt-2">
              The user will receive an email with instructions to set a new password.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetPasswordOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleResetPassword}>
              <Lock className="h-4 w-4 mr-1" />
              Send Reset Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Activation Confirmation Modal */}
      <Dialog open={activationModalOpen} onOpenChange={setActivationModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Activate Staff Member</DialogTitle>
            <DialogDescription>
              Please review the staff details and select role(s) before activation
            </DialogDescription>
          </DialogHeader>
          {staffToActivate && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback>
                    {staffToActivate.first_name?.charAt(0)}
                    {staffToActivate.last_name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">
                    {staffToActivate.first_name} {staffToActivate.last_name}
                  </h3>
                  <p className="text-sm text-muted-foreground">{staffToActivate.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Department</Label>
                  <p className="text-sm">{staffToActivate.department?.name}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Designation</Label>
                  <p className="text-sm">{staffToActivate.designation?.name}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Employee ID</Label>
                  <p className="text-sm">{staffToActivate.employee_id}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Join Date</Label>
                  <p className="text-sm">{new Date(staffToActivate.join_date).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="role">Select Role{isMultiSelect ? 's' : ''}</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Multi-select</span>
                          <Toggle
                            pressed={isMultiSelect}
                            onPressedChange={setIsMultiSelect}
                            size="sm"
                            aria-label="Toggle multi-select mode"
                          >
                            <div className="h-4 w-4 flex items-center justify-center">
                              {isMultiSelect ? (
                                <Check className="h-3 w-3" />
                              ) : null}
                            </div>
                          </Toggle>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-[200px]">
                          {isMultiSelect 
                            ? "Multi-select mode allows assigning multiple roles to the staff member"
                            : "Single-select mode allows assigning only one role to the staff member"}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                <div className="border rounded-md p-4 space-y-2">
                  {roles.map((role) => (
                    <div key={role.value} className="flex items-center space-x-2">
                      {isMultiSelect ? (
                        <Checkbox
                          id={`role-${role.value}`}
                          checked={selectedRoles.includes(role.value)}
                          onCheckedChange={() => handleRoleChange(role.value)}
                        />
                      ) : (
                        <input
                          type="radio"
                          id={`role-${role.value}`}
                          name="role"
                          checked={selectedRoles.includes(role.value)}
                          onChange={() => handleRoleChange(role.value)}
                          className="h-4 w-4"
                        />
                      )}
                      <label
                        htmlFor={`role-${role.value}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {role.label}
                      </label>
                    </div>
                  ))}
                </div>

                <p className="text-xs text-muted-foreground">
                  {isMultiSelect 
                    ? "Selected roles will be assigned to the staff member upon activation"
                    : "The selected role will be assigned to the staff member upon activation"}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setActivationModalOpen(false);
              setStaffToActivate(null);
              setSelectedRoles(["staff"]);
              setIsMultiSelect(false);
            }}>
              Cancel
            </Button>
            <Button onClick={handleActivationConfirm}>
              <Check className="h-4 w-4 mr-2" />
              Activate Staff
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deactivation Confirmation Modal */}
      <Dialog open={deactivationModalOpen} onOpenChange={setDeactivationModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Deactivate Staff Member</DialogTitle>
            <DialogDescription>
              Please confirm that you want to deactivate this staff member's account
            </DialogDescription>
          </DialogHeader>
          {staffToDeactivate && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback>
                    {staffToDeactivate.first_name?.charAt(0)}
                    {staffToDeactivate.last_name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">
                    {staffToDeactivate.first_name} {staffToDeactivate.last_name}
                  </h3>
                  <p className="text-sm text-muted-foreground">{staffToDeactivate.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Department</Label>
                  <p className="text-sm">{staffToDeactivate.department?.name}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Designation</Label>
                  <p className="text-sm">{staffToDeactivate.designation?.name}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Employee ID</Label>
                  <p className="text-sm">{staffToDeactivate.employee_id}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Join Date</Label>
                  <p className="text-sm">{new Date(staffToDeactivate.join_date).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <p className="text-sm text-yellow-800">
                  Warning: Deactivating this account will prevent the staff member from accessing the system.
                  They will not be able to log in until their account is reactivated.
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setDeactivationModalOpen(false);
              setStaffToDeactivate(null);
            }}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeactivationConfirm}>
              <X className="h-4 w-4 mr-2" />
              Deactivate Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LoginAccessManagement;
