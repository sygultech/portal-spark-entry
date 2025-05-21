
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  School, 
  User, 
  Users, 
  Settings, 
  BarChart3, 
  BookOpen, 
  GraduationCap,
  Building
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { useToast } from "@/hooks/use-toast";
import SchoolFormModal from "@/components/schools/SchoolFormModal";
import type { SchoolFormData } from "@/types/school";
import { supabase } from "@/integrations/supabase/client";

const SuperAdminDashboard = () => {
  const { profile, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Redirect if not super_admin
  useEffect(() => {
    if (!isLoading && profile?.role !== "super_admin") {
      navigate("/");
    }
  }, [profile, isLoading, navigate]);

  const handleAddSchool = (formData: SchoolFormData) => {
    toast({
      title: "School Added",
      description: `${formData.name} has been added to the system`,
    });
    // Refresh data or state if needed
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Super Admin Dashboard</h1>
          <Breadcrumb className="mt-2">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/super-admin-dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
            Super Admin
          </Badge>
          <Avatar>
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback>
              {profile?.first_name?.[0]}{profile?.last_name?.[0]}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Schools</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">12</div>
              <School className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Administrators</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">24</div>
              <User className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Teachers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">56</div>
              <GraduationCap className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">345</div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Manage your platform from here</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <Card className="border border-dashed">
            <CardHeader className="p-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Building className="h-5 w-5" /> Tenant Management
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-sm text-muted-foreground">
              Manage schools, admins, and subscription plans
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <Button variant="outline" className="w-full" onClick={() => navigate('/school-management')}>
                Manage Schools
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="border border-dashed">
            <CardHeader className="p-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-5 w-5" /> User Management
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-sm text-muted-foreground">
              Manage users, roles, and permissions
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <Button variant="outline" className="w-full">
                Manage Users
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="border border-dashed">
            <CardHeader className="p-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Settings className="h-5 w-5" /> System Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-sm text-muted-foreground">
              Configure system-wide settings
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <Button variant="outline" className="w-full">
                Settings
              </Button>
            </CardFooter>
          </Card>
        </CardContent>
      </Card>

      <Tabs defaultValue="schools">
        <TabsList className="mb-4">
          <TabsTrigger value="schools">Schools</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="schools">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Schools Management</CardTitle>
                <CardDescription>Manage all schools in the system.</CardDescription>
              </div>
              <Button onClick={() => setIsAddModalOpen(true)}>Add New School</Button>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md divide-y">
                {[1, 2, 3].map((index) => (
                  <div key={index} className="p-4 flex justify-between items-center">
                    <div>
                      <p className="font-medium">School {index}</p>
                      <p className="text-sm text-muted-foreground">
                        {10 + index} Teachers • {50 + index * 10} Students
                      </p>
                    </div>
                    <Button variant="outline" size="sm">Manage</Button>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Previous</Button>
              <Button onClick={() => navigate('/school-management')}>Manage All Schools</Button>
              <Button variant="outline">Next</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage all users in the system.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md divide-y">
                {[1, 2, 3].map((index) => (
                  <div key={index} className="p-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>U{index}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">User {index}</p>
                        <p className="text-sm text-muted-foreground">
                          {index % 2 === 0 ? 'School Admin' : 'Teacher'}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Previous</Button>
              <Button>Add New User</Button>
              <Button variant="outline">Next</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>System Reports</CardTitle>
              <CardDescription>View system-wide reports and analytics.</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <div className="text-center py-10 text-muted-foreground flex flex-col items-center">
                <BarChart3 className="h-12 w-12 mb-4" />
                <p>Reports will be available soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>Configure system-wide settings.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md divide-y">
                {['General', 'Security', 'Email', 'Integration'].map((setting, index) => (
                  <div key={index} className="p-4 flex justify-between items-center">
                    <div>
                      <p className="font-medium">{setting}</p>
                      <p className="text-sm text-muted-foreground">
                        Manage {setting.toLowerCase()} settings
                      </p>
                    </div>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* School Creation Modal */}
      <SchoolFormModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSubmit={handleAddSchool} 
      />
    </div>
  );
};

export default SuperAdminDashboard;

// force update

// force update
