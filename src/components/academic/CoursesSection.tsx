
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
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
  Edit,
  Trash,
  Users,
  BookOpen
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Course, Batch, AcademicYear } from "@/types/academic";
import BatchList from "./BatchList";

const CoursesSection = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch academic years
  const { data: academicYears = [] } = useQuery({
    queryKey: ['academicYears', profile?.school_id],
    queryFn: async () => {
      if (!profile?.school_id) throw new Error("School ID is required");
      
      const { data, error } = await supabase
        .from('academic_years')
        .select('*')
        .eq('school_id', profile.school_id)
        .order('is_current', { ascending: false })
        .order('start_date', { ascending: false });
        
      if (error) throw error;
      return data as AcademicYear[];
    },
    enabled: !!profile?.school_id
  });

  // Get current academic year
  const currentAcademicYear = academicYears.find(year => year.is_current) || academicYears[0];

  // Fetch courses
  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['courses', currentAcademicYear?.id, profile?.school_id],
    queryFn: async () => {
      if (!profile?.school_id || !currentAcademicYear?.id) {
        return [];
      }
      
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          batches:batches(*)
        `)
        .eq('school_id', profile.school_id)
        .eq('academic_year_id', currentAcademicYear.id)
        .order('name');
        
      if (error) throw error;
      return data as (Course & { batches: Batch[] })[];
    },
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
          <Button variant="outline">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Course
          </Button>
          <Button>
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
            <Button className="mt-4">
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
