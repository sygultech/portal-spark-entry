
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  Settings, 
  Download,
  Printer,
  FileSpreadsheet,
  Save,
  Eye,
  Bell,
  Copy,
  RefreshCw,
  BookOpen
} from "lucide-react";
import { TimetableGridEditor } from "@/components/timetable/TimetableGridEditor";
import { TeacherScheduleView } from "@/components/timetable/TeacherScheduleView";
import { RoomAllocation } from "@/components/timetable/RoomAllocation";
import { TimetableSettings } from "@/components/timetable/TimetableSettings";
import { SubstitutionManager } from "@/components/timetable/SubstitutionManager";
import { TemplateManager } from "@/components/timetable/TemplateManager";
import { NotificationCenter } from "@/components/timetable/NotificationCenter";
import { ConflictChecker } from "@/components/timetable/ConflictChecker";
import { hasRole } from "@/utils/roleUtils";
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbSeparator 
} from "@/components/ui/breadcrumb";

const Timetable = () => {
  const { profile, isLoading } = useAuth();
  const [publishStatus, setPublishStatus] = useState<"draft" | "published">("draft");
  const [selectedTerm, setSelectedTerm] = useState("2024-25-term1");
  const [selectedClass, setSelectedClass] = useState("grade-6a");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!hasRole(profile, "school_admin")) {
    return <Navigate to="/" />;
  }

  const handleSaveDraft = () => {
    setPublishStatus("draft");
    console.log("Timetable saved as draft");
  };

  const handlePublish = () => {
    setPublishStatus("published");
    console.log("Timetable published - notifications will be sent");
  };

  const handleExport = (format: string) => {
    console.log(`Exporting timetable as ${format}`);
  };

  const handleConflictCheck = () => {
    console.log("Running conflict check");
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Breadcrumb Navigation */}
      <Breadcrumb>
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
            <BreadcrumbLink>Timetable Management</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Timetable Management</h1>
          <p className="text-muted-foreground">Create and manage class schedules, teacher assignments, and room allocations</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge 
            variant={publishStatus === "published" ? "default" : "secondary"}
            className={publishStatus === "published" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}
          >
            {publishStatus === "published" ? "Published" : "Draft"}
          </Badge>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button onClick={handleSaveDraft} variant="outline">
          <Save className="h-4 w-4 mr-2" />
          Save Draft
        </Button>
        <Button onClick={handleConflictCheck} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Check Conflicts
        </Button>
        <Button onClick={handlePublish}>
          <Eye className="h-4 w-4 mr-2" />
          Publish & Notify
        </Button>
        <Button onClick={() => handleExport("pdf")} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export PDF
        </Button>
        <Button onClick={() => handleExport("excel")} variant="outline">
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Export Excel
        </Button>
        <Button onClick={() => handleExport("print")} variant="outline">
          <Printer className="h-4 w-4 mr-2" />
          Print View
        </Button>
      </div>

      {/* Main Tabs Interface */}
      <Tabs defaultValue="grid-editor" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-8">
          <TabsTrigger value="grid-editor" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Schedule</span>
          </TabsTrigger>
          <TabsTrigger value="teacher-view" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Teachers</span>
          </TabsTrigger>
          <TabsTrigger value="rooms" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span className="hidden sm:inline">Rooms</span>
          </TabsTrigger>
          <TabsTrigger value="substitutions" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">Substitutions</span>
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <Copy className="h-4 w-4" />
            <span className="hidden sm:inline">Templates</span>
          </TabsTrigger>
          <TabsTrigger value="conflicts" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Conflicts</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Settings</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="grid-editor">
          <TimetableGridEditor selectedClass={selectedClass} selectedTerm={selectedTerm} />
        </TabsContent>
        <TabsContent value="teacher-view">
          <TeacherScheduleView selectedTerm={selectedTerm} />
        </TabsContent>
        <TabsContent value="rooms">
          <RoomAllocation selectedTerm={selectedTerm} />
        </TabsContent>
        <TabsContent value="substitutions">
          <SubstitutionManager selectedTerm={selectedTerm} />
        </TabsContent>
        <TabsContent value="templates">
          <TemplateManager />
        </TabsContent>
        <TabsContent value="conflicts">
          <ConflictChecker selectedClass={selectedClass} selectedTerm={selectedTerm} />
        </TabsContent>
        <TabsContent value="notifications">
          <NotificationCenter />
        </TabsContent>
        <TabsContent value="settings">
          <TimetableSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Timetable;
