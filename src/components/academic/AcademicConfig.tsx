
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  Copy, 
  FileSpreadsheet, 
  Download, 
  Upload, 
  Settings
} from "lucide-react";

const AcademicConfig = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  // Mock data for academic years and courses
  const academicYears = [
    { id: "1", name: "2024-2025" },
    { id: "2", name: "2023-2024" },
  ];
  
  const courses = [
    { id: "1", name: "Grade 1" },
    { id: "2", name: "Grade 2" },
    { id: "3", name: "Grade 3" },
  ];
  
  const [cloneConfig, setCloneConfig] = useState({
    source_year_id: academicYears[1].id,
    target_year_id: academicYears[0].id,
    clone_courses: true,
    clone_batches: true,
    clone_subjects: true,
    clone_grading: false,
    clone_electives: false,
  });

  const handleCloneConfigChange = (field: string, value: string | boolean) => {
    setCloneConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCloneStructure = () => {
    setLoading(true);
    
    // In a real implementation, this would call Supabase
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Academic structure cloned",
        description: `Successfully cloned academic structure from ${academicYears.find(y => y.id === cloneConfig.source_year_id)?.name} to ${academicYears.find(y => y.id === cloneConfig.target_year_id)?.name}.`,
      });
    }, 1500);
  };

  const handleDownloadTemplate = (template: string) => {
    // In a real implementation, this would download a template file
    toast({
      title: "Template downloaded",
      description: `${template} template has been downloaded.`,
    });
  };

  const handleImportData = () => {
    // In a real implementation, this would import data
    toast({
      title: "Import successful",
      description: "The data was imported successfully.",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Copy className="h-5 w-5" /> Clone Academic Structure
              </CardTitle>
              <CardDescription>
                Copy course structure, batches and subjects from previous academic year
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label>Source Academic Year</Label>
                <Select 
                  value={cloneConfig.source_year_id}
                  onValueChange={(value) => handleCloneConfigChange("source_year_id", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {academicYears.map((year) => (
                      <SelectItem key={year.id} value={year.id}>
                        {year.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label>Target Academic Year</Label>
                <Select 
                  value={cloneConfig.target_year_id}
                  onValueChange={(value) => handleCloneConfigChange("target_year_id", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {academicYears
                      .filter(year => year.id !== cloneConfig.source_year_id)
                      .map((year) => (
                        <SelectItem key={year.id} value={year.id}>
                          {year.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-3">
              <Label>Items to Clone</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="clone_courses"
                    checked={cloneConfig.clone_courses}
                    onCheckedChange={(checked) => handleCloneConfigChange("clone_courses", checked === true)}
                  />
                  <Label htmlFor="clone_courses">Courses</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="clone_batches"
                    checked={cloneConfig.clone_batches}
                    onCheckedChange={(checked) => handleCloneConfigChange("clone_batches", checked === true)}
                  />
                  <Label htmlFor="clone_batches">Batches</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="clone_subjects"
                    checked={cloneConfig.clone_subjects}
                    onCheckedChange={(checked) => handleCloneConfigChange("clone_subjects", checked === true)}
                  />
                  <Label htmlFor="clone_subjects">Subjects</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="clone_grading"
                    checked={cloneConfig.clone_grading}
                    onCheckedChange={(checked) => handleCloneConfigChange("clone_grading", checked === true)}
                  />
                  <Label htmlFor="clone_grading">Grading Systems</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="clone_electives"
                    checked={cloneConfig.clone_electives}
                    onCheckedChange={(checked) => handleCloneConfigChange("clone_electives", checked === true)}
                  />
                  <Label htmlFor="clone_electives">Elective Groups</Label>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button 
            onClick={handleCloneStructure} 
            disabled={loading || cloneConfig.source_year_id === cloneConfig.target_year_id}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                Cloning...
              </>
            ) : (
              <>Clone Structure</>
            )}
          </Button>
        </CardFooter>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" /> Bulk Import/Export
            </CardTitle>
            <CardDescription>
              Download templates and import data in bulk
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Download Templates</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                  onClick={() => handleDownloadTemplate("Courses")}
                >
                  <Download className="h-4 w-4" /> Courses Template
                </Button>
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                  onClick={() => handleDownloadTemplate("Batches")}
                >
                  <Download className="h-4 w-4" /> Batches Template
                </Button>
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                  onClick={() => handleDownloadTemplate("Subjects")}
                >
                  <Download className="h-4 w-4" /> Subjects Template
                </Button>
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                  onClick={() => handleDownloadTemplate("Students")}
                >
                  <Download className="h-4 w-4" /> Students Template
                </Button>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <Label>Import Data</Label>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Select file to import</span>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="flex items-center gap-2"
                    onClick={handleImportData}
                  >
                    <Upload className="h-4 w-4" /> Select File
                  </Button>
                </div>
                <Button onClick={handleImportData}>Import Data</Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" /> Academic Settings
            </CardTitle>
            <CardDescription>
              Configure global academic settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Default Academic Year</Label>
              <Select defaultValue={academicYears[0].id}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {academicYears.map((year) => (
                    <SelectItem key={year.id} value={year.id}>
                      {year.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Separator />
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox id="enable_audit_log" defaultChecked />
                <Label htmlFor="enable_audit_log">Enable audit logs for academic structure changes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="student_self_enroll" />
                <Label htmlFor="student_self_enroll">Allow students to self-enroll in electives</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="teacher_edit_subjects" defaultChecked />
                <Label htmlFor="teacher_edit_subjects">Allow teachers to edit their assigned subjects</Label>
              </div>
            </div>
            
            <Separator />
            
            <Button onClick={() => toast({ title: "Settings saved" })}>
              Save Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AcademicConfig;
