import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useAcademicYears } from "@/hooks/useAcademicYears";
import { useSubjectCategories } from "@/hooks/useSubjectCategories";
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
import { BookOpen } from "lucide-react";
import SubjectCategoryList from "./SubjectCategoryList";
import VerticalSubjectManager from "./VerticalSubjectManager";

const SubjectsSection = () => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("subjects");
  const { academicYears, isLoading: academicYearsLoading } = useAcademicYears();
  const { categories, isLoading: categoriesLoading } = useSubjectCategories();

  // Get current academic year
  const currentAcademicYear = academicYears.find(year => year.is_current);

  if (academicYearsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subject Management</CardTitle>
          <CardDescription>Manage subjects and categories</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-10 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

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
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            Managing for academic year: <Badge variant="outline" className="font-normal">{currentAcademicYear.name}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="subjects" onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
            <TabsTrigger value="subjects">Subjects</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
          </TabsList>
          
          <TabsContent value="subjects" className="space-y-4">
            <VerticalSubjectManager academicYearId={currentAcademicYear.id} />
          </TabsContent>
          
          <TabsContent value="categories">
            <SubjectCategoryList />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default SubjectsSection;
