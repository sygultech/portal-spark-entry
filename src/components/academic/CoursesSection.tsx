
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DepartmentsSection from "./DepartmentsSection";
import CoursesAndBatchesSection from "./CoursesAndBatchesSection";

interface CoursesSectionProps {
  academicYearId: string;
}

export default function CoursesSection({ academicYearId }: CoursesSectionProps) {
  const [activeTab, setActiveTab] = useState("courses");
  const { profile } = useAuth();
  const isSchoolAdmin = profile?.role === "school_admin";

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Academic Structure</CardTitle>
        <CardDescription>Manage your courses, departments, and class sections</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="courses">Courses & Batches</TabsTrigger>
            {isSchoolAdmin && <TabsTrigger value="departments">Departments</TabsTrigger>}
          </TabsList>
          
          <TabsContent value="courses" className="mt-0">
            <CoursesAndBatchesSection academicYearId={academicYearId} />
          </TabsContent>
          
          {isSchoolAdmin && (
            <TabsContent value="departments" className="mt-0">
              <DepartmentsSection />
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
}

// force update

// force update
