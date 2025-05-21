
import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import { Plus, X, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  dateOfBirth: z.string(),
  gender: z.string(),
  address: z.string(),
  city: z.string(),
  state: z.string(),
  postalCode: z.string(),
  
  // Professional Details
  employeeId: z.string(),
  joinDate: z.string(),
  department: z.string(),
  designation: z.string(),
  employmentStatus: z.string(),
  
  // Emergency Contact
  emergencyContactName: z.string(),
  emergencyContactRelation: z.string(),
  emergencyContactPhone: z.string(),
});

type StaffFormValues = z.infer<typeof staffFormSchema>;

interface StaffProfileFormProps {
  staff?: any;
}

const StaffProfileForm: React.FC<StaffProfileFormProps> = ({ staff }) => {
  const [qualifications, setQualifications] = useState([
    { id: 1, degree: "", institution: "", year: "", grade: "" }
  ]);
  
  const [experiences, setExperiences] = useState([
    { id: 1, position: "", organization: "", startYear: "", endYear: "", description: "" }
  ]);

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const { toast } = useToast();

  // Define default values based on staff prop or empty values
  const defaultValues: Partial<StaffFormValues> = {
    firstName: staff?.name?.split(" ")[0] || "",
    lastName: staff?.name?.split(" ").slice(1).join(" ") || "",
    email: staff?.email || "",
    phone: staff?.phone || "",
    dateOfBirth: "",
    gender: "male",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    
    employeeId: staff?.employeeId || "",
    joinDate: staff?.joinDate || new Date().toISOString().split('T')[0],
    department: staff?.department || "",
    designation: staff?.designation || "",
    employmentStatus: staff?.status || "Active",
    
    emergencyContactName: "",
    emergencyContactRelation: "",
    emergencyContactPhone: "",
  };

  const form = useForm<StaffFormValues>({
    resolver: zodResolver(staffFormSchema),
    defaultValues,
  });

  function onSubmit(values: StaffFormValues) {
    // In a real application, this would send data to the server
    console.log('Form submitted', values);
    console.log('Qualifications', qualifications);
    console.log('Experiences', experiences);
    
    // Display success message
    toast({
      title: "Staff profile updated",
      description: "The staff profile has been successfully saved.",
    });
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
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
          <TabsTrigger value="professional">Professional</TabsTrigger>
          <TabsTrigger value="qualifications">Qualifications</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                      name="department"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Department</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select department" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Mathematics">Mathematics</SelectItem>
                              <SelectItem value="Science">Science</SelectItem>
                              <SelectItem value="English">English</SelectItem>
                              <SelectItem value="Administration">Administration</SelectItem>
                              <SelectItem value="Physical Education">Physical Education</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="designation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Designation</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select designation" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Teacher">Teacher</SelectItem>
                              <SelectItem value="Senior Teacher">Senior Teacher</SelectItem>
                              <SelectItem value="Department Head">Department Head</SelectItem>
                              <SelectItem value="Office Manager">Office Manager</SelectItem>
                              <SelectItem value="Coach">Coach</SelectItem>
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
                            placeholder="Job Title"
                            value={experience.position}
                            onChange={(e) => updateExperience(experience.id, 'position', e.target.value)}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Organization</label>
                          <Input
                            placeholder="Company/Institution Name"
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
                            placeholder="End Year (or 'Present')"
                            value={experience.endYear}
                            onChange={(e) => updateExperience(experience.id, 'endYear', e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Description</label>
                        <Textarea
                          placeholder="Brief description of responsibilities"
                          value={experience.description}
                          onChange={(e) => updateExperience(experience.id, 'description', e.target.value)}
                          rows={3}
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

            <TabsContent value="documents" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Documents & Files</CardTitle>
                  <CardDescription>Upload identification and certification documents</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* ID Document Upload */}
                    <div className="border rounded-md p-4">
                      <h4 className="font-medium mb-2">ID Proof</h4>
                      <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center text-center">
                        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-sm font-medium">
                          Drag & drop files here or click to browse
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Supported formats: JPG, PNG, PDF
                        </p>
                        <Button type="button" variant="outline" size="sm" className="mt-4">
                          Upload ID Document
                        </Button>
                      </div>
                    </div>

                    {/* Certificate Upload */}
                    <div className="border rounded-md p-4">
                      <h4 className="font-medium mb-2">Certificates</h4>
                      <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center text-center">
                        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-sm font-medium">
                          Drag & drop files here or click to browse
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Supported formats: JPG, PNG, PDF
                        </p>
                        <Button type="button" variant="outline" size="sm" className="mt-4">
                          Upload Certificate
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Uploaded Documents List (Mock) */}
                  <div className="border rounded-md overflow-hidden">
                    <div className="bg-muted px-4 py-2 text-sm font-medium">
                      Uploaded Documents
                    </div>
                    <div className="divide-y">
                      <div className="flex justify-between items-center px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">National ID Card</span>
                          <Badge variant="outline" className="text-xs">ID Proof</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Uploaded on: 01/01/2023</span>
                          <Button variant="ghost" size="sm">View</Button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Master's Certificate</span>
                          <Badge variant="outline" className="text-xs">Certificate</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Uploaded on: 01/02/2023</span>
                          <Button variant="ghost" size="sm">View</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <div className="sticky bottom-0 bg-background p-4 border-t flex justify-end gap-2 mt-8">
              <Button type="button" variant="outline">Cancel</Button>
              <Button type="submit">Save Profile</Button>
            </div>
          </form>
        </Form>
      </Tabs>
    </div>
  );
};

export default StaffProfileForm;
