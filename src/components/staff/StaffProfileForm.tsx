import React, { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { staffService, CreateStaffData } from '@/services/staffService';
import { supabase } from '@/integrations/supabase/client';
import { StaffDocumentsTab } from './StaffDocumentsTab';

// Define schema for staff profile form
const staffFormSchema = z.object({
  // Personal Information
  firstName: z.string().min(2, {
    message: "First name must be at least 2 characters.",
  }),
  lastName: z.string().min(1, {
    message: "Last name must be at least 1 character.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  phone: z.string().min(10, {
    message: "Phone number must be at least 10 characters.",
  }),
  dateOfBirth: z.string().optional(),
  gender: z.string(),
  address: z.string(),
  city: z.string(),
  state: z.string(),
  postalCode: z.string(),
  
  // Professional Details
  employeeId: z.string(),
  joinDate: z.string().optional(),
  departmentId: z.string(),
  designationId: z.string(),
  employmentStatus: z.string(),
  
  // Emergency Contact
  emergencyContactName: z.string(),
  emergencyContactRelation: z.string(),
  emergencyContactPhone: z.string(),
});

type StaffFormValues = z.infer<typeof staffFormSchema>;

interface StaffProfileFormProps {
  staff?: any;
  onCancel?: () => void;
}

interface Department {
  id: string;
  name: string;
}

interface Designation {
  id: string;
  name: string;
}

const StaffProfileForm: React.FC<StaffProfileFormProps> = ({ staff, onCancel }) => {
  const { profile } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [qualifications, setQualifications] = useState(
    staff?.qualifications?.length
      ? staff.qualifications.map((q: any, idx: number) => ({
          id: q.id || idx + 1,
          degree: q.degree,
          institution: q.institution,
          year: q.year?.toString() || "",
          grade: q.grade
        }))
      : [{ id: 1, degree: "", institution: "", year: "", grade: "" }]
  );
  const [experiences, setExperiences] = useState(
    staff?.experiences?.length
      ? staff.experiences.map((e: any, idx: number) => ({
          id: e.id || idx + 1,
          position: e.position,
          organization: e.organization,
          startYear: e.start_year?.toString() || e.startYear || "",
          endYear: e.end_year?.toString() || e.endYear || "",
          description: e.description
        }))
      : [{ id: 1, position: "", organization: "", startYear: "", endYear: "", description: "" }]
  );
  const [profileImage, setProfileImage] = useState<string | null>(staff?.avatar || staff?.avatar_url || null);
  const { toast } = useToast();

  // Define default values based on staff prop or empty values
  const defaultValues: Partial<StaffFormValues> = {
    firstName: staff?.firstName || staff?.first_name || "",
    lastName: staff?.lastName || staff?.last_name || "",
    email: staff?.email || "",
    phone: staff?.phone || "",
    dateOfBirth: staff?.dateOfBirth || staff?.date_of_birth || "",
    gender: staff?.gender || "male",
    address: staff?.address || "",
    city: staff?.city || "",
    state: staff?.state || "",
    postalCode: staff?.postalCode || staff?.postal_code || "",
    employeeId: staff?.employeeId || staff?.employee_id || "",
    joinDate: staff?.joinDate || staff?.join_date || new Date().toISOString().split('T')[0],
    departmentId: staff?.departmentId || staff?.department_id || "",
    designationId: staff?.designationId || staff?.designation_id || "",
    employmentStatus: staff?.employmentStatus || staff?.employment_status || "Active",
    emergencyContactName: staff?.emergencyContactName || staff?.emergency_contact?.contact_name || "",
    emergencyContactRelation: staff?.emergencyContactRelation || staff?.emergency_contact?.relationship || "",
    emergencyContactPhone: staff?.emergencyContactPhone || staff?.emergency_contact?.contact_phone || "",
  };

  const form = useForm<StaffFormValues>({
    resolver: zodResolver(staffFormSchema),
    defaultValues,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch departments
        const { data: deptData, error: deptError } = await supabase
          .from('departments')
          .select('id, name')
          .order('name');

        if (deptError) throw deptError;
        setDepartments(deptData || []);

        // Fetch designations
        const { data: desigData, error: desigError } = await supabase
          .from('designations')
          .select('id, name')
          .order('name');

        if (desigError) throw desigError;
        setDesignations(desigData || []);
      } catch (error) {
        console.error('Error fetching form data:', error);
        toast({
          title: "Error",
          description: "Failed to load departments and designations",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    setQualifications(
      staff?.qualifications?.length
        ? staff.qualifications.map((q: any, idx: number) => ({
            id: q.id || idx + 1,
            degree: q.degree,
            institution: q.institution,
            year: q.year?.toString() || "",
            grade: q.grade
          }))
        : [{ id: 1, degree: "", institution: "", year: "", grade: "" }]
    );
    setExperiences(
      staff?.experiences?.length
        ? staff.experiences.map((e: any, idx: number) => ({
            id: e.id || idx + 1,
            position: e.position,
            organization: e.organization,
            startYear: e.start_year?.toString() || e.startYear || "",
            endYear: e.end_year?.toString() || e.endYear || "",
            description: e.description
          }))
        : [{ id: 1, position: "", organization: "", startYear: "", endYear: "", description: "" }]
    );
  }, [staff]);

  function onSubmit(values: StaffFormValues) {
    console.log('Profile:', profile);
    console.log('School ID:', profile?.school_id);
    
    if (!profile) {
      toast({
        title: "Error",
        description: "User profile not found. Please try logging out and logging back in.",
        variant: "destructive",
      });
      return;
    }

    if (!profile.school_id) {
      toast({
        title: "Error",
        description: "You are not associated with any school. Please contact your administrator.",
        variant: "destructive",
      });
      return;
    }

    if (!profile.role || profile.role !== 'school_admin') {
      toast({
        title: "Error",
        description: "You do not have permission to add staff members.",
        variant: "destructive",
      });
      return;
    }

    const staffData: CreateStaffData = {
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      phone: values.phone,
      dateOfBirth: values.dateOfBirth || null,
      gender: values.gender,
      address: values.address,
      city: values.city,
      state: values.state,
      postalCode: values.postalCode,
      employeeId: values.employeeId,
      joinDate: values.joinDate || new Date().toISOString().split('T')[0],
      departmentId: values.departmentId,
      designationId: values.designationId,
      employmentStatus: values.employmentStatus,
      schoolId: profile.school_id,
      emergencyContact: {
        contactName: values.emergencyContactName,
        relationship: values.emergencyContactRelation,
        contactPhone: values.emergencyContactPhone,
      },
      qualifications: qualifications.map(q => ({
        degree: q.degree,
        institution: q.institution,
        year: parseInt(q.year) || 0,
        grade: q.grade,
      })),
      experiences: experiences.map(e => ({
        position: e.position,
        organization: e.organization,
        startYear: parseInt(e.startYear) || 0,
        endYear: e.endYear ? parseInt(e.endYear) : undefined,
        description: e.description,
      })),
      documents: [], // TODO: Implement document upload
    };

    console.log('Staff Data:', staffData);

    if (staff?.id) {
      // Update existing staff
      staffService.updateStaff(staff.id, staffData)
        .then((response) => {
          if (response.error) {
            console.error('Error response:', response.error);
            toast({
              title: "Error",
              description: response.error,
              variant: "destructive",
            });
            return;
          }
          toast({
            title: "Success",
            description: "Staff member updated successfully",
          });
        })
        .catch((error) => {
          console.error('Error details:', error);
          toast({
            title: "Error",
            description: error.message || "Failed to update staff member",
            variant: "destructive",
          });
        });
    } else {
      // Create new staff
      staffService.createStaff(staffData)
        .then((response) => {
          if (response.error) {
            console.error('Error response:', response.error);
            toast({
              title: "Error",
              description: response.error,
              variant: "destructive",
            });
            return;
          }
          toast({
            title: "Success",
            description: "Staff member created successfully",
          });
        })
        .catch((error) => {
          console.error('Error details:', error);
          toast({
            title: "Error",
            description: error.message || "Failed to create staff member",
            variant: "destructive",
          });
        });
    }
  }

  const addQualification = () => {
    const newId = qualifications.length > 0 ? Math.max(...qualifications.map(q => q.id)) + 1 : 1;
    setQualifications([...qualifications, { id: newId, degree: "", institution: "", year: "", grade: "" }]);
  };

  const removeQualification = (id: number) => {
    setQualifications(qualifications.filter(q => q.id !== id));
  };

  const updateQualification = (id: number, field: string, value: string) => {
    setQualifications(qualifications.map(q => 
      q.id === id ? { ...q, [field]: value } : q
    ));
  };

  const addExperience = () => {
    const newId = experiences.length > 0 ? Math.max(...experiences.map(e => e.id)) + 1 : 1;
    setExperiences([...experiences, { id: newId, position: "", organization: "", startYear: "", endYear: "", description: "" }]);
  };

  const removeExperience = (id: number) => {
    setExperiences(experiences.filter(e => e.id !== id));
  };

  const updateExperience = (id: number, field: string, value: string) => {
    setExperiences(experiences.map(e => 
      e.id === id ? { ...e, [field]: value } : e
    ));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="professional">Professional</TabsTrigger>
          <TabsTrigger value="qualifications">Qualifications</TabsTrigger>
          <TabsTrigger value="experiences">Experiences</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <TabsContent value="personal" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Enter the staff member's personal details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Profile Image Upload */}
                  <div className="flex flex-col items-center space-y-4">
                    <Avatar className="h-24 w-24 cursor-pointer relative group">
                      <AvatarImage src={profileImage || staff?.avatar} alt="Profile" />
                      <AvatarFallback className="text-lg">
                        {form.watch("firstName")?.[0] || ""}{form.watch("lastName")?.[0] || ""}
                      </AvatarFallback>
                      <label htmlFor="profile-image" className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <Upload className="h-6 w-6 text-white" />
                      </label>
                    </Avatar>
                    <Input 
                      id="profile-image" 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleImageChange}
                    />
                    <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById('profile-image')?.click()}>
                      Change Photo
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input placeholder="First name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Last name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="Email address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="Phone number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="dateOfBirth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date of Birth</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gender</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select gender" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Enter full address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="City" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State/Province</FormLabel>
                          <FormControl>
                            <Input placeholder="State/Province" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="postalCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Postal Code</FormLabel>
                          <FormControl>
                            <Input placeholder="Postal code" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Emergency Contact */}
                  <div className="border-t pt-4 mt-4">
                    <h3 className="text-lg font-medium mb-4">Emergency Contact</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="emergencyContactName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Emergency contact name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="emergencyContactRelation"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Relationship</FormLabel>
                            <FormControl>
                              <Input placeholder="Relationship" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="emergencyContactPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact Phone</FormLabel>
                            <FormControl>
                              <Input placeholder="Emergency contact phone" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="professional" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Professional Details</CardTitle>
                  <CardDescription>Staff employment information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="employeeId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Employee ID</FormLabel>
                          <FormControl>
                            <Input placeholder="Employee ID" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="joinDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Join Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="departmentId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Department</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                            disabled={isLoading}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select department" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {departments.map((dept) => (
                                <SelectItem key={dept.id} value={dept.id}>
                                  {dept.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="designationId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Designation</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                            disabled={isLoading}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select designation" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {designations.map((desig) => (
                                <SelectItem key={desig.id} value={desig.id}>
                                  {desig.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="employmentStatus"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Employment Status</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Active">Active</SelectItem>
                              <SelectItem value="On Leave">On Leave</SelectItem>
                              <SelectItem value="Inactive">Inactive</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="qualifications" className="mt-6 space-y-6">
              {/* Academic Qualifications */}
              <Card>
                <CardHeader>
                  <CardTitle>Academic Qualifications</CardTitle>
                  <CardDescription>Add staff academic qualifications and certifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {qualifications.map((qualification) => (
                    <div key={qualification.id} className="border rounded-md p-4 space-y-4 relative">
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        className="absolute right-2 top-2"
                        onClick={() => removeQualification(qualification.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Degree/Certificate</label>
                          <Input
                            placeholder="Degree or Certificate"
                            value={qualification.degree}
                            onChange={(e) => updateQualification(qualification.id, 'degree', e.target.value)}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Institution</label>
                          <Input
                            placeholder="Institution Name"
                            value={qualification.institution}
                            onChange={(e) => updateQualification(qualification.id, 'institution', e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Year</label>
                          <Input
                            placeholder="Year"
                            value={qualification.year}
                            onChange={(e) => updateQualification(qualification.id, 'year', e.target.value)}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Grade/CGPA</label>
                          <Input
                            placeholder="Grade or CGPA"
                            value={qualification.grade}
                            onChange={(e) => updateQualification(qualification.id, 'grade', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full flex items-center gap-1" 
                    onClick={addQualification}
                  >
                    <Plus className="h-4 w-4" />
                    Add Qualification
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="experiences" className="mt-6 space-y-6">
              {/* Work Experience */}
              <Card>
                <CardHeader>
                  <CardTitle>Work Experience</CardTitle>
                  <CardDescription>Add staff previous work experience</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {experiences.map((experience) => (
                    <div key={experience.id} className="border rounded-md p-4 space-y-4 relative">
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        className="absolute right-2 top-2"
                        onClick={() => removeExperience(experience.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Position</label>
                          <Input
                            placeholder="Job Position"
                            value={experience.position}
                            onChange={(e) => updateExperience(experience.id, 'position', e.target.value)}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Organization</label>
                          <Input
                            placeholder="Organization Name"
                            value={experience.organization}
                            onChange={(e) => updateExperience(experience.id, 'organization', e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Start Year</label>
                          <Input
                            placeholder="Start Year"
                            value={experience.startYear}
                            onChange={(e) => updateExperience(experience.id, 'startYear', e.target.value)}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium">End Year</label>
                          <Input
                            placeholder="End Year (if applicable)"
                            value={experience.endYear}
                            onChange={(e) => updateExperience(experience.id, 'endYear', e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Description</label>
                        <Textarea
                          placeholder="Job Description"
                          value={experience.description}
                          onChange={(e) => updateExperience(experience.id, 'description', e.target.value)}
                        />
                      </div>
                    </div>
                  ))}

                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full flex items-center gap-1" 
                    onClick={addExperience}
                  >
                    <Plus className="h-4 w-4" />
                    Add Experience
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents">
              <Card>
                <CardHeader>
                  <CardTitle>Documents</CardTitle>
                  <CardDescription>
                    Upload and manage staff documents
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {staff?.id ? (
                    <StaffDocumentsTab staffId={staff.id} />
                  ) : (
                    <p className="text-muted-foreground">
                      Save the staff profile first to upload documents.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <div className="flex justify-end gap-4">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : staff ? "Update Staff" : "Add Staff"}
              </Button>
            </div>
          </form>
        </Form>
      </Tabs>
    </div>
  );
};

export default StaffProfileForm;
