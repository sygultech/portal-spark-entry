import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbSeparator 
} from "@/components/ui/breadcrumb";
import AcademicYearSection from "@/components/academic/AcademicYearSection";
import CoursesSection from "@/components/academic/CoursesSection";
import SubjectsSection from "@/components/academic/SubjectsSection";
import GradingSystemsSection from "@/components/academic/GradingSystemsSection";
import ElectiveGroupsSection from "@/components/academic/ElectiveGroupsSection";
import { hasRole } from "@/utils/roleUtils";

const Academic = () => {
  const { profile, isLoading } = useAuth();
  const [activeTab, setActiveTab] = React.useState("academic-years");
  const [selectedAcademicYearId, setSelectedAcademicYearId] = React.useState<string>("");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Check if user is school_admin using the helper function
  if (!hasRole(profile, "school_admin")) {
    return <Navigate to="/" />;
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Academic Management</h1>
          <Breadcrumb className="mt-2">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/school-admin">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink>Academic</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="academic-years">Academic Years</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="subjects">Subjects</TabsTrigger>
          <TabsTrigger value="grading">Grading Systems</TabsTrigger>
          <TabsTrigger value="electives">Elective Groups</TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="academic-years" className="mt-0">
            <AcademicYearSection onCurrentYearChange={setSelectedAcademicYearId} />
          </TabsContent>
          
          <TabsContent value="courses" className="mt-0">
            {selectedAcademicYearId ? (
              <CoursesSection academicYearId={selectedAcademicYearId} />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Select Academic Year</CardTitle>
                  <CardDescription>
                    Please select an academic year from the Academic Years tab to manage courses.
                  </CardDescription>
                </CardHeader>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="subjects" className="mt-0">
            <SubjectsSection />
          </TabsContent>
          
          <TabsContent value="grading" className="mt-0">
            <GradingSystemsSection />
          </TabsContent>
          
          <TabsContent value="electives" className="mt-0">
            <ElectiveGroupsSection />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default Academic;
