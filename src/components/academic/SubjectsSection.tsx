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
import SubjectList from "./SubjectList";

const SubjectsSection = () => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("all-subjects");
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
        <CardContent className="flex items-center justify-center py-10 text-center">
          <div>
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Active Academic Year</h3>
            <p className="text-sm text-muted-foreground">
              Please set an active academic year to manage subjects.
            </p>
          </div>
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
        <Tabs defaultValue="all-subjects" onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
            <TabsTrigger value="all-subjects">All Subjects</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all-subjects" className="space-y-4">
            <SubjectList academicYearId={currentAcademicYear.id} />
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
