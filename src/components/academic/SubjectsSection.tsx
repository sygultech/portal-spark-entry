
import { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, BookOpen, Tag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AcademicYear, Subject, SubjectCategory } from "@/types/academic";

const SubjectsSection = () => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("subjects");
  
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

  if (!currentAcademicYear) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subject Management</CardTitle>
          <CardDescription>Manage subjects and categories</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-10 text-center">
          <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold">No Academic Year Available</h3>
          <p className="text-muted-foreground mt-2 max-w-md">
            You need to create an academic year before managing subjects.
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
          <CardTitle>Subject Management</CardTitle>
          <CardDescription>
            Managing for academic year: <Badge variant="outline" className="font-normal">{currentAcademicYear.name}</Badge>
          </CardDescription>
        </div>
        <div className="flex gap-2">
          {activeTab === "categories" ? (
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          ) : (
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Subject
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="subjects" onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
            <TabsTrigger value="subjects">Subjects</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
          </TabsList>
          
          <TabsContent value="subjects" className="space-y-4">
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold">Subject Management</h3>
              <p className="text-muted-foreground mt-2 max-w-md">
                Add and manage subjects for different courses and batches.
              </p>
              <Button className="mt-4">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create First Subject
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="categories" className="space-y-4">
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Tag className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold">Subject Categories</h3>
              <p className="text-muted-foreground mt-2 max-w-md">
                Organize subjects by creating categories.
              </p>
              <Button className="mt-4">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create First Category
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default SubjectsSection;
