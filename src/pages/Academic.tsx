import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbSeparator 
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { 
  CalendarDays, 
  GraduationCap, 
  BookOpen, 
  FileSpreadsheet,
  ClipboardList,
  Users,
  ArrowUpRight,
  Calendar,
  Clock,
  FileText,
  Layers
} from "lucide-react";
import { useSchoolSettings } from "@/hooks/useSchoolSettings";
import AcademicYearSection from "@/components/academic/AcademicYearSection";
import CoursesSection from "@/components/academic/CoursesSection";
import SubjectsSection from "@/components/academic/SubjectsSection";
import GradingSystemsSection from "@/components/academic/GradingSystemsSection";
import ElectiveGroupsSection from "@/components/academic/ElectiveGroupsSection";

const Academic = () => {
  const { profile, isLoading } = useAuth();
  const navigate = useNavigate();
  const { school } = useSchoolSettings();
  const [activeTab, setActiveTab] = useState("academic-years");
  const [currentAcademicYearId, setCurrentAcademicYearId] = useState<string | null>(null);

  // Redirect if not school_admin
  useEffect(() => {
    if (!isLoading && profile?.role !== "school_admin") {
      navigate("/");
    }
  }, [profile, isLoading, navigate]);

  // Get current academic year ID from AcademicYearSection
  const handleCurrentAcademicYearChange = (yearId: string | null) => {
    setCurrentAcademicYearId(yearId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const academicFeatures = [
    {
      id: "academic-years",
      label: "Academic Years",
      icon: CalendarDays,
      description: "Manage academic years, terms, and semesters"
    },
    {
      id: "courses",
      label: "Courses & Batches",
      icon: GraduationCap,
      description: "Manage courses, batches, and sections"
    },
    {
      id: "subjects",
      label: "Subjects",
      icon: BookOpen,
      description: "Manage subjects and categories"
    },
    {
      id: "elective-groups",
      label: "Elective Groups",
      icon: Layers,
      description: "Manage elective subject groups"
    },
    {
      id: "timetables",
      label: "Timetables",
      icon: Clock,
      description: "Create and manage class schedules"
    },
    {
      id: "exams",
      label: "Examinations",
      icon: FileSpreadsheet,
      description: "Configure exams and assessment schedules"
    },
    {
      id: "grading",
      label: "Grading Systems",
      icon: FileText,
      description: "Set up custom grading scales and rules"
    },
    {
      id: "promotions",
      label: "Student Promotions",
      icon: ArrowUpRight,
      description: "Manage student batch promotions"
    }
  ];

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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
                <BreadcrumbLink href="/academic">Academic</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {academicFeatures.map(feature => (
          <Card 
            key={feature.id} 
            className={`cursor-pointer transition-all hover:border-primary hover:shadow-md ${
              activeTab === feature.id ? 'border-primary bg-muted/20' : ''
            }`}
            onClick={() => setActiveTab(feature.id)}
          >
            <CardHeader className="p-4">
              <div className="flex items-start justify-between">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-lg mt-2">{feature.label}</CardTitle>
              <CardDescription className="text-sm">
                {feature.description}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="mt-8">
        {activeTab === "academic-years" && <AcademicYearSection onCurrentYearChange={handleCurrentAcademicYearChange} />}
        {activeTab === "courses" && currentAcademicYearId ? (
          <CoursesSection academicYearId={currentAcademicYearId} />
        ) : activeTab === "courses" ? (
          <Card>
            <CardHeader>
              <CardTitle>Courses & Batches Management</CardTitle>
              <CardDescription>Manage your school's courses and class batches</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-10 text-center">
              <GraduationCap className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold">No Active Academic Year Selected</h3>
              <p className="text-muted-foreground mt-2 max-w-md">
                Please select or create an active academic year from the Academic Years section before managing courses.
              </p>
              <Button variant="outline" className="mt-4" onClick={() => setActiveTab("academic-years")}>
                Go to Academic Years
              </Button>
            </CardContent>
          </Card>
        ) : null}
        {activeTab === "subjects" && <SubjectsSection />}
        {activeTab === "elective-groups" && <ElectiveGroupsSection />}
        {activeTab === "grading" && <GradingSystemsSection />}
        {activeTab === "timetables" && (
          <Card>
            <CardHeader>
              <CardTitle>Timetable Management</CardTitle>
              <CardDescription>Create and manage class schedules</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-10 text-center">
              <Clock className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold">Timetable Management</h3>
              <p className="text-muted-foreground mt-2 max-w-md">
                Create and manage timetables for different batches and courses. Coming soon!
              </p>
              <Button variant="outline" className="mt-4">Coming Soon</Button>
            </CardContent>
          </Card>
        )}
        {activeTab === "exams" && (
          <Card>
            <CardHeader>
              <CardTitle>Examination Management</CardTitle>
              <CardDescription>Configure exams and assessment schedules</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-10 text-center">
              <FileSpreadsheet className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold">Examination Management</h3>
              <p className="text-muted-foreground mt-2 max-w-md">
                Set up exams, define marking schemes, and manage result publishing. Coming soon!
              </p>
              <Button variant="outline" className="mt-4">Coming Soon</Button>
            </CardContent>
          </Card>
        )}
        {activeTab === "promotions" && (
          <Card>
            <CardHeader>
              <CardTitle>Student Promotion Management</CardTitle>
              <CardDescription>Manage batch promotions for students</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-10 text-center">
              <ArrowUpRight className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold">Student Promotions</h3>
              <p className="text-muted-foreground mt-2 max-w-md">
                Promote students from one batch to another based on academic performance. Coming soon!
              </p>
              <Button variant="outline" className="mt-4">Coming Soon</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Academic;

// force update

// force update
