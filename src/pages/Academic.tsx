
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AcademicYears from "@/components/academic/AcademicYears";
import CoursesBatches from "@/components/academic/CoursesBatches";
import SubjectsManagement from "@/components/academic/SubjectsManagement";
import GradingSystem from "@/components/academic/GradingSystem";
import ElectiveGroups from "@/components/academic/ElectiveGroups";
import StudentPromotions from "@/components/academic/StudentPromotions";
import AcademicConfig from "@/components/academic/AcademicConfig";
import { AcademicProvider } from "@/contexts/AcademicContext";

const Academic = () => {
  const { profile, isLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("academic-years");

  // Redirect if not school_admin
  if (!isLoading && profile?.role !== "school_admin") {
    navigate("/");
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <AcademicProvider>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Academic Management</h1>
            <Breadcrumb className="mt-2">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/school-admin">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/academic">Academic</BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Academic Structure Management</CardTitle>
            <CardDescription>
              Configure and manage your school's academic structure, courses, subjects, and grading systems.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="mb-4 w-full justify-start overflow-x-auto flex-nowrap">
                <TabsTrigger value="academic-years">Academic Years</TabsTrigger>
                <TabsTrigger value="courses-batches">Courses & Batches</TabsTrigger>
                <TabsTrigger value="subjects">Subjects</TabsTrigger>
                <TabsTrigger value="grading">Grading System</TabsTrigger>
                <TabsTrigger value="electives">Elective Groups</TabsTrigger>
                <TabsTrigger value="promotions">Student Promotions</TabsTrigger>
                <TabsTrigger value="config">Configuration</TabsTrigger>
              </TabsList>

              <TabsContent value="academic-years">
                <AcademicYears />
              </TabsContent>

              <TabsContent value="courses-batches">
                <CoursesBatches />
              </TabsContent>

              <TabsContent value="subjects">
                <SubjectsManagement />
              </TabsContent>

              <TabsContent value="grading">
                <GradingSystem />
              </TabsContent>

              <TabsContent value="electives">
                <ElectiveGroups />
              </TabsContent>

              <TabsContent value="promotions">
                <StudentPromotions />
              </TabsContent>

              <TabsContent value="config">
                <AcademicConfig />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AcademicProvider>
  );
};

export default Academic;
