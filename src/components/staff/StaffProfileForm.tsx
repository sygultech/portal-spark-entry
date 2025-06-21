import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { hasRole } from "@/utils/roleUtils";
import { Checkbox } from "@/components/ui/checkbox";
import { staffService } from "@/services/staffService";
import { useDepartments } from "@/hooks/useDepartments";
import { useDesignations } from "@/hooks/useDesignations";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface StaffProfileFormProps {
  staff?: any;
  onSuccess?: () => void;
  onCancel?: () => void;
  mode?: 'create' | 'edit';
}

const formatDateForInput = (dateString: string | null | undefined): string => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  } catch (e) {
    return '';
  }
};

const StaffProfileForm: React.FC<StaffProfileFormProps> = ({ 
  staff, 
  onSuccess, 
  onCancel,
  mode = 'create' 
}) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { profile } = useAuth();
  const { departments, isLoading: departmentsLoading } = useDepartments();
  const { designations, isLoading: designationsLoading } = useDesignations();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    employeeId: "",
    joinDate: "",
    address: "",
    isTeacher: false,
    departmentId: "",
    designationId: "",
    employmentStatus: "Active",
    gender: "",
    city: "",
    state: "",
    postalCode: "",
    dateOfBirth: ""
  });

  // Initialize form data when editing
  useEffect(() => {
    if (mode === 'edit' && staff) {
      setFormData({
        firstName: staff.first_name || "",
        lastName: staff.last_name || "",
        email: staff.email || "",
        phone: staff.phone || "",
        employeeId: staff.employee_id || "",
        joinDate: formatDateForInput(staff.join_date),
        address: staff.address || "",
        isTeacher: staff.is_teacher || false,
        departmentId: staff.department_id || "",
        designationId: staff.designation_id || "",
        employmentStatus: staff.employment_status || "Active",
        gender: staff.gender || "",
        city: staff.city || "",
        state: staff.state || "",
        postalCode: staff.postal_code || "",
        dateOfBirth: formatDateForInput(staff.date_of_birth)
      });
    }
  }, [staff, mode]);

  // Check if user has permission to manage staff
  const canManageStaff = hasRole(profile, "school_admin");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      isTeacher: checked
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManageStaff) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to manage staff members",
        variant: "destructive",
      });
      return;
    }

    if (!profile?.school_id) {
      toast({
        title: "Error",
        description: "School ID is required",
        variant: "destructive",
      });
      return;
    }

    // Validate required fields
    if (!formData.departmentId || !formData.designationId) {
      toast({
        title: "Error",
        description: "Department and Designation are required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const dataToSubmit = {
        ...formData,
        schoolId: profile.school_id,
        roles: formData.isTeacher ? ["teacher"] : ["staff"],
        // Format dates properly
        joinDate: formData.joinDate || null,
        dateOfBirth: formData.dateOfBirth || null
      };

      if (mode === 'edit' && staff) {
        // Update existing staff
        const response = await staffService.updateStaff(staff.id, dataToSubmit);

        if (response.error) {
          throw new Error(response.error);
        }

        toast({
          title: "Staff Updated",
          description: "Staff member has been updated successfully",
        });
      } else {
        // Create new staff
        const response = await staffService.createStaff(dataToSubmit);

        if (response.error) {
          throw new Error(response.error);
        }

        toast({
          title: "Staff Added",
          description: "Staff member has been added successfully",
        });
      }

      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }

      // Only reset form if creating new staff
      if (mode === 'create') {
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          employeeId: "",
          joinDate: "",
          address: "",
          isTeacher: false,
          departmentId: "",
          designationId: "",
          employmentStatus: "Active",
          gender: "",
          city: "",
          state: "",
          postalCode: "",
          dateOfBirth: ""
        });
      }
    } catch (error) {
      console.error('Error managing staff:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to manage staff member",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!canManageStaff) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Access Denied</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            You don't have permission to manage staff members.
          </p>
        </CardContent>
      </Card>
    );
  }

  const filteredDesignations = designations.filter(
    designation => !formData.departmentId || designation.department_id === formData.departmentId
  );

  return (
    <div className="space-y-6">
      {mode === 'create' && (
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Add New Staff Member</h1>
          <p className="text-muted-foreground">
            Fill in the details to add a new staff member to your school
          </p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{mode === 'create' ? 'Staff Information' : 'Edit Staff Information'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="Enter first name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Enter last name"
                  required
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter email address"
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter phone number"
                  required
                />
              </div>
            </div>

            {/* Employment Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="employeeId">Employee ID</Label>
                <Input
                  id="employeeId"
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleInputChange}
                  placeholder="Enter employee ID"
                  required
                />
              </div>
              <div>
                <Label htmlFor="joinDate">Join Date</Label>
                <Input
                  id="joinDate"
                  name="joinDate"
                  type="date"
                  value={formData.joinDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            {/* Department and Designation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="department">Department</Label>
                {departmentsLoading ? (
                  <div className="flex items-center gap-2 h-10 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading departments...
                  </div>
                ) : (
                  <Select
                    value={formData.departmentId}
                    onValueChange={(value) => handleSelectChange("departmentId", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div>
                <Label htmlFor="designation">Designation</Label>
                {designationsLoading ? (
                  <div className="flex items-center gap-2 h-10 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading designations...
                  </div>
                ) : (
                  <Select
                    value={formData.designationId}
                    onValueChange={(value) => handleSelectChange("designationId", value)}
                    disabled={!formData.departmentId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={formData.departmentId ? "Select designation" : "Select department first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredDesignations.map((desig) => (
                        <SelectItem key={desig.id} value={desig.id}>
                          {desig.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            {/* Employment Status and Teacher Flag */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="employmentStatus">Employment Status</Label>
                <Select
                  value={formData.employmentStatus}
                  onValueChange={(value) => handleSelectChange("employmentStatus", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="On Leave">On Leave</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <Checkbox
                  id="isTeacher"
                  checked={formData.isTeacher}
                  onCheckedChange={handleCheckboxChange}
                />
                <Label htmlFor="isTeacher">Is a Teacher</Label>
              </div>
            </div>

            {/* Personal Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => handleSelectChange("gender", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Enter address"
                className="resize-none"
              />
            </div>

            {/* City, State, Postal Code */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="Enter city"
                />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  placeholder="Enter state"
                />
              </div>
              <div>
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input
                  id="postalCode"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  placeholder="Enter postal code"
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === 'create' ? 'Add Staff Member' : 'Update Staff Member'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default StaffProfileForm;
