
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
  Bell
} from "lucide-react";
import { ClassTimetableEditor } from "@/components/timetable/ClassTimetableEditor";
import { TeacherTimetableView } from "@/components/timetable/TeacherTimetableView";
import { RoomAllocationPanel } from "@/components/timetable/RoomAllocationPanel";
import { TimetableSettings } from "@/components/timetable/TimetableSettings";
import { SubstitutionManager } from "@/components/timetable/SubstitutionManager";
import { TemplateManager } from "@/components/timetable/TemplateManager";
import { NotificationSetup } from "@/components/timetable/NotificationSetup";
import { hasRole } from "@/utils/roleUtils";

const Timetable = () => {
  const { profile, isLoading } = useAuth();
  const [publishStatus, setPublishStatus] = useState<"draft" | "published">("draft");
  const [selectedTerm, setSelectedTerm] = useState("2024-25-term1");

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

  const handleSaveDraft = () => {
    setPublishStatus("draft");
    console.log("Timetable saved as draft");
  };

  const handlePublish = () => {
    setPublishStatus("published");
    console.log("Timetable published");
  };

  const handleExport = (format: string) => {
    console.log(`Exporting timetable as ${format}`);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
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
          
          <select 
            value={selectedTerm} 
            onChange={(e) => setSelectedTerm(e.target.value)}
            className="px-3 py-2 border rounded-md bg-background"
          >
            <option value="2024-25-term1">2024-25 Term 1</option>
            <option value="2024-25-term2">2024-25 Term 2</option>
            <option value="2024-25-term3">2024-25 Term 3</option>
          </select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button onClick={handleSaveDraft} variant="outline">
          <Save className="h-4 w-4 mr-2" />
          Save Draft
        </Button>
        <Button onClick={handlePublish}>
          <Eye className="h-4 w-4 mr-2" />
          Publish
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
      <Tabs defaultValue="class-timetable" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
          <TabsTrigger value="class-timetable" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Classes</span>
          </TabsTrigger>
          <TabsTrigger value="teacher-view" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Teachers</span>
          </TabsTrigger>
          <TabsTrigger value="rooms" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span className="hidden sm:inline">Rooms</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Settings</span>
          </TabsTrigger>
          <TabsTrigger value="substitutions" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">Substitutions</span>
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            <span className="hidden sm:inline">Templates</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="class-timetable">
          <ClassTimetableEditor />
        </TabsContent>

        <TabsContent value="teacher-view">
          <TeacherTimetableView />
        </TabsContent>

        <TabsContent value="rooms">
          <RoomAllocationPanel />
        </TabsContent>

        <TabsContent value="settings">
          <TimetableSettings />
        </TabsContent>

        <TabsContent value="substitutions">
          <SubstitutionManager />
        </TabsContent>

        <TabsContent value="templates">
          <TemplateManager />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationSetup />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Timetable;
