
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  PlusCircle,
  GraduationCap,
  BookOpen
} from "lucide-react";
import { Course, Batch, AcademicYear } from "@/types/academic";
import BatchList from "./BatchList";

const CoursesSection = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  
  // Mock academic years
  const mockAcademicYears: AcademicYear[] = [
    {
      id: "1",
      name: "Academic Year 2024-2025",
      start_date: "2024-06-01",
      end_date: "2025-04-30",
      is_current: true,
      is_locked: false,
      school_id: profile?.school_id || "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  // Mock courses with batches
  const mockCourses: (Course & { batches: Batch[] })[] = [
    {
      id: "1",
      name: "Grade 1",
      code: "G1",
      academic_year_id: "1",
      school_id: profile?.school_id || "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      batches: [
        {
          id: "1",
          name: "Grade 1-A",
          capacity: 30,
          course_id: "1",
          academic_year_id: "1",
          school_id: profile?.school_id || "",
          is_archived: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: "2",
          name: "Grade 1-B",
          capacity: 30,
          course_id: "1",
          academic_year_id: "1", 
          school_id: profile?.school_id || "",
          is_archived: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]
    },
    {
      id: "2",
      name: "Grade 2",
      code: "G2",
      academic_year_id: "1",
      school_id: profile?.school_id || "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      batches: []
    }
  ];
  
  // Use mock data for academicYears
  const { data: academicYears = mockAcademicYears } = useQuery({
    queryKey: ['academicYears', profile?.school_id],
    queryFn: async () => mockAcademicYears,
    enabled: !!profile?.school_id
  });

  // Get current academic year
  const currentAcademicYear = academicYears.find(year => year.is_current) || academicYears[0];

  // Use mock data for courses
  const { data: courses = mockCourses, isLoading } = useQuery({
    queryKey: ['courses', currentAcademicYear?.id, profile?.school_id],
    queryFn: async () => mockCourses,
    enabled: !!profile?.school_id && !!currentAcademicYear?.id
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!currentAcademicYear) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Courses & Batches</CardTitle>
          <CardDescription>Manage courses and batches for your school</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-10 text-center">
          <GraduationCap className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold">No Academic Year Available</h3>
          <p className="text-muted-foreground mt-2 max-w-md">
            You need to create an academic year before managing courses and batches.
          </p>
          <Button className="mt-4" onClick={() => document.getElementById('academic-years')?.click()}>
            Create Academic Year
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Courses & Batches</CardTitle>
          <CardDescription>
            Managing for academic year: <Badge variant="outline" className="font-normal">{currentAcademicYear.name}</Badge>
          </CardDescription>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => {
              toast({
                title: "Feature Coming Soon",
                description: "Add Course functionality will be available soon."
              });
            }}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Course
          </Button>
          <Button
            onClick={() => {
              toast({
                title: "Feature Coming Soon",
                description: "Add Batch functionality will be available soon."
              });
            }}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Batch
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold">No Courses</h3>
            <p className="text-muted-foreground mt-2 max-w-md">
              You haven't created any courses for this academic year yet.
            </p>
            <Button className="mt-4"
              onClick={() => {
                toast({
                  title: "Feature Coming Soon",
                  description: "Create Course functionality will be available soon."
                });
              }}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Create First Course
            </Button>
          </div>
        ) : (
          <Accordion type="multiple" className="space-y-4">
            {courses.map(course => (
              <AccordionItem key={course.id} value={course.id} className="border rounded-md px-2">
                <AccordionTrigger className="py-4 px-2">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <GraduationCap className="h-5 w-5 text-primary" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold">{course.name}</h3>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-muted-foreground">
                          {course.batches?.length || 0} {course.batches?.length === 1 ? 'Batch' : 'Batches'}
                        </p>
                      </div>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-2 pb-4">
                  <BatchList 
                    batches={course.batches || []} 
                    courseId={course.id} 
                    academicYearId={currentAcademicYear.id} 
                  />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
};

export default CoursesSection;
