
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { 
  Users, 
  School, 
  GraduationCap, 
  Settings,
  MessageSquare,
  FileText,
  Bell
} from "lucide-react";

const SchoolAdminDashboard = () => {
  const { profile, isLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect if not school_admin
  useEffect(() => {
    if (!isLoading && profile?.role !== "school_admin") {
      navigate("/");
    }
  }, [profile, isLoading, navigate]);

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
          <h1 className="text-3xl font-bold tracking-tight">School Admin Dashboard</h1>
          <Breadcrumb className="mt-2">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/school-admin">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
            School Admin
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">256</div>
              <GraduationCap className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Teachers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">32</div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Classes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">16</div>
              <School className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">8</div>
              <Bell className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Manage your school from here</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <Card className="border border-dashed">
            <CardHeader className="p-4">
              <CardTitle className="text-base flex items-center gap-2">
                <GraduationCap className="h-5 w-5" /> Student Management
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-sm text-muted-foreground">
              Manage students, enrollments, and attendance
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <Button variant="outline" className="w-full" onClick={() => navigate('/students')}>
                Manage Students
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="border border-dashed">
            <CardHeader className="p-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-5 w-5" /> Staff Management
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-sm text-muted-foreground">
              Manage teachers and other staff members
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <Button variant="outline" className="w-full" onClick={() => navigate('/staff')}>
                Manage Staff
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="border border-dashed">
            <CardHeader className="p-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Settings className="h-5 w-5" /> School Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-sm text-muted-foreground">
              Configure school details and preferences
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <Button variant="outline" className="w-full" onClick={() => navigate('/settings')}>
                Settings
              </Button>
            </CardFooter>
          </Card>
        </CardContent>
      </Card>

      <Tabs defaultValue="students">
        <TabsList className="mb-4">
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="teachers">Teachers</TabsTrigger>
          <TabsTrigger value="classes">Classes</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
        <TabsContent value="students">
          <Card>
            <CardHeader>
              <CardTitle>Recent Students</CardTitle>
              <CardDescription>Newly registered students in your school.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md divide-y">
                {[1, 2, 3].map((index) => (
                  <div key={index} className="p-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>S{index}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">Student {index}</p>
                        <p className="text-sm text-muted-foreground">
                          Grade {index + 5}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">View Details</Button>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => navigate('/students')}>
                View All Students
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="teachers">
          <Card>
            <CardHeader>
              <CardTitle>Faculty Members</CardTitle>
              <CardDescription>Teachers in your school.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md divide-y">
                {[1, 2, 3].map((index) => (
                  <div key={index} className="p-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>T{index}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">Teacher {index}</p>
                        <p className="text-sm text-muted-foreground">
                          {index === 1 ? 'Mathematics' : index === 2 ? 'Science' : 'English'}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">View Profile</Button>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => navigate('/teachers')}>
                View All Teachers
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="classes">
          <Card>
            <CardHeader>
              <CardTitle>Classes & Schedules</CardTitle>
              <CardDescription>Manage your school's classes.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md divide-y">
                {['Grade 6', 'Grade 7', 'Grade 8'].map((grade, index) => (
                  <div key={index} className="p-4 flex justify-between items-center">
                    <div>
                      <p className="font-medium">{grade}</p>
                      <p className="text-sm text-muted-foreground">
                        {20 + index} students • {3 + index} subjects
                      </p>
                    </div>
                    <Button variant="outline" size="sm">View Schedule</Button>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => navigate('/classes')}>
                View All Classes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>School Reports</CardTitle>
              <CardDescription>View and generate reports for your school.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md divide-y">
                {['Attendance', 'Academic Performance', 'Teacher Evaluation'].map((report, index) => (
                  <div key={index} className="p-4 flex justify-between items-center">
                    <div>
                      <p className="font-medium">{report}</p>
                      <p className="text-sm text-muted-foreground">
                        Last updated: {new Date().toLocaleDateString()}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">Generate</Button>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => navigate('/reports')}>
                View All Reports
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SchoolAdminDashboard;

// force update
